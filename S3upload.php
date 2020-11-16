<?php
/**
 * Upload files recursive to S3 bucket configured in s3config-(pre)produciton.json
 * @author: dominik.gorczyca@gfk.com
 */
require_once __DIR__.'/vendor/autoload.php';

use Aws\S3\S3Client;

$allowedEnvs = ['preproduction', 'production', 'staging', 'development'];
if ($argc < 2 || !in_array($argv[1], $allowedEnvs)) {
    echo 'Environment needed, either "production" or "preproduction"'.PHP_EOL;
    echo 'Syntax: php S3upload.php <preproduction|production>'.PHP_EOL;
    echo 'Example: php S3upload.php preproduction'.PHP_EOL;
    die(1);
}

$skipVideos = ($argc > 2 && $argv[2] === "-q");

$projectConfig = json_decode(file_get_contents(__DIR__.'/s3config-'.$argv[1].'.json'));

$pathS3 = str_replace("\\", '/', __DIR__).'/website';

function changeUrl(string $env, string $content) {
    $envDomainMap = [
        'preproduction' => 'demo-config-preproduction.sensic.net',
        'production'    => 'demo-config.sensic.net'
    ];
    $envS3UrlMap = [
        'preproduction' => 'https://s3.eu-central-1.amazonaws.com/config-preproduction.sensic.net/demo/s2s',
        'production'    => 'https://s3.eu-central-1.amazonaws.com/config.sensic.net/demo/s2s'
    ];
    $result = str_replace('##ENVDOMAIN##', $envDomainMap[$env], $content);
    $result = str_replace('##ENVS3URL##', $envS3UrlMap[$env], $result);
    return $result;
}

function copyFile(string $src, string $dest, string $env) {
    $data = file_get_contents($src);
    $data = changeUrl($env, $data);
    file_put_contents($dest, $data);
}

$files = [
    $pathS3.'/index.html',
    $pathS3.'/campaign-img.html',
    $pathS3.'/campaign-img-debug.html',
    $pathS3.'/campaign-img-fixed-sui.html',
    $pathS3.'/campaign-img-ai-param.html',
    $pathS3.'/campaign-js.html',
    $pathS3.'/content.html',
    $pathS3.'/video.html',
    $pathS3.'/html5video.html',
    $pathS3.'/html5videoctv.html',
    $pathS3.'/html5videotcf.html',
    $pathS3.'/html5videotcfCookiePro.html',
    $pathS3.'/youtube-video.html',
    $pathS3.'/sui-connector-test.html',
    $pathS3.'/touchpoint-test.html',
    $pathS3.'/long-url-test.html',
];

foreach ($files as $file) {
    $tmplFile = substr_replace($file, ".tmpl", strrpos($file, '.'), 0);
    copyFile($tmplFile, $file, $argv[1]);
}

$s3Credentials = require_once 'aws_credentials.php';

$executing = microtimeFloat();
$client = new S3Client(
    [
        'region' => $projectConfig->aws->s3->target->region,
        'version' => '2006-03-01',
        'credentials' => $s3Credentials
    ]
);

$directory = new \RecursiveDirectoryIterator($pathS3);
$filter = new \RecursiveCallbackFilterIterator($directory, function (\SplFileInfo $current) {
    // Skip hidden and *.tmpl files and directories.
    if ($current->getFilename()[0] === '.' || $current->getExtension() === 'tmpl') {
        return false;
    }

    return true;
});
$iterator = new \RecursiveIteratorIterator($filter);
$files = 0;
/* @var SplFileObject $fileInfo */
foreach ($iterator as $fileInfo) {
    $file = $fileInfo->getFilename();
    if ($skipVideos && substr($file, -4) === ".mp4") {
        continue;
    }
    $path = str_replace("\\", '/', $fileInfo->getPath());
    if (substr($path, -1) === '/') {
        $key = str_replace($pathS3.'/', '', $path);
    } else {
        $key = str_replace($pathS3, '', $path);
    }
    $key = $projectConfig->aws->s3->target->path.$key;
    $bucket = $projectConfig->aws->s3->target->bucket;
    uploadS3Object($client, $bucket, $key.'/'.$file, $path.'/'.$file);
    $files++;
}

echo 'Files: '.$files.PHP_EOL;
echo 'Executing: '.round(microtimeFloat() - $executing, 3)." seconds\n";
$Invalidation = invalidateCloudfrontFiles($s3Credentials, $argv[1]);
echo 'Status for invalidation Id "'.$Invalidation["Id"].'": '.$Invalidation["Status"].PHP_EOL;

/**
 * @param S3Client $client
 * @param $bucket
 * @param $key
 * @param $source
 */
function uploadS3Object(S3Client $client, $bucket, $key, $source)
{
    echo "Uploading ".$source.PHP_EOL;
    $options = [
        'Bucket'       => $bucket,
        'Key'          => $key,
        'SourceFile'   => $source,
        'ACL'          => 'public-read'
    ];
    $result = $client->putObject($options);
    echo "--> ".$result['ObjectURL'].PHP_EOL;
}

/**
 * Invalidate uploaded files to S3 in Cloudfront
 * @param array $s3Credentials
 * @param $env
 * @return array
 */
function invalidateCloudfrontFiles(array $s3Credentials, string $env)
{

    $ditributionIds = [
        'preproduction' => 'E3HAXD5PN1MFDS',
        'production' => 'E2XAX2YAH410FH'
    ];

    $distribution = $ditributionIds[$env];


    $CloudfrontClient = new \Aws\CloudFront\CloudFrontClient(
        [
            'region' => 'us-east-1',
            'version' => '2014-11-06',
            'credentials' => $s3Credentials
        ]
    );

    $items = [];
    $items[] = '/*';

    $epoch = date('U');
    try {
        /**
         * @var $result \AWS\Result
         */
        $result = $CloudfrontClient->createInvalidation(
            [
                'DistributionId' => $distribution,
                'InvalidationBatch' => [
                    'Paths' => [
                        'Quantity' => count($items),
                        'Items' => $items,
                    ],
                    'CallerReference' => $distribution.$epoch
                ]
            ]
        );
    } catch (Exception $e) {
        die("Invalidation error: ".$e->getMessage().PHP_EOL);
    }

    return $result->get("Invalidation");
}

function microtimeFloat()
{
    list($usec, $sec) = explode(" ", microtime());
    return round((float)$usec + (float)$sec, 3);
}
