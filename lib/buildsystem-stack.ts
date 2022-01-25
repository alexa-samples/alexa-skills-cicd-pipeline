import {Stack, Construct, StackProps, CfnOutput} from '@aws-cdk/core';
import * as cp from '@aws-cdk/aws-codepipeline';
import * as cpa from '@aws-cdk/aws-codepipeline-actions';
import * as pipelines from '@aws-cdk/pipelines';
import * as codecommit from '@aws-cdk/aws-codecommit';
import { SkillStage } from './skill-stage';

const { SKILL_STACK_NAME } = process.env;

export interface PipelineStackProps extends StackProps {
  skillStackName: string,
  repositoryName: string,
  branchName: string
}

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: PipelineStackProps){
    super(scope, id, props);
    
    const {
      repositoryName, branchName, skillStackName 
    } = props;
    
    const sourceRepo = new codecommit.Repository(
      this, 'CodeCommitSourceRepo', {
      repositoryName
    });
    
    const sourceArtifact = new cp.Artifact();
    const cloudAssemblyArtifact = new cp.Artifact();
    
    const sourceAction = new cpa.CodeCommitSourceAction({
      actionName: 'CodeCommit',
      output: sourceArtifact,
      branch: branchName,
      repository: sourceRepo
    });

    // TODO: find better command for npm build in a different path
    const synthAction = new pipelines.SimpleSynthAction({
      cloudAssemblyArtifact,
      sourceArtifact,
      environment:{
        privileged: true
      },
      buildCommands: [
        "npm ci",// needed to install the build dependencies for the stack
        "cd src/skills/demo-skill/simple-backend",// needed to install the skill backend dependencies
        "npm ci", // needed to install the skill backend dependencies
        "cd ../../../.." // going back to root
      ],
      synthCommand: "npx cdk synth",
      environmentVariables:{
        SKILL_STACK_NAME: {
          value: SKILL_STACK_NAME
        }
      }
      
    });
    
    const pipeline = new pipelines.CdkPipeline(this, 'Pipeline', {
      cloudAssemblyArtifact,
      sourceAction,
      synthAction
    });
    
    const skillStage = new SkillStage(this, 'SkillStage', skillStackName);
    pipeline.addApplicationStage(skillStage);
    
    const BuildRepositoryOutput = new CfnOutput(
      this, 'BuildRepository', {
        value: repositoryName
      }
    );
    
    const BuildRepositoryBranchOutput = new CfnOutput(
      this, 'BuildRepositoryBranch', {
        value: branchName
      }
    );
    
    const DeploymentRegionOutput = new CfnOutput(
      this, 'DeploymentRegion', {
        value: Stack.of(this).region
      }
    );
    

    
  }
}