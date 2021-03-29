import test from 'ava'

import * as macros from './helpers/macros'

test(
  '_, it: interoperates with pipeline operator (pt. 1)',
  [macros.babel7],
  `
    'test'
    import { _, it } from 'one-liner.macro'

    const add = _ + _
    const tenPlusString =
      it
      |> parseInt(_, 10)
      |> add(10, _)
      |> String

    tenPlusString('10') |> t.is(_, '20')
  `,
  `
    const add = (_arg, _arg2) => {
      return _arg + _arg2;
    };

    const tenPlusString = _it => {
      return _it |> ((_arg3) => {
        return parseInt(_arg3, 10);
      }) |> ((_arg4) => {
        return add(10, _arg4);
      }) |> String;
    };

    tenPlusString('10') |> ((_arg5) => {
      return t.is(_arg5, '20');
    });
  `
)

test(
  '_, it: interoperates with pipeline operator (pt. 2)',
  [macros.babel7],
  `
    'test'
    import { _, it } from 'one-liner.macro'

    const heroes = [
      { name: 'bob' },
      { name: 'joe' },
      { name: 'ann' }
    ]

    heroes.map(it.name)
    |> _[0].split('')
    |> it.join(', ')
    |> \`-- \${_} --\`
    |> t.is(_, '-- b, o, b --')
  `,
  `
    const heroes = [{
      name: 'bob'
    }, {
      name: 'joe'
    }, {
      name: 'ann'
    }];
    heroes.map(_it => {
      return _it.name;
    }) |> ((_arg) => {
      return _arg[0].split('');
    }) |> (_it2 => {
      return _it2.join(', ');
    }) |> ((_arg2) => {
      return \`-- \${_arg2} --\`;
    }) |> ((_arg3) => {
      return t.is(_arg3, '-- b, o, b --');
    });
  `
)

test(
  '_n, it: interoperates with pipeline operator (pt. 1)',
  [macros.babel7],
  `
    'test'
    import { _1, _2, it } from 'one-liner.macro'

    const add = _2 + _1
    const tenPlusString =
      it
      |> parseInt(_1, 10)
      |> add(10, _1)
      |> String

    tenPlusString('10') |> t.is(_1, '20')
  `,
  `
    const add = (_arg, _arg5) => {
      return _arg5 + _arg;
    };

    const tenPlusString = _it => {
      return _it |> ((_arg2) => {
        return parseInt(_arg2, 10);
      }) |> ((_arg3) => {
        return add(10, _arg3);
      }) |> String;
    };

    tenPlusString('10') |> ((_arg4) => {
      return t.is(_arg4, '20');
    });
  `
)

test(
  '_n, it: interoperates with pipeline operator (pt. 2)',
  [macros.babel7],
  `
    'test'
    import { _1, it } from 'one-liner.macro'

    const heroes = [
      { name: 'bob' },
      { name: 'joe' },
      { name: 'ann' }
    ]

    heroes.map(it.name)
    |> _1[0].split('')
    |> it.join(', ')
    |> \`-- \${_1} --\`
    |> t.is(_1, '-- b, o, b --')
  `,
  `
    const heroes = [{
      name: 'bob'
    }, {
      name: 'joe'
    }, {
      name: 'ann'
    }];
    heroes.map(_it => {
      return _it.name;
    }) |> ((_arg) => {
      return _arg[0].split('');
    }) |> (_it2 => {
      return _it2.join(', ');
    }) |> ((_arg2) => {
      return \`-- \${_arg2} --\`;
    }) |> ((_arg3) => {
      return t.is(_arg3, '-- b, o, b --');
    });
  `
)

test(
  '_, it: assignment expressions are applied similarly to declarations',
  [macros.babel7, macros.babel6],
  `
    import { _, it } from 'one-liner.macro'
    const bar = {}
    bar.greet = \`Hello \${_}\`
    const result = bar.greet('world')
    t.is(result, 'Hello world')
  `,
  `
    const bar = {};

    bar.greet = (_arg) => {
      return \`Hello \${_arg}\`;
    };

    const result = bar.greet('world');
    t.is(result, 'Hello world');
  `
)

test(
  '_, it, lift: assignment expressions below top-level (#20)',
  [macros.babel7],
  `
    'test'
    import { _, it } from 'one-liner.macro'

    const foo = [
      { bar: true },
      { bar: false },
      { bar: false }
    ]

    foo.forEach(it.bar = true)
    t.true(foo.every(v => v.bar === true))

    const identity = it
    const a = identity(_.bar = true)
    const b = a({ bar: false })
    t.true(b)
  `,
  `
    const foo = [{
      bar: true
    }, {
      bar: false
    }, {
      bar: false
    }];

    foo.forEach(_it => {
      return _it.bar = true;
    });

    t.true(foo.every(v => v.bar === true));

    const identity = _it2 => {
      return _it2;
    };

    const a = (_arg) => {
      return identity(_arg.bar = true);
    };

    const b = a({
      bar: false
    });
    t.true(b);
  `
)
