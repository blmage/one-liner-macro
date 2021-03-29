import { createMacro } from 'babel-plugin-macros'

import transformPlaceholders from './placeholders'
import transformImplicitParams from './implicit-parameters'
import transformLift from './lift'

export default createMacro(({ references, state, babel: { types: t } }) => {
  // `it` needs to be transformed before `_` to allow them to work together

  if (references.it) transformImplicitParams(t, references.it)
  if (references.default) transformImplicitParams(t, references.default)

  const indexedReferences = {}
  let hasIndexedReferences = false

  for (let n = 1; n <= 9; n++) {
    if (references[`_${n}`]) {
      hasIndexedReferences = true
      indexedReferences[n] = references[`_${n}`]
    }
  }

  if (references._ || hasIndexedReferences) {
    transformPlaceholders(t, references._ || [], indexedReferences)
  }

  // `lift` needs to be transformed after `_` so placeholders
  // can use its presence to stop upward traversal
  // after placeholders are transformed, all that happens is
  // that each `lift` call is replaced by its sole argument
  if (references.lift) transformLift(t, references.lift)
})
