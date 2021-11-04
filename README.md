# S2S Demo Website

Websites that demonstrate features of our tracking solution. 
Used also for manual tests.

## Developing
Setup:

    $ npm install

The following build scripts are available, which will build the website into _dist/_ 
```
$ npm run build         # <-- builds production version
$ npm run build:dev     # <-- builds unminified version
$ npm run build:local   # <-- builds unminified local version
```
You can also start a web server that hosts the website at http://localhost:8080/index.html . For more info, have a look at [webpack dev server](https://webpack.js.org/configuration/dev-server/).
```
$ npm run serve
$ npm run serve:dev
$ npm run serve:local
```

### Production version
Will use the sensic stack hosted at https://demo-config.sensic.net/ .

### Dev version
Will use the sensic stack hosted at https://demo-config-preproduction.sensic.net/ .

### Local version
Will use a sensic stack hosted at http://localhost[:port] .

This allows running the website together with the [VMS](https://stash.gfk.com/projects/DAM/repos/visitor-management-system) and [SDK](https://stash.gfk.com/projects/DAM/repos/s2s-sdk-web) to create a local environment for developing. 
By default it expects the web SDK to be available at localhost:8082/s2s-web.js and the VMS files to be available at localhost:8083 (example: http://localhost:8083/suiapi.js).
The default `serve` tasks in the SDK & VMS repositories are set to these ports.
 If you need to change the ports, have a look at the `local` env settings in [env.config.ts](./config/env.config.ts).



## Testing alternate deployments of sensic components

The website allows using different files for s2s-web.js, sui-connector.js etc.  
For this each page takes an optional query parameter that can point to a different file:

| page | parameter | example |
|-----------------------------|--------------|-----------------------------------------------------------------------------------|
| campaign-img-ai-param.html | pixelUrl | campaign-img-ai-param.html?pixelUrl=http://sg-config.sensic.net/tp |
| campaign-img-debug.html | pixelUrl | campaign-img-debug.html?pixelUrl=http://sg-config.sensic.net/tp |
| campaign-img-fixed-sui.html | pixelUrl | campaign-img-fixed-sui.html?pixelUrl=http://sg-config.sensic.net/tp |
| campaign-img.html | pixelUrl | campaign-img.html?pixelUrl=http://sg-config.sensic.net/tp |
| campaign-js.html | tagUrl | campaign-js.html?tagUrl=http://sg-config.sensic.net/tag-im.js |
| content.html | sdkUrl | content.html?sdkUrl=http://sg-config.sensic.net/s2s-web.js |
| html5video.html | sdkUrl | html5video.html?sdkUrl=http://sg-config.sensic.net/s2s-web.js |
| video.html | sdkUrl | video.html?sdkUrl=http://sg-config.sensic.net/s2s-web.js |
| sui-connector-test.html | connectorUrl | sui-connector-test.html?connectorUrl=http://sg-config.sensic.net/sui-connector.js |
| amp-pixel.html | pixelUrl |amp-pixel.html?pixelUrl=http://sg-config.sensic.net/tp |
