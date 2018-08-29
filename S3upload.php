<?php
/**
 * Upload files recursive to S3 bucket configured in s3config-(pre)produciton.json
 * @author: dominik.gorczyca@gfk.com
 */
require_once __DIR__.'/vendor/autoload.php';

use Aws\S3\S3Client;

$allowedEnvs = ['preproduction', 'production'];
if ($argc != 2 || !in_array($argv[1], $allowedEnvs)) {
    echo 'Environment needed, either "production" or "preproduction"'.PHP_EOL;
    echo 'Syntax: php S3upload.php <preproduction|production>'.PHP_EOL;
    echo 'Example: php S3upload.php preproduction'.PHP_EOL;
    die(1);
}

$projectConfig = json_decode(file_get_contents(__DIR__.'/s3config-'.$argv[1].'.json'));

$pathS3 = str_replace("\\", '/', __DIR__).'/website';

function changeUrl(string $env, string $content) {
    $map = [
        'preproduction' => 'demo-config-preproduction.sensic.net',
        'production' => 'demo-config.sensic.net'
    ];

    return str_replace('##ENVDOMAIN##', $map[$env], $content);
}

function copyFile(string $src, string $dest, string $env) {
    $data = file_get_contents($src);
    $data = changeUrl($env, $data);
    file_put_contents($dest, $data);
}

$files = [
    $pathS3.'/campaign.html',
    $pathS3.'/content.html',
    $pathS3.'/video.html'
];

foreach ($files as $file) {
    copyFile($file.'.tmpl', $file, $argv[1]);
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
/* @var SplFileObject $fileInfo*/
foreach ($iterator as $fileInfo) {
    $file = $fileInfo->getFilename();
    $path = str_replace("\\", '/', $fileInfo->getPath());
    if (substr($path, -1) === '/') {
        $key = str_replace($pathS3.'/', '', $path);
    } else {
        $key = str_replace($pathS3, '', $path);
    }
    $key = $projectConfig->aws->s3->target->path.$key;

    echo "Uploading source file: ".$path."/".$file.PHP_EOL;
    echo "Uploading target file: ".$key.'/'.$file.PHP_EOL;
    uploadS3Object($client, $projectConfig->aws->s3->target->bucket, $key.'/'.$file, $path.'/'.$file);
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
    $options = [
        'Bucket'       => $bucket,
        'Key'          => $key,
        'SourceFile'   => $source,
        'ACL'          => 'public-read'
    ];

    //print_r($options);
    $result = $client->putObject($options);
    echo $result['ObjectURL']."\n";
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
