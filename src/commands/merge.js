const joi = require('@springworks/input-validator').joi;
const validateSchema = require('@springworks/input-validator').validateSchema;
const git_wrapper = require('../git/git-service');

const internals = {};

const merge_validation_schema = joi.object().required().keys({
  repo_owner: joi.string().required().trim(),
  repo_name: joi.string().required().trim(),
  branch_name: joi.string().required().trim(),
});

exports.run = (process, params) => {
  const github_token = process.env.GITBOT_GITHUB_TOKEN;
  return Promise.resolve(params)
      .then(internals.validateParams)
      .then(valid_params => {
        const git_service = git_wrapper.create(github_token);
        return internals.perform_merge(git_service, valid_params.repo_owner, valid_params.repo_name, valid_params.branch_name);
      });
};

internals.validateParams = params => {
  try {
    return validateSchema(params, merge_validation_schema);
  }
  catch (err) {
    console.error('validateParams failed: %j', err);
    return Promise.reject(err);
  }
};

internals.perform_merge = (git_service, repo_owner, repo_name, branch_name) => {
  return git_service.getOpenPullRequestForSpecificBranch(repo_owner, repo_name, branch_name)
      .then(pull_request => git_service.mergePullRequest(repo_owner, repo_name, pull_request.number)
          .then(() => git_service.deleteBranch(repo_owner, repo_name, branch_name)));
};
