import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { babel } from "@rollup/plugin-babel";
import json from '@rollup/plugin-json';
import terser from "@rollup/plugin-terser";

const extensions = [".js", ".ts", ".json"];

export default {
	input: 'src/plugin.js',
	output: [
		{ file: 'dist/videojs-webrtc-plugin.es.js', format: 'es' },
	],
	plugins: [
    resolve({
      preferBuiltins: false,
      mainFields: [
        'browser', 'jsnext',
        'module', 'main'
      ],
      extensions
    }),
    babel({
      include: "src/**/*",
      exclude: "**/node_modules/**",
      babelHelpers: "runtime",
      extensions,
    }),
    commonjs(),
    json(),
    terser()
	],
};