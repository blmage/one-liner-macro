"use strict";

exports.__esModule = true;
exports.getParamNode = exports.hoistArguments = exports.shouldHoist = exports.findWrapper = exports.findTopmostLink = exports.findTargetExpression = exports.findParentUntil = exports.findTargetCaller = exports.findTargetCallee = exports.wasMacro = exports.markPlaceholder = exports.throwFrameError = void 0;

var _ref;

const nonHoistTypes = new Set(['Identifier', 'ArrayExpression', 'ObjectExpression', 'FunctionExpression', 'ArrowFunctionExpression']);

const isPipeline = (path, child, side = 'right') => {
  if (side !== 'right' && side !== 'left') {
    throw new RangeError('Expected side to be one of "left" or "right"');
  }

  return path.isBinaryExpression({
    operator: '|>'
  }) && (!child || path.get(side) === child);
};

const throwFrameError = (path, msg) => {
  throw path.buildCodeFrameError(`\n\n${msg}\n\n`);
};

exports.throwFrameError = throwFrameError;

const markPlaceholder = path => {
  path && path.setData('_.wasPlaceholder', true);
};

exports.markPlaceholder = markPlaceholder;

const wasMacro = _it => {
  return _it.getData('_.wasPlaceholder', false) || _it.getData('it.wasTransformed', false);
};

exports.wasMacro = wasMacro;

const findTargetCallee = (_arg) => {
  return _arg.find(_it2 => {
    return _it2.listKey === 'arguments';
  });
};

exports.findTargetCallee = findTargetCallee;
const findTargetCaller = (_ref = (_arg2) => {
  return findTargetCallee(_arg2);
}) === null || _ref === void 0 ? void 0 : _ref.parentPath;
exports.findTargetCaller = findTargetCaller;

const findParentUntil = (path, pred, accumulate) => {
  let link = path;

  while ((_link = link) !== null && _link !== void 0 && _link.parentPath) {
    var _link;

    const parent = link.parentPath;
    const result = pred(parent, link);
    if (result === true) return link;
    if (result) return result;
    if (result === false) break;
    link = parent;
  }

  return accumulate ? link : null;
};

exports.findParentUntil = findParentUntil;

const findTargetExpression = (path, isImplicitParam = false) => {
  var _ref2, _path;

  return _ref2 = (_path = path, findTopmostLink(_path)), ((_arg3) => {
    return findParentUntil(_arg3, (parent, link) => {
      const isPipe = isPipeline(parent);

      if (isPipe && parent.get('right') === link) {
        return link;
      } else if (isPipe && !isImplicitParam && parent.get('left') === link) {
        return parent;
      } else if (parent.isVariableDeclarator()) {
        return parent.get('init');
      } else if (parent.isAssignmentPattern()) {
        return parent.get('right');
      } else if (parent.isAssignmentExpression()) {
        if (parent.parentPath.isExpressionStatement()) {
          return parent.get('right');
        }

        if (isImplicitParam) {
          return parent;
        }

        return parent.parentPath;
      }

      const key = link.listKey;

      if (isImplicitParam) {
        if (key === 'expressions' && parent.parentPath.isTaggedTemplateExpression()) {
          return link;
        } else if (key === 'arguments') {
          return link;
        }
      } else {
        if (key === 'arguments') {
          return parent;
        }
      }
    });
  })(_ref2);
};

exports.findTargetExpression = findTargetExpression;

const findTopmostLink = path => {
  var _path2;

  return _path2 = path, ((_arg4) => {
    return findParentUntil(_arg4, (parent, link) => {
      const isCalleeTail = () => parent.isCallExpression() && parent.get('callee') === link;

      const isUnary = () => parent.isUnaryExpression() && parent.get('argument') === link;

      const isBinary = () => {
        if (parent.isBinaryExpression()) {
          if (parent.node.operator === '|>') {
            return parent.get('left') === link;
          }

          return true;
        } else {
          return false;
        }
      };

      if (!parent.isMemberExpression() && !isBinary() && !isCalleeTail() && !isUnary()) return false;
    }, true);
  })(_path2);
};

exports.findTopmostLink = findTopmostLink;

const findWrapper = path => {
  var _path3;

  let calls = 0;
  return _path3 = path, ((_arg5) => {
    return findParentUntil(_arg5, (parent, link) => {
      if (isPipeline(parent, link) || parent.isCallExpression() && ++calls > 1) return false;

      if (parent.isArrowFunctionExpression() && wasMacro(parent)) {
        return parent;
      }
    });
  })(_path3);
};

exports.findWrapper = findWrapper;

const shouldHoist = path => {
  const isTransformed = () => {
    var _ref3, _path4;

    return _ref3 = (_path4 = path, findTargetCallee(_path4)), wasMacro(_ref3);
  };

  const hasMacroArgs = () => path.isCallExpression() && path.get('arguments').some((_arg6) => {
    return wasMacro(_arg6);
  });

  return !path.isLiteral() && !nonHoistTypes.has(path.node.type) && !isTransformed() && !hasMacroArgs();
};

exports.shouldHoist = shouldHoist;

const hoistArguments = (t, caller) => {
  var _args;

  let args, upper;

  if (caller.isArrowFunctionExpression()) {
    args = caller.get('body.body.0.argument.arguments');
    upper = caller.getStatementParent();
  } else if (caller.isCallExpression()) {
    args = caller.get('arguments');
    upper = caller.findParent(_it3 => {
      return _it3.isArrowFunctionExpression();
    }).getStatementParent();
  }

  if (!((_args = args) !== null && _args !== void 0 && _args.length)) return;
  args.forEach(arg => {
    if (!shouldHoist(arg)) return;
    const id = upper.scope.generateUidIdentifier('ref');
    const ref = t.variableDeclaration('const', [t.variableDeclarator(id, arg.node)]);
    upper.insertBefore(ref);
    arg.replaceWith(id);
  });
};

exports.hoistArguments = hoistArguments;

const getParamNode = (t, sourcePath, arg) => {
  if (sourcePath.parentPath.isSpreadElement()) {
    return t.restElement(arg);
  } else {
    return arg;
  }
};

exports.getParamNode = getParamNode;