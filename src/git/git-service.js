const GitHubApi = require('github');
const createError = require('@springworks/error-factory').createError;

const internals = {};

exports.create = github_token => {
  const github_client = internals.getAuthenticatedGitHubClient(github_token);
  return {
    getPullRequest: internals.getPullRequest.bind(null, github_client),
    getOpenPullRequestForSpecificBranch: internals.getOpenPullRequestForSpecificBranch.bind(null, github_client),
    mergePullRequest: internals.mergePullRequest.bind(null, github_client),
    deleteBranch: internals.deleteBranch.bind(null, github_client),
  };
};

internals.getAuthenticatedGitHubClient = github_token => {
  const github_client = new GitHubApi({
    version: '3.0.0',
  });

  github_client.authenticate({
    type: 'token',
    token: github_token,
  });

  return github_client;
};

internals.getPullRequest = (github, repo_owner, repo_name, pull_request_number) => {
  return new Promise((resolve, reject) => {
    github.pullRequests.get({
      user: repo_owner,
      repo: repo_name,
      number: pull_request_number,
    }, (err, res) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(res);
    });
  });
};

internals.getOpenPullRequestForSpecificBranch = (github, repo_owner, repo_name, branch_name) => {
  const head = `${repo_owner}:refs/heads/${branch_name}`;
  return new Promise((resolve, reject) => {
    github.pullRequests.getAll({
      user: repo_owner,
      repo: repo_name,
      state: 'open',
      head: head,
    }, (err, res) => {
      if (err) {
        reject(err);
        return;
      }

      if (res && Array.isArray(res) && res.length > 0) {
        resolve(res[0]);
        return;
      }

      reject(createError({
        code: 404,
        message: `No open pull request found for this branch: ${branch_name}`,
      }));
    });
  });
};

internals.mergePullRequest = (github, repo_owner, repo_name, pull_request_number) => {
  return new Promise((resolve, reject) => {
    github.pullRequests.merge({
      user: repo_owner,
      repo: repo_name,
      number: pull_request_number,
    }, (err, res) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(res);
    });
  });
};

internals.deleteBranch = (github, repo_owner, repo_name, branch_name) => {
  const ref = `heads/${branch_name}`;
  return new Promise((resolve, reject) => {
    github.gitdata.deleteReference({
      user: repo_owner,
      repo: repo_name,
      ref: ref,
    }, (err, res) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(res);
    });
  });
};

if (process.env.NODE_ENV === 'test') {
  exports.internals = internals;
}
