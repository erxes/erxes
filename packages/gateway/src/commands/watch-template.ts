import watch from 'node-watch';
import * as fse from 'fs-extra';
import { resolve } from 'path';

const filePath = pathName => {
  if (pathName) {
    return resolve(__dirname, '..', pathName);
  }

  return resolve(__dirname, '..');
};

const templatePath = filePath('../../api-plugin-template.erxes');
const watcher = watch(templatePath, { recursive: true, delay: 1000 });

const onChange = () => {
  const pluginNames = fse.readdirSync(filePath('../..'));

  for (const pluginName of pluginNames) {
    if (pluginName.startsWith('plugin-') && pluginName.endsWith('api')) {
      try {
        fse.copySync(templatePath, filePath(`../../${pluginName}/.erxes`), {
          overwrite: true
        });
        console.log(`successfully updated ${pluginName}`);
      } catch (e) {
        console.log(e.message);
      }
    }
  }
};

watcher.on('change', onChange);

onChange();
