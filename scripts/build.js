import { builds, getConfig } from './config';
import { terser } from 'rollup-plugin-terser';
import babel from '@rollup/plugin-babel'

const buildConfigs = [];

Object.keys(builds).forEach((type) => {
  const config = getConfig(type);
  const {
    output: { file },
    plugins,
  } = config;
  config.plugins.push(babel({
    babelHelpers: 'bundled',
    exclude: 'node_modules/**',
  }));
  const minConfig = {
    ...config,
    output: {
      ...config.output,
      file: file.replace(/\.js$/, '.min.js'),
    },
    plugins: [...plugins, terser()],
  };
  buildConfigs.push(config, minConfig);
});

export default buildConfigs;
