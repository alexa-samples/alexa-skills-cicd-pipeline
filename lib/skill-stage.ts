import { Construct, StackProps, Stage } from '@aws-cdk/core';
import { AlexaCdkStack } from './alexa-cdk-stack';

export class SkillStage extends Stage {

  constructor(scope: Construct, id: string, stackName: string, props?: StackProps) {
    super(scope, id, props);

    const service = new AlexaCdkStack(this, stackName, {
      tags: {
        Application: stackName,
        Environment: id
      }
    });

  }
}
