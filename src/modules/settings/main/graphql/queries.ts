const commonFields = `
  packageVersion
  lastCommittedUser
  lastCommittedDate
  lastCommitMessage
  branch
  sha
  abbreviatedSha
`;

const versions = `
  query versions {
    versions {
      erxesVersion {
        ${commonFields}
      }

      apiVersion {
        ${commonFields}
      }

      widgetVersion {
        packageVersion
       ${commonFields}
      }

      widgetApiVersion {
        ${commonFields}
      }
    }
  }
`;

export default {
  versions
};
