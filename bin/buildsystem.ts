#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { PipelineStack, PipelineStackProps } from '../lib/buildsystem-stack';

const { SKILL_STACK_NAME } = process.env;

const app = new cdk.App();

new PipelineStack(
  app, 
  `${SKILL_STACK_NAME}-pipeline`,
  {
    skillStackName: `${SKILL_STACK_NAME}-skill`,
    repositoryName: `${SKILL_STACK_NAME}-build-repo`,
    branchName: "feature/pipeline"
  }
);