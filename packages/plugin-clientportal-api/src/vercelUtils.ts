import { getEnv, getSubdomain } from '@erxes/api-utils/src/core';
import { IClientPortalDocument } from './models/definitions/clientPortal';
import * as tmp from 'tmp';
import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';
import simpleGit from 'simple-git';
import * as fileType from 'file-type';
import { FileTypeResult } from 'file-type';

// Recursive function to read all files in a directory
const getAllFiles = async (
  dirPath: string
): Promise<{ file: string; data: string; mimeType?: string }[]> => {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        return await getAllFiles(fullPath);
      } else {
        const data = fs.readFileSync(fullPath, 'utf8');
        const mimeType = await getFileMimeType(fullPath); // Use file-type here
        return [
          { file: fullPath.replace(dirPath, '').slice(1), data, mimeType },
        ];
      }
    })
  );
  return files.flat();
};

// Determine the MIME type using file-type
const getFileMimeType = async (
  filePath: string
): Promise<string | undefined> => {
  const buffer = fs.readFileSync(filePath);
  const fileTypeResult = await fileType(buffer);
  return fileTypeResult?.mime;
};

// const getAllFiles = (dirPath, baseDir = dirPath) => {
//   let files: any[] = [];
//   const items = fs.readdirSync(dirPath);
//   items.forEach((item) => {
//     const fullPath = path.join(dirPath, item);
//     const stats = fs.statSync(fullPath);
//     if (stats.isDirectory()) {
//       files = files.concat(getAllFiles(fullPath, baseDir));
//     } else if (stats.isFile()) {
//       const ext = path.extname(fullPath).toLowerCase();
//       let data;
//       // List of binary file extensions
//       const binaryExtensions = [
//         '.png',
//         '.jpg',
//         '.jpeg',
//         '.gif',
//         '.svg',
//         '.ico',
//         '.woff',
//         '.woff2',
//         '.ttf',
//         '.eot',
//       ];
//       if (binaryExtensions.includes(ext)) {
//         data = fs.readFileSync(fullPath); // Read as buffer
//       } else {
//         data = fs.readFileSync(fullPath, 'utf8'); // Read as string
//       }
//       files.push({
//         file: path.relative(baseDir, fullPath).replace(/\\/g, '/'),
//         data: binaryExtensions.includes(ext) ? data.toString('base64') : data,
//       });
//     }
//   });
//   return files;
// };

export const deploy = async (
  subdomain: string,
  config: IClientPortalDocument
) => {
  if (!config.name) {
    throw new Error('Client portal name is required');
  }
  const tmpDir = tmp.dirSync({ unsafeCleanup: true }).name;
  const TEMPLATE_REPO = '';
  const DOMAIN = getEnv({ name: 'DOMAIN' })
    ? `${getEnv({ name: 'DOMAIN' })}/gateway`
    : 'http://localhost:4000';
  const domain = DOMAIN.replace('<subdomain>', subdomain);
  const VERCEL_TOKEN = getEnv({ name: 'VERCEL_TOKEN' });
  const GITHUB_TOKEN = getEnv({ name: 'GITHUB_TOKEN' });

  const erxesApiUrl = domain + '/graphql';
  const erxesApiUrlWs = domain.replace('http', 'ws') + '/graphql';

  try {
    const git = simpleGit();
    const repoUrl = `https://oauth2:${GITHUB_TOKEN}@github.com/soyombo-baterdene/client-portal-template.git`;

    await git.clone(repoUrl, tmpDir);

    // fs.writeFileSync(
    //   path.join(tmpDir, '.env'),
    //   `REACT_APP_DOMAIN=${erxesApiUrl}\n` +
    //     `REACT_APP_SUBSCRIPTION_URL=${erxesApiUrlWs}\n`
    // );

    const vercelConfigPath = path.join(tmpDir, 'vercel.json');

    // Create the Vercel configuration
    const projectConfig = {
      version: 2, // Specifies the version of the configuration
      name: config.name.toLowerCase().replace(/\s+/g, '-'),
      builds: [
        {
          src: 'package.json',
          use: '@vercel/next',
        },
      ],
      env: {
        REACT_APP_DOMAIN: erxesApiUrl,
        REACT_APP_SUBSCRIPTION_URL: erxesApiUrlWs,
      },
    };

    await fs.writeFileSync(
      vercelConfigPath,
      JSON.stringify(projectConfig, null, 2)
    );

    const files = getAllFiles(tmpDir);

    const result = await fetch('https://api.vercel.com/v12/now/deployments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: config.name.toLowerCase().replace(/\s+/g, '-'),
        files,
        target: 'production',
        project: {
          name: config.name.toLowerCase().replace(/\s+/g, '-'),
        },
      }),
    }).then((response) => response.json());

    console.debug('Vercel deployment result', result);
  } catch (e) {
    console.error(e.message);
    throw new Error('Failed to clone template repository');
  }
};
