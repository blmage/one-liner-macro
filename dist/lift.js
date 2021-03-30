"use strict";

exports.__esModule = true;
exports.default = void 0;

var _util = require("./util");

var _default = (t, refs) => {
  refs.forEach(referencePath => {
    const parentPath = referencePath.parentPath;

    if (!parentPath.isCallExpression()) {
      (0, _util.throwFrameError)(referencePath, '`lift` can only be used as a call expression');
    }

    const args = parentPath.get('arguments');

    if (args.length !== 1) {
      (0, _util.throwFrameError)(referencePath, '`lift` accepts a single expression as its only argument');
    } // `lift` exists simply to stop upward traversal of placeholders
    // which at this point have already been transformed, so we just
    // remove the `lift` call and replace it with its argument


    parentPath.replaceWith(args[0]);
  });
};

exports.default = _default;