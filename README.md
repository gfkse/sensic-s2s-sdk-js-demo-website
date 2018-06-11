#Second by Second, Typescript 2 Version

## Usage

**Build config first:**

php build.php [environment] <deploy>

``environment "dev" creates config for local development using python http server``

[environment] is a branch name in DAM/dam-config git repository on GfK stash and will be cloned after executing build.php

##Development

Install all NPM & Composer dependencies first
	
	php composer.phar install
	npm install
	 
Before starting development you need to create a config file (S2sSdkConf.ts) in path Collector with:

	php build.php dev

Now you can use gulp Task "develop", which creates a s2s-web-dev.js file in "dist" path. The DemoWebsite loads and uxecutes this file. Note that the "develop" gulp-task creates a SDK with console.log/warn/info and is not minimized for better debugging. Execution of buil.php with different input parameter than "dev" is using "project" gulp-task, which removes console.log and comments entries and is also minimized and GZIP compressed.

Start a Python-WebServer for development in your favorite terminal.
Each incomming request will be printed out to the terminal.

	TestServer/server_intact.py 
	
It creates a small HTTP-Server on Port 8881, the WebDir is "website" path that includes a DemoWebsite with three VideoPlayers and loads the SDK. All requests are sending to this HTTP-Server unless you are build the SDK with other config. Before the HTTP-Server is started some files will be copied to the target path, note that this files will be overwritten in target path by every Server start.

***If POST requests are pending restart the HTTP-Server!***

##Project build process

Optional parameter ``deploy`` is deploying the SDK to AWS infrastructure

Example:

	php build.php s2s-demo-preproduction deploy

###Note!

Run UnitTests before deploying

**Execute UnitTests**

	mpn test

###Requirements
- php7+
- npm5+
- php composer
- typescript 2+
- python 3 (WebServer Only)
