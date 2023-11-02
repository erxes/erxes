const fs = require('fs');
const { resolve } = require('path');
const yaml = require('yaml');

const filePath = (pathName) => {
  if (pathName) {
    return resolve(process.cwd(), pathName);
  }

  return resolve(process.cwd());
};

var releaseYaml = {
  name: 'Publish Release',

  on: {
    push: {
      tags: ['*']
      // branches: ['dev', 'master']
    }
  },
  jobs: {
    release: {
      'runs-on': 'ubuntu-18.04',
      steps: [
        {
          uses: 'actions/checkout@v2'
        },
        {
          name: 'Get release version',
          id: 'get_release_version',
          run: 'echo ::set-output name=VERSION::${GITHUB_REF#refs/tags/}'
        },
        {
          name: 'Configure AWS credentials',
          uses: 'aws-actions/configure-aws-credentials@v1',
          with: {
            'aws-access-key-id': '${{ secrets.AWS_ACCESS_KEY_ID }}',
            'aws-secret-access-key': '${{ secrets.AWS_SECRET_ACCESS_KEY }}',
            'aws-region': 'us-west-2'
          }
        }
      ]
    }
  }
};
