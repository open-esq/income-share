var path = require("path");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var TerserPlugin = require("terser-webpack-plugin");
const Dotenv = require("dotenv-webpack");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index_bundle.js",
    publicPath: "/"
  },
  module: {
    rules: [
      { test: /\.(js)$/, use: "babel-loader" },
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
      {
        test: /\.(png|svg|eot|otf|ico|ttf|woff|woff2)$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 100000,
            publicPath: "./",
            outputPath: "static/",
            name: "[name].[ext]"
          }
        }
      }
    ]
  },
  devServer: {
    historyApiFallback: true
  },
  optimization: {
    minimizer: [new TerserPlugin()]
  },
  mode: "development",
  plugins: [
    new HtmlWebpackPlugin({
      template: "index.html"
    }),
    new Dotenv()
  ],
  node: {
    fs: "empty"
  }
};
