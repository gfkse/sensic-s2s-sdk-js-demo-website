import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import merge from "webpack-merge";
import * as envs from "./config/env.config";
import { readdirSync } from "fs";
import { resolve } from "path";

const pages = readdirSync(resolve(__dirname, "website"))
    .filter(filename => filename.endsWith(".html"));

export default function (env, argv) {
    let config = {
        context: path.resolve(__dirname),
        entry: "./src/env.js",
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "env.js",
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    use: [{ loader: "ts-loader" }],
                },
                {
                    test: /\.css$/i,
                    use: ["style-loader", "css-loader"],
                },
                {
                    test: /\.(png|svg|jpg|jpeg|gif)$/i,
                    type: "asset/resource",
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf).*$/i,
                    type: "asset/resource",
                },
            ],
        },
        resolve: {
            extensions: [".ts", ".js"],
        },
        target: ["web", "es5"],
        plugins: [
            new CleanWebpackPlugin(),
            ...pages.map(
                p =>
                    new HtmlWebpackPlugin({
                        template: path.resolve(__dirname, "website", p),
                        filename: p,
                        title: p,
                        inject: "head",
                        scriptLoading: "blocking",
                    })
            ),
            new CopyPlugin({
                patterns: [
                    { from: "website/css", to: "css" },
                    { from: "website/fonts", to: "fonts" },
                    { from: "website/images", to: "images" },
                    { from: "website/js", to: "js" },
                    { from: "website/videos", to: "videos" },
                ],
            })
        ],
        devServer: {
            port: 8080,
            contentBase: path.join(__dirname, 'dist'),
        }
    };
    return merge<any>(config, envs[process.env.NODE_ENV || "development"]);
}
