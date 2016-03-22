const joi = require('@springworks/input-validator').joi;
const validateSchema = require('@springworks/input-validator').validateSchema;
const git_wrapper = require('../git/git-service');

const internals = {};

const auto_merge_validation_schema = joi.object().required().keys({
  repo_owner: joi.string().required().trim(),
  repo_name: joi.string().required().trim(),
  pull_request_number: joi.number().required(),
});

exports.run = (process, params) => {
  const github_token = process.env.GITBOT_GITHUB_TOKEN;
  return Promise.resolve(params)
      .then(internals.validateParams)
      .then(valid_params => {
        const git_service = git_wrapper.create(github_token);
        return internals.autoMerge(git_service, valid_params.repo_owner, valid_params.repo_name, valid_params.pull_request_number);
      });
};

internals.validateParams = params => {
  try {
    return validateSchema(params, auto_merge_validation_schema);
  }
  catch (err) {
    console.error('validateParams failed: %j', err);
    return Promise.reject(err);
  }
};

internals.autoMerge = (git_service, repo_owner, repo_name, pull_request_number) => {
  return git_service.getPullRequest(repo_owner, repo_name, pull_request_number)
      .then(pull_request => git_service.mergePullRequest(repo_owner, repo_name, pull_request_number)
          .then(() => git_service.deleteBranch(repo_owner, repo_name, pull_request.head.ref)));
};
