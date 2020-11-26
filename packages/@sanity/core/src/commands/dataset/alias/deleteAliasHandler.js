import validateDatasetAliasName from '../../../actions/dataset/alias/validateDatasetAliasName'
import * as aliasClient from './datasetAliasesClient'

export default async (args, context) => {
  const {apiClient, prompt, output} = context
  const [, ds] = args.argsWithoutOptions
  const client = apiClient()
  if (!ds) {
    throw new Error('Dataset alias name must be provided')
  }

  const alias = `${ds}`
  const dsError = validateDatasetAliasName(alias)
  if (dsError) {
    throw dsError
  }

  await prompt.single({
    type: 'input',
    message:
      'Are you ABSOLUTELY sure you want to delete this dataset alias?\n  Type the name of the dataset alias to confirm delete: ',
    filter: input => `${input}`.trim(),
    validate: input => {
      return input === alias || 'Incorrect dataset alias name. Ctrl + C to cancel delete.'
    }
  })

  return aliasClient.removeAlias(client, alias).then(() => {
    output.print('Dataset alias deleted successfully')
  })
}
