const path = require('path')
const webpack = require('webpack')
const LicenseBannerPlugin = require('license-banner-webpack-plugin')
const { toPOSIXPath } = require('../lib/path')
const { isDev } = require('./flag')
const { basePath, assetsPath, destAssetsDir } = require('./path')

const rootDir = path.join(__dirname, '..')

module.exports = ['module', 'nomodule'].map((type) => {
  const isTypeModule = type === 'module'

  return {
    mode: isDev ? 'development' : 'production',
    context: rootDir,
    entry: [`./source/js/polyfill.${type}.ts`, './source/js/main.ts'],
    output: {
      path: path.join(rootDir, destAssetsDir),
      filename: `[name].${type}.bundle.js`,
      publicPath: toPOSIXPath(path.join('/', assetsPath, '/')),
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'initial',
            enforce: true,
          },
        },
      },
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          include: path.join(rootDir, 'source/js'),
          use: {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: isTypeModule ? { esmodules: true } : {},
                    useBuiltIns: 'usage',
                    corejs: 3,
                  },
                ],
                '@babel/preset-typescript',
              ],
              plugins: [
                '@babel/plugin-proposal-class-properties',
                '@babel/plugin-proposal-object-rest-spread',
                '@babel/plugin-syntax-dynamic-import',
              ],
              cacheDirectory: true,
            },
          },
        },
      ],
    },
    devtool: isDev && 'cheap-module-source-map',
    plugins: [
      new webpack.DefinePlugin({
        __DEV__: isDev,
        __BASE_PATH__: JSON.stringify(toPOSIXPath(path.join('/', basePath))),
      }),
      !isDev &&
        new LicenseBannerPlugin({
          licenseDirectories: [path.join(rootDir, 'node_modules')],
        }),
    ].filter(Boolean),
  }
})
