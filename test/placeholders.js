import test from 'ava'

import * as macros from './helpers/macros'

test(
  '_: unused',
  [macros.babel7, macros.babel6],
  `import { _ } from 'one-liner.macro'`,
  ``
)

test(
  '_: partially applies the called function',
  [macros.babel7, macros.babel6],
  `
    'test'
    import { _ } from 'one-liner.macro'
    const add = (x, y) => x + y
    const addOne = add(1, _)
    t.is(addOne(4), 5)
  `,
  `
    const add = (x, y) => x + y;
    const addOne = (_arg) => {
      return add(1, _arg);
    };
    t.is(addOne(4), 5);
  `
)

test(
  '_n: partially applies the called function',
  [macros.babel7, macros.babel6],
  `
    'test'
    import { _1, _2 } from 'one-liner.macro'
    const add = _2 + _1
    t.is(add(1, 4), 5)
  `,
  `
    const add = (_arg, _arg2) => {
      return _arg2 + _arg;
    };
    t.is(add(1, 4), 5);
  `
)

test(
  '_: aliased named import works',
  [macros.babel7, macros.babel6],
  `
    'test'
    import { _ as PLACEHOLDER } from 'one-liner.macro'
    const toInt = parseInt(PLACEHOLDER, 10)
    t.is(toInt('2'), 2)
  `,
  `
    const toInt = (_arg) => {
      return parseInt(_arg, 10);
    };
    t.is(toInt('2'), 2);
  `
)

test(
  '_n: aliased named import works',
  [macros.babel7, macros.babel6],
  `
    'test'
    import { _1 as P1, _2 as P2 } from 'one-liner.macro'
    const add = P2 + P1
    t.is(add(1, 4), 5)
  `,
  `
    const add = (_arg, _arg2) => {
      return _arg2 + _arg;
    };
    t.is(add(1, 4), 5);
  `
)

test(
  '_: works with multiple placeholders',
  [macros.babel7, macros.babel6],
  `
    import { _ } from 'one-liner.macro'
    const log = console.log(_, 1, _, 2, _)
  `,
  `
    const log = (_arg, _arg2, _arg3) => {
      return console.log(_arg, 1, _arg2, 2, _arg3);
    };
  `
)

test(
  '_n: works with multiple placeholders',
  [macros.babel7, macros.babel6],
  `
    import { _1, _2 } from 'one-liner.macro'
    const log = console.log(_2, _1, 1, _1, 2, _2)
  `,
  `
    const log = (_arg, _arg2) => {
      return console.log(_arg2, _arg, 1, _arg, 2, _arg2);
    };
  `
)

test(
  '_: assigned expressions compile to a single function',
  [macros.babel7, macros.babel6],
  `
    import { _ } from 'one-liner.macro'
    const areSameThing = _ === _
    const oneMansIsAnothers = _.trash === _.treasure
  `,
  `
    const areSameThing = (_arg, _arg2) => {
      return _arg === _arg2;
    };

    const oneMansIsAnothers = (_arg3, _arg4) => {
      return _arg3.trash === _arg4.treasure;
    };
  `
)

test(
  '_n: assigned expressions compile to a single function',
  [macros.babel7, macros.babel6],
  `
    import { _1, _2 } from 'one-liner.macro'
    const areSameThing = _1 === _2
    const oneMansIsAnothers = _2.trash === _1.treasure
  `,
  `
    const areSameThing = (_arg, _arg3) => {
      return _arg === _arg3;
    };

    const oneMansIsAnothers = (_arg2, _arg4) => {
      return _arg4.trash === _arg2.treasure;
    };
  `
)

test(
  '_: hoists complex sibling arguments to prevent multiple executions',
  [macros.babel7, macros.babel6],
  `
    import { _ } from 'one-liner.macro'
    const log = console.log(_, {}, foo(), new Person(), 2, _.bar())
  `,
  `
    const _ref = foo();

    const _ref2 = new Person();

    const log = (_arg, _arg2) => {
      return console.log(_arg, {}, _ref, _ref2, 2, _arg2.bar());
    };
  `
)

test(
  '_n: hoists complex sibling arguments to prevent multiple executions',
  [macros.babel7, macros.babel6],
  `
    import { _1, _2 } from 'one-liner.macro'
    const log = console.log(_1, {}, foo(), new Person(), 2, _2.bar())
  `,
  `
    const _ref = foo();

    const _ref2 = new Person();

    const log = (_arg, _arg2) => {
      return console.log(_arg, {}, _ref, _ref2, 2, _arg2.bar());
    };
  `
)

test(
  '_: does not hoist nested partial functions',
  [macros.babel7, macros.babel6],
  `
    import { _ } from 'one-liner.macro'
    const mapper = map(_, get(_, 'nested.key', 'default'))
  `,
  `
    const mapper = (_arg) => {
      return map(_arg, (_arg2) => {
        return get(_arg2, 'nested.key', 'default');
      });
    };
  `
)

test(
  '_n: does not hoist nested partial functions',
  [macros.babel7, macros.babel6],
  `
    import { _1 } from 'one-liner.macro'
    const mapper = map(_1, get(_1, 'nested.key', 'default'))
  `,
  `
    const mapper = (_arg) => {
      return map(_arg, (_arg2) => {
        return get(_arg2, 'nested.key', 'default');
      });
    };
  `
)

test(
  '_: supports nested properties and methods',
  [macros.babel7, macros.babel6],
  `
    import { _ } from 'one-liner.macro'
    console.log(_.foo.bar)
    console.log(_.foo.baz())
  `,
  `
    (_arg) => {
      return console.log(_arg.foo.bar);
    };

    (_arg2) => {
      return console.log(_arg2.foo.baz());
    };
  `
)

test(
  '_n: supports nested properties and methods',
  [macros.babel7, macros.babel6],
  `
    import { _1, _2 } from 'one-liner.macro'
    console.log(_1.foo.bar)
    console.log(_2.foo.baz())
  `,
  `
    (_arg) => {
      return console.log(_arg.foo.bar);
    };

    (_arg2, _arg3) => {
      return console.log(_arg3.foo.baz());
    };
  `
)

// can't test this in Babel 6 because the pipeline operator is Babel 7 only
test(
  '_: does not traverse out of pipelined expressions',
  [macros.babel7],
  `
    'test'
    import { _, it } from 'one-liner.macro'
    const add = (x, y) => x + y
    const fn = it |> parseInt |> add(10, _) |> String
    t.is(fn('100'), '110')
  `,
  `
    const add = (x, y) => x + y;

    const fn = _it => {
      return _it |> parseInt |> ((_arg) => {
        return add(10, _arg);
      }) |> String;
    };
    t.is(fn('100'), '110');
  `
)

test(
  '_n: does not traverse out of pipelined expressions',
  [macros.babel7],
  `
    'test'
    import { _1, it } from 'one-liner.macro'
    const add = (x, y) => x + y
    const fn = it |> parseInt |> add(10, _1) |> String
    t.is(fn('100'), '110')
  `,
  `
    const add = (x, y) => x + y;

    const fn = _it => {
      return _it |> parseInt |> ((_arg) => {
        return add(10, _arg);
      }) |> String;
    };
    t.is(fn('100'), '110');
  `
)

test(
  '_: includes tail paths in the wrapper function',
  [macros.babel7, macros.babel6],
  `
    import { _ } from 'one-liner.macro'
    const fn = String(_).toUpperCase() === 2
  `,
  `
    const fn = (_arg) => {
      return String(_arg).toUpperCase() === 2;
    };
  `
)

test(
  '_n: includes tail paths in the wrapper function',
  [macros.babel7, macros.babel6],
  `
    import { _1 } from 'one-liner.macro'
    const fn = String(_1).toUpperCase() === 2
  `,
  `
    const fn = (_arg) => {
      return String(_arg).toUpperCase() === 2;
    };
  `
)

test(
  '_: handles hoisting correctly with tail paths',
  [macros.babel7, macros.babel6],
  `
    import { _, it } from 'one-liner.macro'
    const Bar = class {}
    const fn = foo(_, new Bar()).toUpperCase() === 2
  `,
  `
    const Bar = class {};

    const _ref = new Bar();

    const fn = (_arg) => {
      return foo(_arg, _ref).toUpperCase() === 2;
    };
  `
)

test(
  '_n: handles hoisting correctly with tail paths',
  [macros.babel7, macros.babel6],
  `
    import { _1, it } from 'one-liner.macro'
    const Bar = class {}
    const fn = foo(_1, new Bar()).toUpperCase() === 2
  `,
  `
    const Bar = class {};

    const _ref = new Bar();

    const fn = (_arg) => {
      return foo(_arg, _ref).toUpperCase() === 2;
    };
  `
)

test(
  '_: supports default parameters',
  [macros.babel7, macros.babel6],
  `
    'test'
    import { _ } from 'one-liner.macro'
    const fn = (a = _ + _) => a(2, 2)
    t.is(fn(), 4)
  `,
  `
    const fn = (a = (_arg, _arg2) => {
      return _arg + _arg2;
    }) => a(2, 2);
    t.is(fn(), 4);
  `
)

test(
  '_n: supports default parameters',
  [macros.babel7, macros.babel6],
  `
    'test'
    import { _1, _2 } from 'one-liner.macro'
    const fn = (a = _2 + _1) => a(2, 2)
    t.is(fn(), 4)
  `,
  `
    const fn = (a = (_arg, _arg2) => {
      return _arg2 + _arg;
    }) => a(2, 2);
    t.is(fn(), 4);
  `
)

test(
  '_: supports spread placeholders',
  [macros.babel7, macros.babel6],
  `
    import { _ } from 'one-liner.macro'
    const log = console.log(..._)
  `,
  `
    const log = (..._arg) => {
      return console.log(..._arg);
    };
  `
)

test(
  '_n: does not support spread placeholders',
  [macros.babel7Failure],
  `
    import { _1 } from 'one-liner.macro'
    const log = console.log(..._1)
  `,
  { message: /Indexed placeholders do not support spread syntax/ }
)

test(
  '_: works normally within template expressions',
  [macros.babel7, macros.babel6],
  `
    import { _ } from 'one-liner.macro'
    const a = style\`
      font-size: 16px;
      color: \${_.color};
    \`
  `,
  `
    const a = (_arg) => {
      return style\`
      font-size: 16px;
      color: \${_arg.color};
    \`;
    };
  `
)

test(
  '_n: works normally within template expressions',
  [macros.babel7, macros.babel6],
  `
    import { _1, _2 } from 'one-liner.macro'
    const a = style\`
      font-size: \${_2.size}px;
      color: \${_1.color};
    \`
  `,
  `
    const a = (_arg, _arg2) => {
      return style\`
      font-size: \${_arg2.size}px;
      color: \${_arg.color};
    \`;
    };
  `
)

test(
  '_: pipeline is considered a tail path when `_` is in the left node',
  [macros.babel7],
  `
    'test'
    import { _, it } from 'one-liner.macro'
    const fn = someFn => someFn('world')
    const inner = name => ({ name })
    const otherFn = str => str.toUpperCase()
    const result = fn(inner(_).name |> otherFn)
    t.is(result, 'WORLD')
  `,
  `
    const fn = someFn => someFn('world');

    const inner = name => ({
      name
    });

    const otherFn = str => str.toUpperCase();

    const result = fn((_arg) => {
      return inner(_arg).name |> otherFn;
    });

    t.is(result, 'WORLD');
  `
)

test(
  '_n: pipeline is considered a tail path when `_n` is in the left node',
  [macros.babel7],
  `
    'test'
    import { _1, it } from 'one-liner.macro'
    const fn = someFn => someFn('world')
    const inner = name => ({ name })
    const otherFn = str => str.toUpperCase()
    const result = fn(inner(_1).name |> otherFn)
    t.is(result, 'WORLD')
  `,
  `
    const fn = someFn => someFn('world');

    const inner = name => ({
      name
    });

    const otherFn = str => str.toUpperCase();

    const result = fn((_arg) => {
      return inner(_arg).name |> otherFn;
    });

    t.is(result, 'WORLD');
  `
)

test(
  '_: fails when used outside of a valid expression (pt. 1)',
  [macros.babel7Failure],
  `
    import { _ } from 'one-liner.macro'
    _
  `,
  { message: /Placeholders must be used/ }
)

test(
  '_: fails when used outside of a valid expression (pt. 2)',
  [macros.babel7Failure],
  `
    import { _ } from 'one-liner.macro'
    _.property
  `,
  { message: /Placeholders must be used/ }
)

test(
  '_n: fails when used outside of a valid expression (pt. 1)',
  [macros.babel7Failure],
  `
    import { _1 } from 'one-liner.macro'
    _1
  `,
  { message: /Indexed placeholders must be used/ }
)

test(
  '_n: fails when used outside of a valid expression (pt. 2)',
  [macros.babel7Failure],
  `
    import { _2 } from 'one-liner.macro'
    _2.property
  `,
  { message: /Indexed placeholders must be used/ }
)

test(
  '_n: allows to skip parameters',
  [macros.babel7, macros.babel6],
  `
    import { _3 } from 'one-liner.macro'
    const log = console.log(_3)
  `,
  `
    const log = (_arg, _arg2, _arg3) => {
      return console.log(_arg3);
    };
  `
)

test(
  '_, _n: can not be mixed together (pt. 1)',
  [macros.babel7Failure],
  `
    import { _, _1 } from 'one-liner.macro'
    const log = console.log(_, _1)
  `,
  { message: /Placeholders can not be mixed with indexed placeholders/ }
)

test(
  '_, _n: unless the placeholder is spread in last position (pt. 2)',
  [macros.babel7, macros.babel6],
  `
    import { _, _2 } from 'one-liner.macro'
    const log = console.log(_2, ..._)
  `,
  `
    const log = (_arg, _arg2, ..._arg3) => {
      return console.log(_arg2, ..._arg3);
    };
  `
)
