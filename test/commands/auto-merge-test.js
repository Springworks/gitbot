const auto_merge = require('../../src/commands/auto-merge');
const git_wrapper = require('../../src/git/git-service');
const autorestoredSandbox = require('@springworks/test-harness/autorestored-sandbox');

const internals = {};

describe('test/commands/auto-merge-test.js', () => {
  const sinon_sandbox = autorestoredSandbox();
  console.error = sinon.stub();

  describe('run', () => {
    let git_service;
    let mock_process;
    let params;

    beforeEach(() => {
      mock_process = internals.createMockProcess();
      params = internals.createValidParams();
    });

    describe('with valid params', () => {

      describe('when everything goes well', () => {

        beforeEach(() => {
          git_service = internals.mockHappyGitService();
          sinon_sandbox.stub(git_wrapper, 'create').returns(git_service);
        });

        it('should resolve without errors', () => {
          return auto_merge.run(mock_process, params).should.be.fulfilled();
        });

        it('should call getPullRequest with correct arguments', () => {
          return auto_merge.run(mock_process, params).then(() => {
            git_service.getPullRequest.should.be.calledWith(params.repo_owner, params.repo_name, params.pull_request_number);
          });
        });

        it('should call mergePullRequest with correct arguments', () => {
          return auto_merge.run(mock_process, params).then(() => {
            git_service.mergePullRequest.should.be.calledWith(params.repo_owner, params.repo_name, params.pull_request_number);
          });
        });

        it('should call deleteBranch with correct arguments', () => {
          return auto_merge.run(mock_process, params).then(() => {
            git_service.deleteBranch.should.be.calledWith(params.repo_owner, params.repo_name, 'feature/super-feature');
          });
        });

      });

      describe('when getting pull request fails', () => {

        beforeEach(() => {
          git_service = internals.mockSadGitService();
          sinon_sandbox.stub(git_wrapper, 'create').returns(git_service);
        });

        it('should resolve with mock error', () => {
          return auto_merge.run(mock_process, params).should.be.rejectedWith({
            message: 'Mock error',
          });
        });

        it('should not call mergePullRequest', () => {
          return auto_merge.run(mock_process, params).catch(() => {
            git_service.mergePullRequest.should.not.be.called();
          });
        });

        it('should not call deleteBranch', () => {
          return auto_merge.run(mock_process, params).catch(() => {
            git_service.deleteBranch.should.not.be.called();
          });
        });

      });

    });

    describe('with invalid params', () => {
      const required_params = [
        'repo_owner',
        'repo_name',
        'pull_request_number',
      ];

      required_params.forEach(required_param => {

        describe(`when missing param: ${required_param}`, () => {

          beforeEach(() => {
            delete params[required_param];
          });

          it('should throw validation error', () => {
            return auto_merge.run(mock_process, params).should.be.rejectedWith({
              code: 422,
              message: 'Validation Failed',
            });
          });

        });

      });

    });

  });

});

internals.mockHappyGitService = () => {
  return {
    getPullRequest: sinon.stub().returns(Promise.resolve({ head: { ref: 'feature/super-feature' } })),
    mergePullRequest: sinon.stub().returns(Promise.resolve()),
    deleteBranch: sinon.stub().returns(Promise.resolve()),
  };
};

internals.mockSadGitService = () => {
  return {
    getPullRequest: sinon.stub().returns(Promise.reject(new Error('Mock error'))),
    mergePullRequest: sinon.stub().returns(Promise.resolve()),
    deleteBranch: sinon.stub().returns(Promise.resolve()),
  };
};

internals.createMockProcess = () => {
  return {
    env: {
      GITBOT_GITHUB_TOKEN: '123456789',
    },
  };
};

internals.createValidParams = () => {
  return {
    repo_owner: 'the_owner',
    repo_name: 'repo_name',
    pull_request_number: 8,
  };
};
