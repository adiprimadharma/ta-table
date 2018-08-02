const path = require('path');
const webpack = require('webpack');
const pkg = require('./package.json');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const MODULES = {
    tatable: ['./asset/plugin-js/ta-table-vanilla-es6.js',
    './asset/plugin-js/jquery.jscrollpane.min.js',
                    './asset/plugin-js/jquery.mousewheel.js',
                    './asset/plugin-js/element-resize-detector.min.js']
  }

module.exports = {
  entry: Object.assign({}, MODULES),

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [{
              loader: 'style-loader'
            }, {
              loader: 'css-loader'
            }]
      }
    ],
  },

  resolve: {
    extensions: [ '.ts', '.js' ],
  },

  plugins: [
    new webpack.BannerPlugin({
      banner: `${pkg.name}\n${pkg.version}\n`,
    }),
  ],

  optimization: {
    minimizer: [
      new UglifyJsPlugin()
    ]
  },

  externals: {
    jquery: {
      commonjs: 'jquery',
      commonjs2: 'jquery',
      amd: 'jquery',
      root: 'jQuery',
    },
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build'),
    libraryTarget: 'umd',
    library: 'TATable'
  }
};