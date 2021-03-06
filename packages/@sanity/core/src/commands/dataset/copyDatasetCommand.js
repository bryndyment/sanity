import EventSource from '@sanity/eventsource'
import {Observable} from 'rxjs'
import chalk from 'chalk'
import promptForDatasetName from '../../actions/dataset/datasetNamePrompt'
import validateDatasetName from '../../actions/dataset/validateDatasetName'
import debug from '../../debug'

const helpText = `
Options
  --detach Start the copy without waiting for it to finish
  --attach <job-id> Attach to the running copy process to show progress

Examples
  sanity dataset copy
  sanity dataset copy <source-dataset>
  sanity dataset copy <source-dataset> <target-dataset>
  sanity dataset copy --detach <source-dataset> <target-dataset>
  sanity dataset copy --attach <job-id>
`

const progress = (url) => {
  return new Observable((observer) => {
    const progressSource = new EventSource(url)

    function onError(error) {
      progressSource.close()
      observer.error(error)
    }

    function onMessage(event) {
      const data = JSON.parse(event.data)
      if (data.state === 'failed') {
        debug(`Job failed. Data: ${event}`)
        observer.error(event)
      } else if (data.state === 'completed') {
        debug(`Job succeeded. Data: ${event}`)
        onComplete()
      } else {
        debug(`Job progressed. Data: ${event}`)
        observer.next(data)
      }
    }

    function onComplete() {
      progressSource.removeEventListener('error', onError)
      progressSource.removeEventListener('channelError', onError)
      progressSource.removeEventListener('job', onMessage)
      progressSource.removeEventListener('done', onComplete)
      progressSource.close()
      observer.complete()
    }

    progressSource.addEventListener('error', onError)
    progressSource.addEventListener('channelError', onError)
    progressSource.addEventListener('job', onMessage)
    progressSource.addEventListener('done', onComplete)
  })
}

const followProgress = (jobId, client, output) => {
  const spinner = output
    .spinner({
      text: `Copy in progress: 0%`,
    })
    .start()

  const listenUrl = client.getUrl(`jobs/${jobId}/listen`)

  debug(`Listening to ${listenUrl}`)

  progress(listenUrl).subscribe({
    next: (event) => {
      const eventProgress = event.progress ? event.progress : 0

      spinner.text = `Copy in progress: ${eventProgress}%`
    },
    error: () => {
      spinner.fail('There was an error copying the dataset.')
    },
    complete: () => {
      spinner.succeed(`Copy finished.`)
    },
  })
}

export default {
  name: 'copy',
  group: 'dataset',
  signature: '[SOURCE_DATASET] [TARGET_DATASET]',
  helpText,
  description: 'Copies a dataset including its assets to a new dataset',
  action: async (args, context) => {
    const {apiClient, output, prompt} = context
    const flags = args.extOptions
    const client = apiClient()

    if (flags.attach) {
      const jobId = flags.attach

      if (!jobId) {
        throw new Error('Please supply a jobId')
      }

      followProgress(jobId, client, output)

      return
    }

    const [sourceDataset, targetDataset] = args.argsWithoutOptions

    const nameError = sourceDataset && validateDatasetName(sourceDataset)
    if (nameError) {
      throw new Error(nameError)
    }

    const existingDatasets = await client.datasets
      .list()
      .then((datasets) => datasets.map((ds) => ds.name))

    const sourceDatasetName = await (sourceDataset ||
      promptForDatasetName(prompt, {message: 'Source dataset name:'}))
    if (!existingDatasets.includes(sourceDatasetName)) {
      throw new Error(`Source dataset "${sourceDatasetName}" doesn't exist`)
    }

    const targetDatasetName = await (targetDataset ||
      promptForDatasetName(prompt, {message: 'Target dataset name:'}))
    if (existingDatasets.includes(targetDatasetName)) {
      throw new Error(`Target dataset "${targetDatasetName}" already exists`)
    }

    const err = validateDatasetName(targetDatasetName)
    if (err) {
      throw new Error(err)
    }

    try {
      const response = await client.request({
        method: 'PUT',
        uri: `/datasets/${sourceDatasetName}/copy`,
        body: {targetDataset: targetDatasetName},
      })

      output.print(
        `Copying dataset ${chalk.green(sourceDatasetName)} to ${chalk.green(targetDatasetName)}...`
      )

      if (flags.detach) {
        output.print(`Copy initiated.`)
        output.print(
          `\nRun:\n\n    sanity dataset copy --attach ${response.jobId}\n\nto watch attach`
        )

        return
      }

      followProgress(response.jobId, client, output)
    } catch (error) {
      if (error.statusCode) {
        output.print(`${chalk.red(`Dataset copying failed:\n${error.response.body.message}`)}\n`)
      } else {
        output.print(`${chalk.red(`Dataset copying failed:\n${error.message}`)}\n`)
      }
    }
  },
}
