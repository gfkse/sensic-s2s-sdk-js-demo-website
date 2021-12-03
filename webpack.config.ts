import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import merge from 'webpack-merge';
import * as envs from './config/env.config';
import fs from 'fs';
import { readdirSync } from 'fs';
import { resolve } from 'path';

var pages = [];

var getFiles = function(path, files) {
  readdirSync(path).forEach(function(file) {
    const subpath = path + '/' + file;
    if (fs.lstatSync(subpath).isDirectory()) {
      getFiles(subpath, files);
    } else {
      files.push(path + '/' + file);
    }
  });
};
getFiles(resolve(__dirname, 'website'), pages);
pages = pages.filter(filename => filename.endsWith('.html')).map(fname => {
  return fname.split('website/')[1];
});

export default function(env, argv) {
  var config = {
    context: path.resolve(__dirname),
    entry: './src/env.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'env.js'
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: [{ loader: 'ts-loader' }]
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource'
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf).*$/i,
          type: 'asset/resource'
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
    target: ['web', 'es5'],
    plugins: [
      new CleanWebpackPlugin(),
      ...pages.map(
        p =>
          new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'website', p),
            filename: p,
            title: p,
            inject: 'head',
            scriptLoading: 'blocking'
          })
      ),
      new CopyPlugin({
        patterns: [
          { from: 'website/css', to: 'css' },
          { from: 'website/fonts', to: 'fonts' },
          { from: 'website/images', to: 'images' },
          { from: 'website/js', to: 'js' },
          { from: 'website/res', to: 'res' }
        ]
      })
    ],
    devServer: {
      port: 8080,
      contentBase: path.join(__dirname, 'dist')
    }
  };
  return merge<any>(config, envs[process.env.NODE_ENV || 'development']);
}
