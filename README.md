# Second by Second, Typescript 2 Version

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
| local         | 'localhost:9080/dist'                  |
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

## Deployment

Have a look at `S3upload.php` .

###Requirements
- php7+
- npm5+
- php composer
- typescript 2+
- python 3 (WebServer Only)
