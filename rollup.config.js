import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import summary from 'rollup-plugin-summary';
import typescript from '@rollup/plugin-typescript';
import serve from 'rollup-plugin-serve';
import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
  input: 'src/Index.ts',
  output: {
    file: 'sample/bottom-sheet.js',
    name: 'bottomSheet',
    format: 'umd',
    sourcemap: true
  },
  plugins: [
    typescript({tsconfig: './tsconfig.json'}),
    sourcemaps(),
    // Resolve bare module specifiers to relative paths
    resolve(),
    // Minify HTML template literals
    minifyHTML(),
    // Minify JS
    terser({
      ecma: 2020,
      module: true,
      warnings: true,
    }),
    // Print bundle summary
    summary(),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      exclude: [
        /\/core-js\//
      ],
    }),
    serve({
      contentBase: ['sample']
    })
  ],
  preserveEntrySignatures: 'strict',
};
