# Second by Second, Typescript 2 Version

1. [Configuring](#configuring)
2. [Running](#running-locally)
3. [Deployment](#deployment)
4. [Requirements](#requirements)

## Configuring

The different *.html files reference all elements of the frontend stack.
The URL these are referenced with can be configured using:
```shell
> ENV=<environment> gulp setenv
(or on windows)
> set ENV=<environment>
> gulp setenv
```
where \<environment> is one of `local|development|preproduction|prodution`.
This will replace the URL prefix of all references with:

| Environment   | URL-Prefix                             |
|---------------|----------------------------------------|
| local         | 'localhost:8080/dist'                  |
| development   | 's2s.dev/website/dist'                 |
| preproduction | 'demo-config-preproduction.sensic.net' |
| production    | 'demo-config.sensic.net'               |

For example for the production environment, this projects pages will then reference:

- https://demo-config.sensic.net/tp
- https://demo-config.sensic.net/tag-im.js
- demo-config.sensic.net/s2s-web.js
- demo-config.sensic.net/sui-connector.js
- demo-config.sensic.net/s2s-web.js

## Running locally

Simply host the website/ directory with a webserver, for example:

```shell
> npm i -g http-server
> http-server -p 8081 website/
```

and visit http://localhost:8081/index.html

## Running the entire frontend stack

Read the guide on how to develop locally in confluence (https://confluence.gfk.com/pages/viewpage.action?pageId=292572332&moved=true)

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


## Deployment

You need to create a file *aws_credentials.php* at the top level of the repository with the following content:
```
<?php
return [
    'key' => 'AWS_KEY_ID',
    'secret' => 'AWS_SECRET_KEY',
];
```

Then run `php S3upload.php <preproduction|production>`.

## Requirements
- php7+
- npm5+
- php composer
- typescript 2+
- Some webserver (python http.server or node http-server)
