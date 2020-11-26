import promptForDatasetAliasName from '../../../actions/dataset/alias/datasetAliasNamePrompt'
import validateDatasetAliasName from '../../../actions/dataset/alias/validateDatasetAliasName'
import * as aliasClient from './datasetAliasesClient'

export default async (args, context) => {
  const {apiClient, output, prompt} = context
  const [, alias] = args.argsWithoutOptions
  const client = apiClient()

  const nameError = alias && validateDatasetAliasName(alias)
  if (nameError) {
    throw new Error(nameError)
  }

  const [fetchedAliases] = await Promise.all([aliasClient.listAliases(client)])
  const aliases = fetchedAliases.map(da => da.name)

  const aliasName = await (alias || promptForDatasetAliasName(prompt))
  if (!aliases.includes(aliasName)) {
    throw new Error(`Dataset alias "${aliasName}" does not exist `)
  }

  const linkedAlias = fetchedAliases.find(elem => elem.name === aliasName)

  if (linkedAlias) {
    if (!linkedAlias.datasetName) {
      throw new Error(`Dataset alias "${aliasName}" is not linked to a dataset`)
    }

    await prompt.single({
      type: 'input',
      message: `This alias is linked to dataset <${linkedAlias.datasetName}>. Are you ABSOLUTELY sure you want to unlink this this dataset from the dataset alias?
        \n  Type YES/NO: `,
      filter: input => `${input}`.toLowerCase(),
      validate: input => {
        return input === 'yes' || 'Ctrl + C to cancel dataset alias unlink.'
      }
    })
  }

  try {
    const result = await aliasClient.unlinkAlias(client, aliasName)
    output.print(`Dataset alias ${aliasName} unlinked from ${result.datasetName} successfully`)
  } catch (err) {
    throw new Error(`Dataset alias link failed:\n${err.message}`)
  }
}
