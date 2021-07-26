import chalk from 'chalk'
import { outputMode } from './args'
import { getOptions, getState, setState } from './shared'
import { getMessageText } from './out'
/*
 * Progressbar and detail rendering
 */

const options = getOptions()

const addProgressStep = message => {
  setState('messages', [...getState('messages'), message])
}

// TODO: memoize sections of this (e.g. paging)
const updateProgress = (note: string = '...'): void => {
  const messages = getState('messages')
  const paging = getOptions().paging
  let numMessages: number = 4
  let prog: string = ''
  let messageHistory: string = ''
  let rest: string = ''
  let until = numMessages + options.entityList.length - messages.length
  for (let l = 1; l <= until; l++) {
    rest += '   '
  }
  messages.map((msg, m) => {
    prog += '==='
    messageHistory +=
      m + 1 === messages.length
        ? `\n\n          ✓ ${chalk.bold(chalk.greenBright(msg))}`
        : `\n\n          ✓ ${msg}`
  })
  if (!options.debug) {
    console.clear()
  }
  console.log(
    `\n\n\n   [${chalk.bgGreen(chalk.green(prog))}${rest}]\n\n\n
    ${getMessageText().commandBanner(
      options.entityList,
      paging,
      outputMode,
      note
    )}`,
    chalk.green(messageHistory)
  )
}
const advanceRowProgress = (
  data: any,
  activity: string[],
  counter: number,
  entity: string,
  totalRows: number,
  messages
): void => {
  if (options.debug) {
    return
  }
  if (data.id % 7 === 0) {
    let note = `${activity[counter < 4 ? (counter = counter++) : 0]} `
    note += `Migrating ${chalk.inverse(entity)} - row ${totalRows} `

    if (data?.fields) {
      note += data.fields[0]?.value ? `(${data?.fields[0]?.value})` : '...'
    }
    // running all conversations? This is gonna take a sec.
    if (
      entity === 'conversations' &&
      options.paging[0] === 0 &&
      !!!options.paging[1]
    ) {
      note +=
        '(BUCKLE UP, this step can take upwards of 5 - 10 minutes depending on your machine)'
    }
    updateProgress(note)
  }
}

export { addProgressStep, updateProgress, advanceRowProgress }
