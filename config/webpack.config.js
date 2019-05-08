const path = require('path')
const webpack = require('webpack')
const LicenseBannerPlugin = require('license-banner-webpack-plugin')
const pkg = require('../package.json')
const { toPOSIXPath } = require('../lib/path')
const { isDev } = require('./flag')
const { basePath, assetsPath, destAssetsDir } = require('./path')

const rootDir = path.join(__dirname, '..')

module.exports = ['module', 'nomodule'].map((type) => {
  const isTypeModule = type === 'module'

  return {
    mode: isDev ? 'development' : 'production',
    context: rootDir,
    entry: [`./source/js/polyfill.${type}.ts`, `./source/js/main.ts`],
    output: {
      path: path.join(rootDir, destAssetsDir),
      filename: `[name].${type}.bundle.js`,
      publicPath: toPOSIXPath(path.join('/', assetsPath, '/')),
    },
    resolve: {
      extensions: ['.ts'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          include: path.join(rootDir, 'source/js'),
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: isTypeModule
                      ? {
                          esmodules: true,
                        }
                      : {
                          // Googlebot uses a web rendering service that is based on Chrome 41.
                          // https://developers.google.com/search/docs/guides/rendering
                          browsers: [...pkg.browserslist, 'Chrome 41'],
                        },
                    useBuiltIns: 'usage',
                    corejs: 3,
                  },
                ],
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
