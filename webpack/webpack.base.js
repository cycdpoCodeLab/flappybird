/**
 * Created by cyc on 2017/2/4.
 */

const
  path = require('path')

  // Webpack Plugin
  , CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin')
  , DefinePlugin = require('webpack/lib/DefinePlugin')
;

const
  DEVELOPMENT = process.env.NODE_ENV === 'development'
  , PRODUCTION = process.env.NODE_ENV === 'production'
  , PRODUCTION_TEST_SERVER = process.env.NODE_ENV === 'production_test_server'
;

module.exports = {
  entry: {
    'main': [
      'hilojs',
      path.resolve('app', 'main.js'),
    ],
  },

  output: {
    filename: DEVELOPMENT
      ? 'scripts/[name].bundle.[chunkhash:4].js'
      : 'scripts/[name].bundle.[chunkhash:8].min.js',
    chunkFilename: DEVELOPMENT
      ? 'scripts/[name].chunk.[chunkhash:4].js'
      : 'scripts/[name].chunk.[chunkhash:8].min.js',
    publicPath: './',
  },

  resolve: {
    modules: [
      path.resolve('app'),
      path.resolve('node_modules'),
      path.resolve('static'),
    ],
    'alias': {
      'hilojs': path.resolve('node_modules', 'hilojs', 'hilo-standalone.js'),
    },
    'extensions': ['.js']
  },

  module: {
    rules: [
      // Scripts
      {
        test: /\.js$/,
        include: [
          path.resolve('app')
        ],
        exclude: [
          path.resolve('node_modules'),
        ],
        loader: 'babel-loader',
      },

      // Pug template
      {
        test: /\.pug$/,
        include: [
          path.resolve('app'),
          path.resolve('static'),
        ],
        exclude: [
          path.resolve('node_modules'),
        ],
        loader: 'pug-loader',
      },

      // ico
      {
        test: /\.ico$/i,
        exclude: [
          path.resolve('node_modules'),
        ],
        include: [
          path.resolve('static'),
        ],
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
            },
          },
        ],
      },
    ]
  },

  plugins: [
    new CommonsChunkPlugin({
      names: ['main'],
      minChunks: Infinity,
    }),

    new DefinePlugin({
      DEVELOPMENT: JSON.stringify(DEVELOPMENT),
      PRODUCTION: JSON.stringify(PRODUCTION),
      PRODUCTION_TEST_SERVER: JSON.stringify(PRODUCTION_TEST_SERVER),
      TEST_SERVER_ADDRESS: '',
    }),
  ],
};
