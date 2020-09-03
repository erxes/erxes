import * as mongoose from 'mongoose';
import * as os from 'os';
import * as path from 'path';

export default async () => {
  const { version, storageEngine } = await mongoose.connection.db.command({ serverStatus: 1 });

  const osStatus = {
    type: os.type(),
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    uptime: os.uptime(),
    loadavg: os.loadavg(),
    totalmem: os.totalmem(),
    freemem: os.freemem(),
    cpuCount: os.cpus().length,
  };

  const processStatus = {
    nodeVersion: process.version,
    pid: process.pid,
    uptime: process.uptime(),
  };

  const mongoStatus = {
    version,
    storageEngine: storageEngine.name,
  };

  const projectPath = process.cwd();
  const packageVersion = require(path.join(projectPath, 'package.json')).version;

  return {
    os: osStatus,
    process: processStatus,
    mongo: mongoStatus,
    packageVersion,
  };
};
