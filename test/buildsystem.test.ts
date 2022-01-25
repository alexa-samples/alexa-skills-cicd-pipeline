import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Buildsystem from '../lib/buildsystem-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Buildsystem.BuildsystemStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
