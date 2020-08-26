import * as telemetry from 'erxes-telemetry';

const command = async () => {
  const argv = process.argv;
  const message = argv.pop();

  telemetry.trackCli('installation_status', { message });

  process.exit();
};

command();
