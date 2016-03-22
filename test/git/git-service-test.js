const git_wrapper = require('../../src/git/git-service');

describe('test/git/git-service-test.js', () => {
  const github_token = '123456789';

  describe('create', () => {

    it('should return object with public functions', () => {
      const git_service = git_wrapper.create(github_token);
      git_service.should.have.keys([
        'getPullRequest',
        'mergePullRequest',
        'deleteBranch',
      ]);
    });

  });

  describe('internals.getAuthenticatedGitHubClient', () => {

    it('should use version 3 of the API', () => {
      git_wrapper.internals.getAuthenticatedGitHubClient(github_token)
          .should.have.property('version', '3.0.0');
    });

    it('should return a github client with auth set', () => {
      git_wrapper.internals.getAuthenticatedGitHubClient(github_token).auth.should.eql({
        type: 'token',
        token: github_token,
      });
    });

  });

  describe('internals.getPullRequest', () => {
    let github_service;

    describe('when call goes well', () => {

      beforeEach(() => {
        github_service = {
          pullRequests: {
            get: sinon.stub().yieldsAsync(null, { url: 'https://api.github.com/repos/joe/test/pulls/4' }),
          },
        };
      });

      it('should resolve with pull request', () => {
        return git_wrapper.internals.getPullRequest(github_service, '', '', 1)
            .should
            .be
            .fulfilledWith({ url: 'https://api.github.com/repos/joe/test/pulls/4' });
      });

    });

    describe('when call goes bad', () => {
      let mock_err;

      beforeEach(() => {
        mock_err = new Error('Mock error');
        github_service = {
          pullRequests: {
            get: sinon.stub().yieldsAsync(mock_err, null),
          },
        };
      });

      it('should reject with error', () => {
        return git_wrapper.internals.getPullRequest(github_service, '', '', 1).should.be.rejectedWith(mock_err);
      });

    });

  });

  describe('internals.mergePullRequest', () => {
    let github_service;

    describe('when call goes well', () => {

      beforeEach(() => {
        github_service = {
          pullRequests: {
            merge: sinon.stub().yieldsAsync(null, { merged: true }),
          },
        };
      });

      it('should resolve with pull request', () => {
        return git_wrapper.internals.mergePullRequest(github_service, '', '', 1).should.be.fulfilledWith({ merged: true });
      });

    });

    describe('when call goes bad', () => {
      let mock_err;

      beforeEach(() => {
        mock_err = new Error('Mock error');
        github_service = {
          pullRequests: {
            merge: sinon.stub().yieldsAsync(mock_err, null),
          },
        };
      });

      it('should reject with error', () => {
        return git_wrapper.internals.mergePullRequest(github_service, '', '', 1).should.be.rejectedWith(mock_err);
      });

    });

  });

  describe('internals.deleteBranch', () => {
    let github_service;

    describe('when call goes well', () => {

      beforeEach(() => {
        github_service = {
          gitdata: {
            deleteReference: sinon.stub().yieldsAsync(null, {}),
          },
        };
      });

      it('should resolve with pull request', () => {
        return git_wrapper.internals.deleteBranch(github_service, '', '', '').should.be.fulfilledWith({});
      });

    });

    describe('when call goes bad', () => {
      let mock_err;

      beforeEach(() => {
        mock_err = new Error('Mock error');
        github_service = {
          gitdata: {
            deleteReference: sinon.stub().yieldsAsync(mock_err, null),
          },
        };
      });

      it('should reject with error', () => {
        return git_wrapper.internals.deleteBranch(github_service, '', '', '').should.be.rejectedWith(mock_err);
      });

    });

  });

});
