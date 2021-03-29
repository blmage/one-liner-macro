import test from 'ava'

import * as macros from './helpers/macros'

test(
  'lift: allows for creating binary+ functions with placeholders',
  [macros.babel7, macros.babel6],
  `
    'test'
    import { _, _1, _2, lift } from 'one-liner.macro'
    const result = [1, 2, 3, 4].reduce(lift(_ + _))
    t.is(result, 10)
    const result2 = [1, 2, 3, 4].reduce(lift(_2 + _1))
    t.is(result2, 10)
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
  `
)

test(
  'lift: `it` implicit parameters are functionally unaffected',
  [macros.babel7, macros.babel6],
  `
    'test'
    import { it, lift } from 'one-liner.macro'
    const result = [1, 2, 3, 4].reduce(lift(it + it))
    t.is(result, 8)
  `,
  `
    const result = [1, 2, 3, 4].reduce(_it => {
      return _it + _it;
    });
    t.is(result, 8);
  `
)

test(
  'lift: is just elided in non-macro expressions',
  [macros.babel7, macros.babel6],
  `
    'test'
    import { lift } from 'one-liner.macro'
    t.is(lift(1 + 1), 2)
  `,
  `
    t.is(1 + 1, 2);
  `
)
