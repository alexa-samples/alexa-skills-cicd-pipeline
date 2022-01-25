#!/bin/bash
source .env
BUILD_REPO_NAME=$(
    aws cloudformation describe-stacks --stack-name ${SKILL_STACK_NAME}-pipeline \
    --query 'Stacks[0].Outputs[?OutputKey==`BuildRepository`].OutputValue' \
    --output json | jq .[0] | xargs
)

BUILD_REPO_REGION=$(
    aws cloudformation describe-stacks --stack-name ${SKILL_STACK_NAME}-pipeline \
    --query 'Stacks[0].Outputs[?OutputKey==`DeploymentRegion`].OutputValue' \
    --output json | jq .[0] | xargs
)

BUILD_REPO_BRANCH=$(
    aws cloudformation describe-stacks --stack-name ${SKILL_STACK_NAME}-pipeline \
    --query 'Stacks[0].Outputs[?OutputKey==`BuildRepositoryBranch`].OutputValue' \
    --output json | jq .[0] | xargs
)

BUILD_REPO_URI="codecommit::${BUILD_REPO_REGION}://${BUILD_REPO_NAME}"

git remote add build $BUILD_REPO_URI
git checkout -b $BUILD_REPO_BRANCH