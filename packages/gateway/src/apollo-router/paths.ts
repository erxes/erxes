import * as path from 'path';
import * as fs from 'fs';

export const tempPath = path.resolve(__dirname, 'temp');
if (!fs.existsSync(tempPath)) {
  fs.mkdirSync(tempPath, { recursive: true });
}

export const downloadsPath = path.resolve(__dirname, 'downloads');
if (!fs.existsSync(downloadsPath)) {
  fs.mkdirSync(downloadsPath, { recursive: true });
}

export const supergraphConfigPath = path.resolve(tempPath, 'supergraph.yaml');
export const supergraphPath = path.resolve(tempPath, 'supergraph.graphql');
export const routerConfigPath = path.resolve(tempPath, 'router.yaml');
export const routerPath = path.resolve(downloadsPath, 'router');
