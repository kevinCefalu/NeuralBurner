import clear from 'rollup-plugin-clear';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript';
import glob from 'glob';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// import pkg from './package.json' assert { type: 'json' };

export default [
  {
    input: Object.fromEntries(
      glob
        .sync('src/*.ts')
        .map(file => [
          path.relative('src', file.slice(0, file.length - path.extname(file).length)),
          fileURLToPath(new URL(file, import.meta.url))
        ])
    ),
    output: {
      dir: 'dist',
      format: 'es'
    },
    plugins: [resolve(), commonjs(), typescript()]
  },
  {
    input: Object.fromEntries(
      glob
        .sync('src/managers/**/manager.ts')
        .map(file => [
          path.relative('src', file.slice(0, file.length - path.extname(file).length)),
          fileURLToPath(new URL(file, import.meta.url))
        ])
    ),
    output: {
      dir: 'dist',
      format: 'es'
    },
    plugins: [resolve(), commonjs(), typescript()]
  },
  {
    input: Object.fromEntries(
      glob
        .sync('src/utilities/**/*.ts')
        .map(file => [
          path.relative('src', file.slice(0, file.length - path.extname(file).length)),
          fileURLToPath(new URL(file, import.meta.url))
        ])
    ),
    output: {
      dir: 'dist',
      format: 'es'
    },
    plugins: [resolve(), commonjs(), typescript()]
  }
];
