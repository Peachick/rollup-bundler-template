const path = require("path")
const replace = require("rollup-plugin-replace")
const commonjs = require("rollup-plugin-commonjs")
const nodeResolve = require("rollup-plugin-node-resolve")
const typescript = require("rollup-plugin-typescript2")
const serve = require("rollup-plugin-serve")
const livereload = require("rollup-plugin-livereload")
const pkg = require("../package.json")

const resolvePath = (...dir) => path.resolve(__dirname, "../", ...dir)
const scheme = pkg.name.replace(/(?:^|-|\.)(.)/g, ($0, $1) => $1.toUpperCase());

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * (c) 2014-${new Date().getFullYear()} Peachick
 * Released under the MIT License.
 */`

const builds = {
  "es": {
    input: resolvePath("src/index.ts"),
    dest: resolvePath(`dist/${pkg.name}.es.js`),
    format: "es",
    banner,
    name: scheme
  },
  "umd": {
    input: resolvePath("src/index.ts"),
    dest: resolvePath(`dist/${pkg.name}.umd.js`),
    format: "umd",
    banner,
    name: scheme
  },
  "cjs": {
    input: resolvePath("src/index.ts"),
    dest: resolvePath(`dist/${pkg.name}.common.js`),
    format: "commonjs",
    banner,
    name: scheme
  }
}

function getConfig(name) {
  const opts = builds[name]
  const config = {
    input: opts.input,
    external: opts.external,
    plugins: [
      replace({
        __VERSION__: pkg.version
      }),
      commonjs(),
      nodeResolve({
        extensions: ['.js', '.ts'],
      }),
      typescript({
        exclude: "node_modules/**",
      }),
    ],
    output: {
      file: opts.dest,
      format: opts.format,
      banner: opts.banner,
      name: opts.name,
      exports: "named"
    }
  }
  if (process.env.TARGET) {
    config.plugins.push(...[serve({
      open: true,
      openPage: '/example/',
      port: 8989,
      contentBase: '',
    }), livereload()])
  }
  return config
}


if (process.env.TARGET) {
  module.exports = getConfig(process.env.TARGET)
} else {
  exports.getAllBuilds = () => Object.keys(builds).map(getConfig)
  exports.resolvePath = resolvePath
}
