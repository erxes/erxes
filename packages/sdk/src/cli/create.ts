import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pluginName } from '../names';
import { exists, SDK_DIR } from './paths';

const TEMPLATE_DIR = path.join(SDK_DIR, 'template');

const listFiles = async (dir: string): Promise<string[]> => {
  const entries = await readdir(dir, { withFileTypes: true });

  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory()
          ? listFiles(path.join(dir, entry.name))
          : [path.join(dir, entry.name)],
      ),
    )
  ).flat();
};

/**
 * Writes ./<id>: the template with its names replaced, plus the package.json
 * and tsconfig.json that point at this SDK. Returns the new directory.
 */
export const create = async (cwd: string, id: string, host = 'sales') => {
  if (!/^[a-z][a-z0-9-]*$/.test(id)) {
    throw new Error(
      'the id is lowercase letters, digits and dashes, starting with a letter',
    );
  }

  const dir = path.resolve(cwd, id);

  if (await exists(dir)) {
    throw new Error(`${dir} already exists`);
  }

  const camel = pluginName(id);
  const names: [string, string][] = [
    ['ext-template-host', host],
    ['ext-template', id],
    ['extTemplate', camel],
    ['ExtTemplate', camel[0].toUpperCase() + camel.slice(1)],
  ];

  for (const file of await listFiles(TEMPLATE_DIR)) {
    const relative = path.relative(TEMPLATE_DIR, file);
    // npm drops .gitignore files, so the template keeps it without the dot.
    const target = path.join(
      dir,
      relative === 'gitignore' ? '.gitignore' : relative,
    );
    const text = names.reduce(
      (content, [from, to]) => content.replaceAll(from, to),
      await readFile(file, 'utf8'),
    );

    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, text);
  }

  const pkg = {
    name: id,
    version: '1.0.0',
    private: true,
    scripts: {
      codegen: 'erxes-ext codegen',
      check: 'erxes-ext check',
      build: 'erxes-ext build',
      'install-extension': 'erxes-ext install',
      dev: 'erxes-ext dev',
    },
    dependencies: {
      '@hookform/resolvers': '^5',
      '@tabler/icons-react': '^3.34.0',
      'erxes-sdk': 'workspace:^',
      zod: '4.6.7',
    },
  };
  const tsconfig = {
    extends: path.relative(dir, path.join(SDK_DIR, 'tsconfig.extension.json')),
  };

  await writeFile(
    path.join(dir, 'package.json'),
    `${JSON.stringify(pkg, null, 2)}\n`,
  );
  await writeFile(
    path.join(dir, 'tsconfig.json'),
    `${JSON.stringify(tsconfig, null, 2)}\n`,
  );

  return dir;
};
