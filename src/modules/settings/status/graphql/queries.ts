const commonFields = `
  packageVersion
  lastCommittedUser
  lastCommittedDate
  lastCommitMessage
  branch
  sha
  abbreviatedSha
`;

const configsVersions = `
  query configsVersions {
    configsVersions {
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
  configsVersions
};
