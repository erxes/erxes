const fs = require('fs');
const path = require('path');

// Read configured ports, not listening sockets: disabled plugins still own theirs.
function getPluginPorts(root) {
  // Core UI/API, logs, automations and gateway retain their platform ports.
  const used = new Set([3000, 3001, 3300, 3301, 3302, 4000]);

  for (const layer of ['frontend', 'backend']) {
    const directory = path.join(root, layer, 'plugins');
    if (!fs.existsSync(directory)) continue;

    for (const plugin of fs.readdirSync(directory)) {
      const projectFile = path.join(directory, plugin, 'project.json');
      if (fs.existsSync(projectFile)) {
        const project = JSON.parse(fs.readFileSync(projectFile, 'utf8'));
        for (const target of Object.values(project.targets || {})) {
          for (const options of [
            target.options,
            ...Object.values(target.configurations || {}),
          ]) {
            if (Number.isInteger(options?.port)) used.add(options.port);
          }
        }
      }

      const mainFile = path.join(directory, plugin, 'src/main.ts');
      if (layer === 'backend' && fs.existsSync(mainFile)) {
        const source = fs.readFileSync(mainFile, 'utf8');
        for (const match of source.matchAll(/\bport:\s*(\d+)/g)) {
          used.add(Number(match[1]));
        }
      }
    }
  }

  return used;
}

function selectPluginPort(used, requested, start, label) {
  let port = requested === undefined ? start : Number(requested);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new Error(`${label} port must be an integer between 1024 and 65535`);
  }
  if (requested !== undefined && used.has(port)) {
    throw new Error(`${label} port ${port} is already configured`);
  }
  while (used.has(port) && port < 65535) port++;
  if (used.has(port)) throw new Error(`No available ${label} port`);
  used.add(port);
  return port;
}

module.exports = { getPluginPorts, selectPluginPort };
