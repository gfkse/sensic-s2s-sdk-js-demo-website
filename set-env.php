<?php
/**
 * Set sdk target url for html files
 * @author: dominik.gorczyca@gfk.com
 */
$allowedEnvs = ['preproduction', 'production', 'development'];
if ($argc != 2 || !in_array($argv[1], $allowedEnvs)) {
    echo 'Environment needed, either "production" or "preproduction" or "development"'.PHP_EOL;
    echo 'Syntax: php set-env.php <preproduction|production>'.PHP_EOL;
    echo 'Example: php set-en.php preproduction'.PHP_EOL;
    die(1);
}

function changeUrl(string $env, string $content) {
    $map = [
        'preproduction' => 'demo-config-preproduction.sensic.net',
        'production' => 'demo-config.sensic.net',
        'development' => 's2s.dev/website/dist'
    ];

    return str_replace('##ENVDOMAIN##', $map[$env], $content);
}

function copyFile(string $src, string $dest, string $env) {
    $data = file_get_contents($src);
    $data = changeUrl($env, $data);
    file_put_contents($dest, $data);
}

$files = [
    __DIR__.'/website/campaign.html',
    __DIR__.'/website/content.html',
    __DIR__.'/website/video.html'
];

foreach ($files as $file) {
    copyFile($file.'.tmpl', $file, $argv[1]);
}

