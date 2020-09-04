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

const configsStatus = `
  query configsStatus {
    configsStatus {
      erxes {
        packageVersion
      }

      erxesApi {
        packageVersion

        os {
          ${osInfo}
        }
  
        process {
          ${processInfo}
        }
  
        mongo {
          ${mongoInfo}
        }
      }

      erxesIntegration {
        packageVersion

        os {
          ${osInfo}
        }
  
        process {
          ${processInfo}
        }
  
        mongo {
          ${mongoInfo}
        }
      }
    }
  }
`;

export default {
  configsStatus
};
