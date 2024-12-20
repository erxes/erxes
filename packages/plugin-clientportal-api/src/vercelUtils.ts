import { getEnv } from '@erxes/api-utils/src/core';
import * as fs from 'fs';
import fetch from 'node-fetch';
import * as path from 'path';
import simpleGit from 'simple-git';
import * as tmp from 'tmp';
import { IClientPortalDocument } from './models/definitions/clientPortal';

// Recursive function to read all files in a directory


const getAllFiles = (dirPath, baseDir = dirPath) => {
  let files: any[] = [];
  const items = fs.readdirSync(dirPath);
  items.forEach((item) => {
    const fullPath = path.join(dirPath, item);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, baseDir));
    } else if (stats.isFile()) {
      const ext = path.extname(fullPath).toLowerCase();
      let data;
      // List of binary file extensions
      const binaryExtensions = [
        '.png',
        '.jpg',
        '.jpeg',
        '.gif',
        '.svg',
        '.ico',
        '.woff',
        '.woff2',
        '.ttf',
        '.eot',
      ];
      if (binaryExtensions.includes(ext)) {
        data = fs.readFileSync(fullPath); // Read as buffer
      } else {
        data = fs.readFileSync(fullPath, 'utf8'); // Read as string
      }
      files.push({
        file: path.relative(baseDir, fullPath).replace(/\\/g, '/'),
        data: binaryExtensions.includes(ext) ? data.toString('base64') : data,
      });
    }
  });
  return files;
};

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
    console.debug('Cloned template repository');
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

    console.debug('Created Vercel configuration', tmpDir);
    const files = await getAllFiles(tmpDir);

    const name = config.name.toLowerCase().replace(/\s+/g, '-');
    console.log("type of", typeof name);
    console.log("name", name);
    // console.debug('Files', files);
    const body = JSON.stringify({
      name: config.name.toLowerCase().replace(/\s+/g, '-'),
      files,
      target: 'production',
      project: name,
      projectSettings: {
        devCommand: "yarn dev",
        installCommand: "yarn install",
        buildCommand: "yarn build",
        outputDirectory: "out",
        rootDirectory: "src",
        framework: 'nextjs'
      }
    });

    const result = await fetch(`https://api.vercel.com/v13/deployments?forceNew=0&skipAutoDetectionConfirmation=0`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body,
    }).then((response) => response.json());

    console.debug('Vercel deployment result', result);
  } catch (e) {
    console.error(e.message);
    throw new Error('Failed to clone template repository');
  }
};
