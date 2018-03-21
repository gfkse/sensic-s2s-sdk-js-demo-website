<?php
/**
 * Build a production ready files for S3 bucket
 * User: dominik.gorczyca@gfk.com
 * Date: 14.02.17
 * Time: 10:19
 */
require 'vendor/autoload.php';

use Aws\S3\S3Client;
use Aws\CloudFront\CloudFrontClient;

if (count($argv) < 2 || count($argv) > 3) {
    echo 'Argument missing, project name needed'.PHP_EOL;
    echo 'Syntax: php build.php <project> [deploy]'.PHP_EOL;
    echo 'Example: php build.php de1-preproduction deploy'.PHP_EOL;
    die(1);
}

$project = $argv[1];

checkoutProjectConfigBranch($project);

$pathDeploy = __DIR__.'/deploy';
$pathS3 = $pathDeploy.'/S3';


if (!file_exists(__DIR__.'/project/project.json')) {
    echo 'Config json not found at "'.__DIR__.'/project/project.json"'.PHP_EOL;
    exit(3);
}

if (!file_exists(__DIR__.'/project/project.json')) {
    die('Project file not found'."\n");
}
$projectConfig = json_decode(file_get_contents(__DIR__.'/project/project.json'));

createPath($pathS3);

//Upload to S3

if (empty($argv[2]) or $argv[2] != 'deploy') {
    exit("Project files created in ".__DIR__."/deploy/S3\n");
}

if (!isset($projectConfig->tracking->aws->s3)) {
    die('S3 Section in projectfile not found'."\n");
}

$s3Credentials = require_once 'aws_credentials.php';

$client = new S3Client(
    [
        'region' => $projectConfig->tracking->aws->s3->region,
        'version' => '2006-03-01',
        'credentials' => $s3Credentials
    ]
);

echo "S3:".PHP_EOL;
$filepath = $projectConfig->tracking->aws->s3->path;
if (!isset($projectConfig->tracking->aws->s3->header->js)) {
    die('S3 headers for file type "js" not found on the file ("'.$project.'.json'.'")'."\n");
}

if (!isset($projectConfig->tracking->aws->s3->header->html)) {
    die('S3 headers for file type "html" not found on the file ("'.$project.'.json'.'")'."\n");
}

$jsHeaders = (array)$projectConfig->tracking->aws->s3->header->js;
$htmlHeaders = (array)$projectConfig->tracking->aws->s3->header->html;
$bucket = $projectConfig->tracking->aws->s3->bucket;

//deploy($client, $jsHeaders, $bucket, $jsSuiApiS3, $jsSuiApiFile, $filepath);

echo "Cloudfront:".PHP_EOL;
if (!isset($projectConfig->tracking->aws->cloudfront->distributionId)) {
    die('Cloudfront Section in projectfile not found'."\n");
}

$distribution = $projectConfig->tracking->aws->cloudfront->distributionId;

/*
$files = [
    $jsSuiApiFile
];
*/

//$Invalidation = invalidateCloudfrontFiles($s3Credentials, $distribution, $files);

//echo 'Status for invalidation Id "'.$Invalidation["Id"].'": '.$Invalidation["Status"].PHP_EOL;

echo 'Elastic Beanstalk:'.PHP_EOL;

$s3Region = $projectConfig->tracking->aws->s3->region;
$appName = $projectConfig->tracking->aws->elasticBeanstalk->applicationName;
$envName = $projectConfig->tracking->aws->elasticBeanstalk->environmentName;
$envId = $projectConfig->tracking->aws->elasticBeanstalk->environmentId;

$ebS3 = new S3Client(
    [
        'region' => $s3Region,
        'version' => '2006-03-01',
        'credentials' => $s3Credentials
    ]
);


/**
 * @param $project
 */
function checkoutProjectConfigBranch($project)
{
    $output = [];
    chdir(__DIR__);
    exec("rm -rf project", $output);
    exec("git submodule init", $output);
    exec("git submodule update", $output);
    chdir(__DIR__."/project");
    exec("git fetch", $output);
    exec("git checkout ".$project, $output);
    exec("git pull", $output);
    foreach ($output as $line) {
        echo $line.PHP_EOL;
    }
}

/**
 * Invalidate uploaded files to S3 in Cloudfront
 * @param array $s3Credentials
 * @param $distribution
 * @param array $files
 * @return array
 */
function invalidateCloudfrontFiles(array $s3Credentials, $distribution, array $files)
{
    $CloudfrontClient = new CloudFrontClient(
        [
            'region' => 'us-east-1',
            'version' => '2014-11-06',
            'credentials' => $s3Credentials
        ]
    );

    $items = [];
    foreach ($files as $item) {
        $items[] = '/'.$item;
    }

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

function microtimeFloat()
{
    list($usec, $sec) = explode(" ", microtime());
    return round((float)$usec + (float)$sec, 3);
}
