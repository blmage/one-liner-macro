"use strict";

exports.__esModule = true;
exports.default = void 0;

var _babelPluginMacros = require("babel-plugin-macros");

var _placeholders = _interopRequireDefault(require("./placeholders"));

var _implicitParameters = _interopRequireDefault(require("./implicit-parameters"));

var _lift = _interopRequireDefault(require("./lift"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (0, _babelPluginMacros.createMacro)(({
  references,
  state,
  babel: {
    types: t
  }
}) => {
  // `it` needs to be transformed before `_` to allow them to work together
  if (references.it) (0, _implicitParameters.default)(t, references.it);
  if (references.default) (0, _implicitParameters.default)(t, references.default);
  const indexedReferences = {};
  let hasIndexedReferences = false;

  for (let n = 1; n <= 9; n++) {
    if (references[`_${n}`]) {
      hasIndexedReferences = true;
      indexedReferences[n] = references[`_${n}`];
    }
  }

  if (references._ || hasIndexedReferences) {
    (0, _placeholders.default)(t, references._ || [], indexedReferences);
  } // `lift` needs to be transformed after `_` so placeholders
  // can use its presence to stop upward traversal
  // after placeholders are transformed, all that happens is
  // that each `lift` call is replaced by its sole argument


  if (references.lift) (0, _lift.default)(t, references.lift);
});

exports.default = _default;