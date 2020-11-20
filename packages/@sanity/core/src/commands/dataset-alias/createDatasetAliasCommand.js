import promptForDatasetName from '../../actions/dataset/datasetNamePrompt'
import promptForDatasetAliasName from '../../actions/dataset-alias/datasetAliasNamePrompt'
import validateDatasetAliasName from '../../actions/dataset-alias/validateDatasetAliasName'
import validateDatasetName from '../../actions/dataset/validateDatasetName'
import * as aliasClient from './datasetAliasesClient'

const helpText = `
Examples
  sanity dataset-alias create
  sanity dataset-alias create <alias-name>
  sanity dataset-alias create <alias-name> <target-dataset>
`

export default {
  name: 'create',
  group: 'dataset-alias',
  signature: '[NAME, TARGET_DATASET]',
  helpText,
  description: 'Create a new dataset alias within your project',
  action: async (args, context) => {
    const {apiClient, output, prompt} = context
    const [alias, targetDataset] = args.argsWithoutOptions
    const client = apiClient()

    const nameError = alias && validateDatasetAliasName(alias)
    if (nameError) {
      throw new Error(nameError)
    }

    const [datasets, aliases, projectFeatures] = await Promise.all([
      client.datasets.list().then(sets => sets.map(ds => ds.name)),
      aliasClient.listAliases(client).then(sets => sets.map(ds => ds.name)),
      client.request({uri: '/features'})
    ])

    const aliasName = await (alias || promptForDatasetAliasName(prompt))
    if (aliases.includes(aliasName)) {
      throw new Error(`Dataset alias "${aliasName}" already exists`)
    }

    if (targetDataset) {
      const datasetErr = validateDatasetName(targetDataset)
      if (datasetErr) {
        throw new Error(datasetErr)
      }
    }

    const datasetName = await (targetDataset || promptForDatasetName(prompt))
    if (datasetName && !datasets.includes(datasetName)) {
      throw new Error(`Dataset "${datasetName}" does not exist `)
    }

    const canCreateAlias = projectFeatures.includes('advancedDatasetManagement')
    if (!canCreateAlias) {
      throw new Error(`This project cannot create a dataset alias`)
    }

    try {
      await aliasClient.createAlias(client, aliasName, datasetName)
      output.print(
        `Dataset alias ${aliasName} created ${datasetName &&
          `and linked to ${datasetName}`} successfully`
      )
    } catch (err) {
      throw new Error(`Dataset alias creation failed:\n${err.message}`)
    }
  }
}
