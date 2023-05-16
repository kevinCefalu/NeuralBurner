import clean from 'rollup-plugin-clean';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript';
import pkg from './package.json' assert { type: 'json' };

import { getMainScriptPath } from './scripts/getFile.cjs';

export default [
  {
    input: getMainScriptPath(),
    output: {
      name: 'howLongUntilLunch',
      file: pkg.browser,
      format: 'umd'
    },
    plugins: [
      clean(), // so Rollup can clean up an existing dist folder
      resolve(), // so Rollup can find required modules
      commonjs(), // so Rollup can convert required modules to an ES
      typescript() // so Rollup can convert TypeScript to JavaScript
    ]
  }
];
