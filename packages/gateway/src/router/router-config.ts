import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

const routerConfigPath = path.resolve(__dirname, 'router.yaml');

const file = fs.readFileSync(routerConfigPath, 'utf8').toString();

const config = yaml.parse(file);

console.log(JSON.stringify(config, null, 4));
