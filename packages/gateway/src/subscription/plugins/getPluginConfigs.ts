import path from 'path';
import fs from 'fs';
import downloadPlugins from './downloadPlugins';

function getFilesFullPaths(
  dir: string,
  pred: (filename: string) => boolean
): string[] {
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .map(fileName => {
      if (!pred(fileName)) return '';

      const fullName = path.join(dir, fileName);
      const stat = fs.lstatSync(fullName);

      if (stat.isDirectory()) return '';

      return fullName;
    })
    .filter(x => x);
}

export default async function getPluginConfigs(
  download?: boolean
): Promise<any[]> {
  if (download) await downloadPlugins();
  const directory = path.join(__dirname, '/downloads');
  const files = getFilesFullPaths(directory, name => /\.(t|j)s$/.test(name));
  const modules = await Promise.all(files.map(file => import(file)));
  return modules.map(module => module.default);
}
