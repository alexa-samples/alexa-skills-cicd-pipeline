#!/bin/bash

TOP_LOCATION=$(pwd)

echo "Installing jq"

sudo yum install -y jq

echo "Installing Node Packages"

npm i
cd src/skills/demo-skill/simple-backend
npm i
cd $TOP_LOCATION

TOKEN_FILENAME=token.output

echo "Loading configuration file .env"
source ./.env

REQUIREMENTS="\
ALEXA_CUSTOMER_ID \
ALEXA_VENDOR_ID \
LWA_CLIENT_ID \
LWA_CLIENT_SECRET \
SKILL_STACK_NAME \
"

for x in $REQUIREMENTS; do
    if [[ -v $x ]]; then
        echo "$x=${!x}"
    else 
        echo "$x is undefined".
        echo "please refer to README.md to set up your environment"
        exit 127
    fi
done

echo "Generating LWA Refresh Token"

npx ask util generate-lwa-tokens \
    --client-id $LWA_CLIENT_ID \
    --client-confirmation $LWA_CLIENT_SECRET \
    --scopes "alexa::ask:skills:readwrite alexa::ask:models:readwrite" \
    --no-browser | tee $TOKEN_FILENAME

sed -i '/{/,$!d' $TOKEN_FILENAME

LWA_REFRESH_TOKEN=$(cat $TOKEN_FILENAME | jq .refresh_token | xargs)
rm $TOKEN_FILENAME

echo $LWA_REFRESH_TOKEN

aws ssm put-parameter --overwrite \
    --name "/$SKILL_STACK_NAME/alexa-developer-vendor-id" \
    --type "String" \
    --value $ALEXA_VENDOR_ID

aws ssm put-parameter --overwrite \
    --name "/$SKILL_STACK_NAME/lwa-client-id" \
    --type "String" \
    --value $LWA_CLIENT_ID

aws secretsmanager create-secret  \
    --name "/$SKILL_STACK_NAME/lwa-client-secret" \
    --secret-string $LWA_CLIENT_SECRET

aws secretsmanager create-secret  \
    --name "/$SKILL_STACK_NAME/lwa-refresh-token" \
    --secret-string $LWA_REFRESH_TOKEN

npx aws-cdk@1.x bootstrap
npx aws-cdk@1.x deploy
