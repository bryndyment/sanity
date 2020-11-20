import promptForDatasetName from '../../actions/dataset/datasetNamePrompt'
import promptForDatasetAliasName from '../../actions/dataset-alias/datasetAliasNamePrompt'
import validateDatasetAliasName from '../../actions/dataset-alias/validateDatasetAliasName'
import validateDatasetName from '../../actions/dataset/validateDatasetName'
import * as aliasClient from './datasetAliasesClient'

const helpText = `
Examples
  sanity dataset-alias link
  sanity dataset-alias link <alias-name>
  sanity dataset-alias link <alias-name> <target-dataset>
`

export default {
  name: 'link',
  group: 'dataset-alias',
  signature: '[NAME, TARGET_DATASET]',
  helpText,
  description: 'Link a dataset to a dataset alias within your project',
  action: async (args, context) => {
    const {apiClient, output, prompt} = context
    const [alias, targetDataset] = args.argsWithoutOptions
    const client = apiClient()

    const nameError = alias && validateDatasetAliasName(alias)
    if (nameError) {
      throw new Error(nameError)
    }

    const [datasets, aliases] = await Promise.all([
      client.datasets.list().then(sets => sets.map(ds => ds.name)),
      aliasClient.listAliases(client).then(sets => sets.map(ds => ds.name))
    ])

    const aliasName = await (alias || promptForDatasetAliasName(prompt))
    if (!aliases.includes(aliasName)) {
      throw new Error(`Dataset alias "${aliasName}" does not exist `)
    }

    const datasetName = await (targetDataset || promptForDatasetName(prompt))
    const datasetErr = validateDatasetName(datasetName)
    if (datasetErr) {
      throw new Error(datasetErr)
    }

    if (!datasets.includes(datasetName)) {
      throw new Error(`Dataset "${datasetName}" does not exist `)
    }

    try {
      await aliasClient.updateAlias(client, aliasName, datasetName)
      output.print(`Dataset alias ${aliasName} linked to ${datasetName} successfully`)
    } catch (err) {
      throw new Error(`Dataset alias link failed:\n${err.message}`)
    }
  }
}
