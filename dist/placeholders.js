"use strict";

exports.__esModule = true;
exports.default = void 0;

var _util = require("./util");

var _default = (t, refs, indexedRefs) => {
  const hoistTargets = [];

  for (var _i = 0, _Object$entries = Object.entries(indexedRefs); _i < _Object$entries.length; _i++) {
    const _Object$entries$_i = _Object$entries[_i],
          index = _Object$entries$_i[0],
          indexRefs = _Object$entries$_i[1];
    indexRefs.forEach(referencePath => {
      var _referencePath, _callee, _tail;

      const caller = (0, _util.findTargetExpression)(referencePath);

      if (!caller) {
        (0, _util.throwFrameError)(referencePath, 'Indexed placeholders must be used as function arguments or the\n' + 'right side of a variable declaration, ie. `const eq = _1 === _2`');
      }

      if (referencePath.parentPath.isSpreadElement()) {
        (0, _util.throwFrameError)(referencePath, 'Indexed placeholders do not support spread syntax');
      }

      const callee = (0, _util.findTargetCallee)(referencePath);
      const wrapper = (0, _util.findWrapper)(callee) || (0, _util.findWrapper)(referencePath);
      const params = (wrapper === null || wrapper === void 0 ? void 0 : wrapper.node.params) || [];

      for (let i = params.length; i < index; i++) {
        params.push(caller.scope.generateUidIdentifier('arg'));
      }

      referencePath.replaceWith(params[index - 1]);
      _referencePath = referencePath, (0, _util.markPlaceholder)(_referencePath);
      _callee = callee, (0, _util.markPlaceholder)(_callee);

      if (wrapper) {
        return;
      } // track this as a location where parameters may need to be hoisted


      hoistTargets.push(caller); // make sure tail paths are kept inside the wrapper
      // (i.e. trailing member expressions like `foo(_1).name`)

      const tail = (0, _util.findTopmostLink)(caller); // create an arrow function that wraps and returns the expression
      // generating an arrow maintains lexical `this`

      const fn = t.arrowFunctionExpression(params, t.blockStatement([t.returnStatement(tail.node)])); // replace the expression with the new wrapper that returns it

      tail.replaceWith(fn); // mark the replacement so we can tell that it used to be a placeholder

      _tail = tail, (0, _util.markPlaceholder)(_tail);
      tail.hasIndexedPlaceholders = true;
    });
  }

  refs.forEach(referencePath => {
    var _referencePath2, _callee2, _tail2;

    const caller = (0, _util.findTargetExpression)(referencePath);

    if (!caller) {
      (0, _util.throwFrameError)(referencePath, 'Placeholders must be used as function arguments or the\n' + 'right side of a variable declaration, ie. `const eq = _ === _`');
    }

    const callee = (0, _util.findTargetCallee)(referencePath);
    const wrapper = (0, _util.findWrapper)(callee) || (0, _util.findWrapper)(referencePath);

    if (wrapper !== null && wrapper !== void 0 && wrapper.hasIndexedPlaceholders && !referencePath.parentPath.isSpreadElement()) {
      (0, _util.throwFrameError)(referencePath, 'Placeholders can not be mixed with indexed placeholders,\n' + 'unless spread in last position, ie. `doSomething(_1, _2, ..._)`');
    } // generate a unique name and replace existing references with it


    const id = caller.scope.generateUidIdentifier('arg');
    const param = (0, _util.getParamNode)(t, referencePath, id);
    referencePath.replaceWith(id);
    _referencePath2 = referencePath, (0, _util.markPlaceholder)(_referencePath2);
    _callee2 = callee, (0, _util.markPlaceholder)(_callee2);

    if (wrapper) {
      // we've already wrapped this expression so simply add
      // the above id to the existing wrapper's parameter list
      wrapper.node.params.push(param);
      return;
    } // track this as a location where parameters may need to be hoisted


    hoistTargets.push(caller); // make sure tail paths are kept inside the wrapper
    // (i.e. trailing member expressions like `foo(_).name`)

    const tail = (0, _util.findTopmostLink)(caller); // create an arrow function that wraps and returns the expression
    // generating an arrow maintains lexical `this`

    const fn = t.arrowFunctionExpression([param], t.blockStatement([t.returnStatement(tail.node)])); // replace the expression with the new wrapper that returns it

    tail.replaceWith(fn); // mark the replacement so we can tell that it used to be a placeholder

    _tail2 = tail, (0, _util.markPlaceholder)(_tail2);
  });
  hoistTargets.forEach((_arg) => {
    return (0, _util.hoistArguments)(t, _arg);
  });
};

exports.default = _default;