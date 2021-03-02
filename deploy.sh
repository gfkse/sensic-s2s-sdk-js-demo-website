#!/bin/bash

s3_bucket=sensic-demo
region=eu-central-1
target_folder=$1
cloudfront_dist_id=$2

# Copy all files (except .tmpl.html) from ./website/
aws s3 sync dist s3://${s3_bucket}/${target_folder}/ --exclude *.tmpl.html --region ${region}

aws cloudfront create-invalidation --distribution-id ${cloudfront_dist_id} --paths "/*" 
