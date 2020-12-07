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
      erxesApi {
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

const configsGetVersion = `
  query configsGetVersion {
    configsGetVersion
  }
`;

export default {
  configsStatus,
  configsGetVersion
};
