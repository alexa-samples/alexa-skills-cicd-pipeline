import * as cdk from '@aws-cdk/core';
import * as lambdaNode from '@aws-cdk/aws-lambda-nodejs';
import * as ssm from '@aws-cdk/aws-ssm';
import * as path from 'path';
import { Skill } from 'cdk-alexa-skill';

const { SKILL_STACK_NAME } = process.env;

export class AlexaCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const alexaVendorId = ssm.StringParameter.valueForStringParameter(
      this, `/${SKILL_STACK_NAME}/alexa-developer-vendor-id`
    );
    const lwaClientId = ssm.StringParameter.valueForStringParameter(
      this, `/${SKILL_STACK_NAME}/lwa-client-id`
    );
    const lwaClientSecret = cdk.SecretValue.secretsManager(
      `/${SKILL_STACK_NAME}/lwa-client-secret`
    );
    const lwaRefreshToken = cdk.SecretValue.secretsManager(
      `/${SKILL_STACK_NAME}/lwa-refresh-token`
    );
    
    const pathToCodeEntry = path.join(
      __dirname, '../src/skills/demo-skill/simple-backend/index.ts'
    );
    const endpointLambdaFunction = new lambdaNode.NodejsFunction(
      this, 'SimpleBackend', {
        entry: pathToCodeEntry,
        timeout: cdk.Duration.seconds(60)
      }
    );
    
    const skillPackagePath = path.join(
      __dirname, '../src/skills/demo-skill/package'
    );

    const skill = new Skill(this, 'Skill', {
      endpointLambdaFunction,
      skillPackagePath,
      alexaVendorId,
      lwaClientId,
      lwaClientSecret,
      lwaRefreshToken
    });

  }
}