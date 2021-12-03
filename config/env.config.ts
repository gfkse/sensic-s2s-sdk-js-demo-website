import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';

const urls = {
  production: {
    ENV_TAG_URL: JSON.stringify(`https://demo-config.sensic.net/tag-im.js`),
    ENV_WEB_SDK_URL: JSON.stringify(`https://demo-config.sensic.net/s2s-web.js`),
    ENV_WEB_SDK_CTV_URL: JSON.stringify(`https://demo-config.sensic.net/ctv/s2s-web.js`),
    ENV_TP_URL: JSON.stringify(`https://demo-config.sensic.net/tp`),
    ENV_TOUCHPOINT_URL: JSON.stringify(`https://demo-config.sensic.net/suitp.html`),
    ENV_SUI_CONNECTOR_URL: JSON.stringify(`https://demo-config.sensic.net/sui-connector.js`),
    ENV_EXTENSION_BASE_URL: JSON.stringify(`https://demo-config.sensic.net`)
  },
  development: {
    ENV_TAG_URL: JSON.stringify(`https://demo-config-preproduction.sensic.net/tag-im.js`),
    ENV_WEB_SDK_URL: JSON.stringify(`https://demo-config-preproduction.sensic.net/s2s-web.js`),
    ENV_WEB_SDK_CTV_URL: JSON.stringify(`https://demo-config-preproduction.sensic.net/ctv/s2s-web.js`),
    ENV_TP_URL: JSON.stringify(`https://demo-config-preproduction.sensic.net/tp`),
    ENV_TOUCHPOINT_URL: JSON.stringify(`https://demo-config-preproduction.sensic.net/suitp.html`),
    ENV_SUI_CONNECTOR_URL: JSON.stringify(`https://demo-config-preproduction.sensic.net/sui-connector.js`),
    ENV_EXTENSION_BASE_URL: JSON.stringify(`https://demo-config-preproduction.sensic.net`)
  },
  local: {
    ENV_TAG_URL: JSON.stringify(`http://localhost:8082/tag-im.js`),
    ENV_WEB_SDK_URL: JSON.stringify(`http://localhost:8082/s2s-web.js`),
    ENV_WEB_SDK_CTV_URL: JSON.stringify(`http://localhost:8082/s2s-web.js`),
    ENV_TP_URL: JSON.stringify(`http://localhost:8090/tp`),
    ENV_TOUCHPOINT_URL: JSON.stringify(`http://localhost:8082/suitp.html`),
    ENV_SUI_CONNECTOR_URL: JSON.stringify(`http://localhost:8082/sui-connector.js`),
    ENV_EXTENSION_BASE_URL: JSON.stringify(`http://localhost:8082`)
  }
};
export const production = {
  mode: 'production',
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: /@license/i // Removes any comments when minifying, except ones with @license
          }
        },
        extractComments: false // Leave remaining comments within the bundled file (should preserve the @license comments in the bundle)
      })
    ]
  },
  plugins: [
    new webpack.DefinePlugin(urls.production)
  ]
};

export const development = {
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [
    new webpack.DefinePlugin(urls.development)
  ]

};
export const local = {
  ...development,
  plugins: [
    new webpack.DefinePlugin(urls.local)
  ]
};
