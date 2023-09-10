import path from 'path';
import fs from 'fs';

export const dirTempPath = path.resolve(import.meta.dir, 'temp');

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
