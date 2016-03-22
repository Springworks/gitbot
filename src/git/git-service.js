const GitHubApi = require('github');

const internals = {};

exports.create = github_token => {
  const github_client = internals.getAuthenticatedGitHubClient(github_token);
  return {
    getPullRequest: internals.getPullRequest.bind(null, github_client),
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
    console.log(branch_name);
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
