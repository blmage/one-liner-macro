import { _, it } from 'param.macro'

import { availablePlugins, transform } from '@citycide/babel-standalone/dist/babel.min'
import prettier from 'prettier/standalone'
import babylon from 'prettier/parser-babylon'
import highlight from 'highlight.js/lib/highlight'
import javascript from 'highlight.js/lib/languages/javascript'
import debounce from 'lodash.debounce'
import prettyFormat from 'pretty-format'
import split from 'split.js'
import { Tour } from 'tether-shepherd'
import lz from 'lz-string'

import plugin from '../../plugin'
import readme from '../../readme.md'

const getStorage = key => {
  try {
    return window.localStorage.getItem(key) |> JSON.parse
  } catch {}
}

const setStorage = (key, value) => {
  try {
    return window.localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

const $ = document.querySelector(_)

const helpButton = $('.right .material-icons.help')
const helpModal = $('#help-modal')
const helpModalBody = $('#help-modal .body')
const closeButton = $('#help-modal .close')
const topButton = $('#help-modal .top-button-wrapper')

helpModalBody.innerHTML = readme
highlight.registerLanguage('javascript', javascript)
highlight.initHighlightingOnLoad()

const codeBlocks = document.querySelectorAll('code.language-js')

const getQueryProp = name => {
  const regex = new RegExp(`[?&]${name}=([^&]*)`)
  const hasMatch = regex.exec(window.location.search)
  return hasMatch && decodeURIComponent(hasMatch[1].replace(/\+/g, ' '))
}

const removeQueryProp = parameter => {
  const url = window.location.href
  const parts = url.split('?')
  if (parts.length < 2) return

  const prefix = encodeURIComponent(parameter) + '='
  const props = parts[1].split(/[&;]/g)

  for (let i = props.length; i-- > 0;) {
    if (props[i].lastIndexOf(prefix, 0) !== -1) {
      props.splice(i, 1)
    }
  }

  return parts[0] + (props.length > 0 ? '?' + props.join('&') : '')
}

const setModalState = state => {
  const isVisible = helpModal.style.visibility === 'visible'

  if (!!isVisible === !!state) return

  if (state) {
    helpModal.style.visibility = 'visible'
    helpModal.classList.add('visible')
    if (!getQueryProp('readme')) {
      setURL(window.location.href + '?readme=true')
    }
  } else {
    setURL(removeQueryProp('readme'))
    helpModal.classList.remove('visible')

    setTimeout(() => {
      helpModal.style.visibility = 'hidden'
    }, 250)
  }
}

const setURL = url => {
  if (window.history.pushState) {
    window.history.pushState('', '', url)
  } else {
    window.location.href = url
  }
}

const checkQuery = () =>
  setModalState(!!getQueryProp('readme'))

const checkScroll = () =>
  helpModalBody.scrollTop >= 1000
    ? topButton.style.bottom = '1rem'
    : topButton.style.bottom = '-3.5rem'

checkQuery()
checkScroll()

window.addEventListener('popstate', checkQuery)
helpModalBody.addEventListener('scroll', debounce(checkScroll, 200))
topButton.addEventListener('click', () => helpModalBody.scrollTop = 0)

helpButton.addEventListener('click', () => setModalState(true))
closeButton.addEventListener('click', () => setModalState(false))

const loadRunButtons = (editor, compiled, result) => {
  helpModal.addEventListener('click', ({ target }) => {
    if (target.className !== 'send-to-editor') {
      if (target.parentElement.className === 'send-to-editor') {
        target = target.parentElement
      } else {
        return
      }
    }

    result.setValue('')
    editor.setValue(
      target.parentElement.textContent
        .split('\n')
        .slice(0, -3)
        .join('\n')
    )

    editor.clearSelection()
    setModalState(false)
  })

  for (const block of codeBlocks) {
    const button = document.createElement('button')
    button.type = 'button'
    button.innerHTML = `
      <i class="material-icons">mode_edit</i>
      <span class="send-to-editor-label">send to editor</span>
    `
    button.className = 'send-to-editor'
    block.appendChild(button)
  }
}

split(['#editor-wrapper', '#output-wrapper'])
split(['#compiled-wrapper', '#console-wrapper'], {
  direction: 'vertical',
  sizes: [85, 15]
})

const getHashCode = hash =>
  hash.startsWith('#code')
    ? hash.slice(6) |> lz.decompressFromEncodedURIComponent
    : ''

const setHashCode = hash =>
  location.hash = `code/${lz.compressToEncodedURIComponent(hash)}`

window.addEventListener('hashchange', () => {
  const hashCode = getHashCode(location.hash)
  if (hashCode) {
    const pos = editor.getSelection().getCursor()
    editor.setValue(hashCode)
    editor.clearSelection()
    editor.moveCursorToPosition(pos)
    handleCodeChange()
  }
}, false)

const loadEditors = state => {
  const [editor, compiled, result] = [
    ace.edit('editor'),
    ace.edit('compiled'),
    ace.edit('console')
  ]

  // set common options for all editors
  for (const target of [editor, compiled, result]) {
    target.setTheme('ace/theme/tomorrow')
    target.session.setMode('ace/mode/javascript')
    target.session.setUseWorker(false)
    target.setHighlightActiveLine(false)
    target.setHighlightGutterLine(false)
    target.$blockScrolling = Infinity
  }

  // set individual editor options
  compiled.setReadOnly(true)

  editor.session.setUseSoftTabs(true)
  editor.session.setTabSize(2)

  result.setShowPrintMargin(false)
  result.renderer.setShowGutter(false)
  result.setReadOnly(true)

  const hashCode = getHashCode(location.hash)

  if (hashCode) {
    editor.setValue(hashCode)
    editor.clearSelection()
    setTimeout(() => handleCodeChange(), 10)
  } else if (state) {
    editor.setValue(state.editor)
    compiled.setValue(state.compiled)
    result.setValue(state.result)

    ;[editor, compiled, result].forEach(it.clearSelection())
  }

  return { editor, compiled, result }
}

const { editor, compiled, result } = loadEditors(getStorage('editorState'))

loadRunButtons(editor, compiled, result)

if (!getStorage('tourComplete')) {
  const isReadmeURL = getQueryProp('readme')
  if (isReadmeURL) removeQueryProp('readme')

  closeButton.click()

  const tour = new Tour({
    defaults: {
      classes: 'shepherd-theme-square',
      scrollTo: true,
      showCancelLink: true
    }
  })

  tour.addStep('readme-button', {
    title: `docs are just a click away`,
    text:
      `These editors make it easy to try out the plugin. ` +
      `If you need help or just a quick reference, ` +
      `click the <i class="material-icons">help</i> button.<br/><br/>` +
      `<i>you will only see this once</i>`,
    attachTo: {
      element: helpButton,
      on: 'bottom'
    },
    buttons: [{
      text: 'next',
      action: () =>
        tour.next()
    }]
  })

  tour.addStep('github-reference', {
    title: `easily head to the GitHub repo`,
    text:
      `The plugin is open source on GitHub! Check it out ` +
      `if you would like to contribute or ` +
      `<i class="material-icons" style="padding-right: 2px;">star</i>` +
      `the project to throw some good vibes.`,
    attachTo: {
      element: helpButton,
      on: 'bottom'
    },
    buttons: [{
      text: 'next',
      action: () => {
        helpButton.click()
        return tour.next()
      }
    }]
  })

  tour.addStep('back-to-app-button', {
    title: `back to the editor`,
    text:
      'With the readme open, click a `send to editor` button ' +
      'to easily try any example code.<br><br>' +
      `If you want to return to the editor, click ` +
      `<i class="material-icons">exit_to_app</i> to close the readme.`,
    attachTo: {
      element: closeButton,
      on: 'bottom'
    },
    buttons: [{
      text: 'next',
      action: () => {
        if (!isReadmeURL) closeButton.click()
        return tour.next()
      }
    }]
  })

  tour.addStep('shareable-links', {
    title: 'sharable links are automatic',
    text:
      `This page's URL is automatically updated as you type, so if ` +
      'you want to share this code, just copy from your address bar!',
    attachTo: {
      element: helpButton,
      on: 'bottom'
    },
    buttons: [{
      text: 'done',
      action: () =>
        tour.complete()
    }]
  })

  const completeTour = () =>
    setStorage('tourComplete', true)

  tour.once('cancel', completeTour)
  tour.once('complete', completeTour)

  tour.start()
}

const logLineReducer = (list, line, i, col) => {
  if (i === 0 && line.trim() === 'Array [') {
    col.splice(-1, 1)
    return list
  }

  const end = line.endsWith(',') ? -1 : line.length
  const add = line.slice(0, end).trim()
  return `${list}${add ? ' ' : ''}${add}`.trim()
}

const logger = ({ types: t }) => {
  return {
    visitor: {
      Program (path) {
        const body = path.get('body')
        const last = body[body.length - 1]

        if (
          !last.isExpression() &&
          !last.isExpressionStatement()
        ) return

        const final = eval(last.hub.file.code)
        if (final == null) return

        const current = result.getValue()
        const pre = current ? current + '\n' : current
        result.setValue(`${pre}=> ${prettyFormat(final)}`)
        console.log(final)
      }
    }
  }
}

const tryEval = debounce(input => {
  result.setValue('')
  console.clear()

  let runnable
  try {
    runnable = transform(input, {
      presets: [
        'all'
      ]
    }).code
  } catch (e) {
    console.error(e)
    result.setValue(e.message)
    return
  }

  try {
    const capturer = Object.create(console)

    let output = ''
    for (const key of ['error', 'log', 'info', 'debug']) {
      capturer[key] = (...args) => {
        if (args.length) {
          const str = prettyFormat(args)
          const addition = str.split('\n').reduce(logLineReducer, '')
          if (output) output += '\n' + addition
          else output += addition
        }
      }
    }

    Function('console', runnable)(capturer)
    if (output) result.setValue(output)
    else result.setValue('')

    transform(runnable, {
      plugins: [logger]
    })
  } catch (e) {
    console.error(e)
    result.setValue(e.message)
  } finally {
    result.clearSelection()
  }
}, 200)

const persist = debounce(state => {
  const code = editor.getValue()
  setHashCode(code)

  return setStorage(
    'editorState',
    state || {
      editor: code,
      compiled: compiled.getValue(),
      result: result.getValue()
    }
  )
}, 1000)

const syntaxPlugins = Object.keys(availablePlugins)
  .filter(it.startsWith('syntax') && it !== 'syntax-flow')
  .map(it === 'syntax-decorators' ? [it, { decoratorsBeforeExport: false }] : it)
  .map(it === 'syntax-pipeline-operator' ? [it, { proposal: 'minimal' }] : it)

const compilerPlugins = [...syntaxPlugins, plugin]

const compileSource = transform(_, {
  presets: [],
  plugins: compilerPlugins
}).code

const formatCompiled = prettier.format(_, {
  parser: 'babylon',
  plugins: [babylon],
  printWidth: 50,
  useTabs: false,
  tabWidth: 2,
  singleQuote: true,
  semi: false
})

const handleCodeChange = () => {
  const pos = editor.getSelection().getCursor()
  const source = editor.getValue()

  let initial
  try {
    initial = compileSource(source)
  } catch (e) {
    console.log(e)
    compiled.setValue(e.message)
  } finally {
    compiled.clearSelection()
  }

  if (!initial) return

  initial |> formatCompiled |> compiled.setValue
  compiled.clearSelection()
  tryEval(initial)
  persist()
  editor.moveCursorToPosition(pos)
}

editor.getSession().on('change', debounce(handleCodeChange, 200))
