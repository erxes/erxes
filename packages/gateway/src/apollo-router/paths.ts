import * as path from 'path';
import * as fs from 'fs';

export const dirTempPath = path.resolve(__dirname, 'temp');

if (!fs.existsSync(dirTempPath)) {
  fs.mkdirSync(dirTempPath, { recursive: true });
}

export const supergraphConfigPath = path.resolve(
  dirTempPath,
  'supergraph.yaml'
);
export const supergraphPath = path.resolve(dirTempPath, 'supergraph.graphql');
export const routerConfigPath = path.resolve(dirTempPath, 'router.yaml');
export const routerPath = path.resolve(dirTempPath, 'router');
