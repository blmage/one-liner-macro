import test from 'ava'

import * as macros from './helpers/macros'

test(
  'plugin(it): works like the macro',
  [macros.babel7Plugin, macros.babel6Plugin],
  `
    'test'
    import it from 'one-liner.macro'
    const square = it * it
    t.is(square(2), 4)

    const getDeepFoo = it.nested.deep.property.foo
    const obj = {
      nested: {
        deep: {
          property: {
            foo: 'ayy'
          }
        }
      }
    }
    t.is(getDeepFoo(obj), 'ayy')
  `,
  `
    const square = _it => {
      return _it * _it;
    };
    t.is(square(2), 4);

    const getDeepFoo = _it2 => {
      return _it2.nested.deep.property.foo;
    };
    const obj = {
      nested: {
        deep: {
          property: {
            foo: 'ayy'
          }
        }
      }
    };
    t.is(getDeepFoo(obj), 'ayy');
  `
)

test(
  'plugin(_): works like the macro',
  [macros.babel7Plugin, macros.babel6Plugin],
  `
    'test'
    import { _ } from 'one-liner.macro'
    const multiply = _ * _
    const timesTwo = multiply(2, _)
    t.is(timesTwo(9), 18)

    const greet = \`Hello \${_}\`
    t.is(greet('world'), 'Hello world')
  `,
  `
    const multiply = (_arg, _arg2) => {
      return _arg * _arg2;
    };
    const timesTwo = (_arg3) => {
      return multiply(2, _arg3);
    };
    t.is(timesTwo(9), 18);

    const greet = (_arg4) => {
      return \`Hello \${_arg4}\`;
    };
    t.is(greet('world'), 'Hello world');
  `
)

test(
  'plugin(_n): works like the macro',
  [macros.babel7Plugin, macros.babel6Plugin],
  `
    'test'
    import { _1, _2 } from 'one-liner.macro'
    const multiply = _2 * _1
    const timesTwo = multiply(2, _1)
    t.is(timesTwo(9), 18)

    const greet = \`Hello \${_1}\`
    t.is(greet('world'), 'Hello world')
  `,
  `
    const multiply = (_arg, _arg4) => {
      return _arg4 * _arg;
    };
    const timesTwo = (_arg2) => {
      return multiply(2, _arg2);
    };
    t.is(timesTwo(9), 18);

    const greet = (_arg3) => {
      return \`Hello \${_arg3}\`;
    };
    t.is(greet('world'), 'Hello world');
  `
)

test(
  'plugin(lift): works like the macro',
  [macros.babel7Plugin, macros.babel6Plugin],
  `
    'test'
    import { _, _1, _2, it, lift } from 'one-liner.macro'
    const result = [1, 2, 3, 4].reduce(lift(_ + _))
    t.is(result, 10)
    const result2 = [1, 2, 3, 4].reduce(lift(_2 + _1))
    t.is(result2, 10)
    const result3 = [1, 2, 3, 4].reduce(lift(it + it))
    t.is(result3, 8)
    t.is(lift(1 + 1), 2)
  `,
  `
    const result = [1, 2, 3, 4].reduce((_arg3, _arg4) => {
      return _arg3 + _arg4;
    });
    t.is(result, 10);
    const result2 = [1, 2, 3, 4].reduce((_arg, _arg2) => {
      return _arg2 + _arg;
    });
    t.is(result2, 10);
    const result3 = [1, 2, 3, 4].reduce(_it => {
      return _it + _it;
    });
    t.is(result3, 8);
    t.is(1 + 1, 2);
  `
)
