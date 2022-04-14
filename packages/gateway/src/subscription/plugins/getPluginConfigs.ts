import * as path from 'path';
import * as fs from 'fs';

import downloadPlugins from './downloadPlugins';

function getFilesFullPaths(
  dir: string,
  pred: (filename: string) => boolean
): string[] {
  if (!fs.existsSync(dir)) { return []; }

  return fs
    .readdirSync(dir)
    .map(fileName => {
      if (!pred(fileName)) { return ''; }

      const fullName = path.join(dir, fileName);
      const stat = fs.lstatSync(fullName);

      if (stat.isDirectory()) { return ''; }

      return fullName;
    })
    .filter(x => x);
}

export default async function getPluginConfigs(): Promise<any[]> {
  await downloadPlugins();
  const directory = path.join(__dirname, '/downloads');
  const files = getFilesFullPaths(directory, name => /\.(t|j)s$/.test(name));
  return await Promise.all(files.map(file => import(file)));
}
