import * as path from 'path';
import * as fs from 'fs';

export const dirTempPath = path.resolve(__dirname, 'temp');

if (!fs.existsSync(dirTempPath)) {
  fs.mkdirSync(dirTempPath, { recursive: true });
}

export const supergraphConfig = path.resolve(dirTempPath, 'supergraph.yaml');
export const supergraph = path.resolve(dirTempPath, 'supergraph.graphql');
export const routerConfig = path.resolve(dirTempPath, 'router.yaml');
export const routerPath = path.resolve(dirTempPath, 'router');
