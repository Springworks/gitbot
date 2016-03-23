#!/usr/bin/env node

const program = require('commander');
const merge = require('../commands/merge');

program
    .option('-O, --owner <owner>', 'repository owner')
    .option('-R, --repository-name <repository name>', 'repository name')
    .option('-N, --pull-request-number <pull request number>', 'pull request number')
    .parse(process.argv);

merge.run(process, {
      repo_owner: program.owner,
      repo_name: program.repositoryName,
      pull_request_number: program.pullRequestNumber,
    })
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch(err => {
      console.error('Error merging pull request', err);
      process.exit(1);
    });
