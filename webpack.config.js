const path = require('path');
const NpmDtsPlugin = require('npm-dts-webpack-plugin');

module.exports = {
  mode: 'production',
  target: 'node',
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'lib'),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        include: [path.resolve(__dirname, 'src')],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [new NpmDtsPlugin({ output: 'lib/index.d.ts' })],
};
