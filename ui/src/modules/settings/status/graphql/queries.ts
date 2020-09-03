const osInfo = `
  type
  platform
  arch
  release
  uptime
  loadavg
  totalmem
  freemem
  cpuCount
`;

const processInfo = `
  nodeVersion
  pid
  uptime
`;

const mongoInfo = `
  version
  storageEngine
`;

const configsVersions = `
  query configsVersions {
    configsVersions {
      generalInfo {
        packageVersion
      }

      osInfo {
        ${osInfo}
      }

      processInfo {
        ${processInfo}
      }

      mongoInfo {
        ${mongoInfo}
      }
    }
  }
`;

export default {
  configsVersions
};
