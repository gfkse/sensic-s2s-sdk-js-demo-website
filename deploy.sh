#!/bin/bash

s3_bucket=sensic-demo
region=eu-central-1
target_folder=$1

# Copy all files (except .tmpl.html) from ./website/
aws s3 cp ./website/* s3://${s3_bucket}/${target_folder}/ --exclude *.tmpl.html --region ${region} --recursive