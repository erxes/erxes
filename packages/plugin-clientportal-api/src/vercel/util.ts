import { getEnv } from '@erxes/api-utils/src/core';
import * as fs from 'fs';
import fetch from 'node-fetch';
import * as path from 'path';
import simpleGit from 'simple-git';
import * as tmp from 'tmp';
import * as crypto from 'crypto';
import { IClientPortalDocument } from '../models/definitions/clientPortal';

const layoutConfig = (config) => {
  const title = config.name || 'Adventure tours';
  const description =
    config.description || 'Explore the world with our exciting tour packages';

  const meta: any = {
    title: config.name,
    description: config.description,
  };

  return `
    import type { Metadata } from "next";
    import { Inter } from "next/font/google";
    import "./globals.css";
    import Header from "./components/Header";
    import Footer from "./components/Footer";
    import { ApolloWrapper } from "@/lib/apollo-wrapper";

    const inter = Inter({ subsets: ["latin"] });

    export const metadata: Metadata = {
      title: "${title}",
      description: "${description}",
    };

    export default function RootLayout({ children }: { children: React.ReactNode }) {
      return (
        <html lang="en">
          <body className={inter.className}>
            <ApolloWrapper>
              <Header />
              <main>{children}</main>
              <Footer />
            </ApolloWrapper>
          </body>
        </html>
      );
    }
  `;
};

const downloadImage = async (url, filePath) => {
  console.log('Downloading image:', url);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const fileStream = fs.createWriteStream(filePath);
    // Pipe the response stream directly to the file
    response.body.pipe(fileStream);

    // Return a promise to handle stream events
    return new Promise<void>((resolve, reject) => {
      fileStream.on('finish', () => {
        console.log('Download complete:', filePath);
        resolve();
      });
      fileStream.on('error', (error) => {
        console.error('Error writing to file:', error);
        reject(error);
      });
    });
  } catch (error) {
    console.error('Error downloading the image:', error);
    throw error;
  }
};

const getAllFiles = (dirPath, baseDir = dirPath) => {
  let files: any[] = [];
  const items = fs.readdirSync(dirPath);
  items.forEach((item) => {
    const fullPath = path.join(dirPath, item);
    if (
      item === '.git' ||
      item === 'package-lock.json' ||
      item === 'node_modules' ||
      item === '.gitignore'
    ) {
      return;
    }

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
        console.log('buffer file:', fullPath);
        // Convert binary data to base64
        data = fs.readFileSync(fullPath).toString('base64');
      } else {
        data = fs.readFileSync(fullPath, 'utf8'); // Read as string
      }

      files.push({
        file: path.relative(baseDir, fullPath).replace(/\\/g, '/'),
        data,
      });
    }
  });

  return files;
};

const convertToSHA1 = (filePath: string) => {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash("sha1").update(fileBuffer).digest("hex");
}

const uploadFileToVercel = async (filePath: string, bearerToken: string) => {
  // const fileContent = fs.readFileSync(filePath);
  const fileSize = fs.statSync(filePath).size;
  const fileHash = convertToSHA1(filePath);

  const result = await fetch('https://api.vercel.com/v2/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      'Content-Length': `${fileSize}`,
      'x-vercel-digest': fileHash,
    }
  }).then((res) => res.json());

  console.log("file => ", filePath);
  console.log('Upload file result:', result);

  return result;
}

const allFilePaths = (dirPath: string, arrayOfFiles: string[] = []) => {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Directory not found: ${dirPath}`);
  }

  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);

    // Skip .git directory
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== ".git") {
        // Recurse into subdirectories
        allFilePaths(fullPath, arrayOfFiles);
      }
    } else {
      // Add file to the list
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

export const uploadFiles = async (path, token: string) => {
  const files = allFilePaths(path);


  const promises = files.map(async (file) => {

    // Upload the file to Vercel
    const result = await uploadFileToVercel(file, token);

    return result;
  });

  return Promise.all(promises);
};

export const deploy = async (
  subdomain: string,
  config: IClientPortalDocument
) => {
  if (!config.name) {
    throw new Error('Client portal name is required');
  }

  if (!config.erxesAppToken) {
    throw new Error('Erxes app token is required');
  }

  const tmpDir = tmp.dirSync({ unsafeCleanup: true }).name;
  const TEMPLATE_REPO = '';
  // const DOMAIN = getEnv({ name: 'DOMAIN' })
  // ? `${getEnv({ name: 'DOMAIN' })}/gateway`
  // : 'http://localhost:4000';
  const DOMAIN = 'https://apose.app.erxes.io';
  const domain = DOMAIN.replace('<subdomain>', subdomain);
  const VERCEL_TOKEN = getEnv({ name: 'VERCEL_TOKEN' });
  const GITHUB_TOKEN = getEnv({ name: 'GITHUB_TOKEN' });

  const erxesApiUrl = domain + '/gateway/graphql';
  const erxesApiUrlWs = domain.replace('http', 'ws') + '/gateway/graphql';

  try {
    const git = simpleGit();
    const repoUrl = `https://oauth2:${GITHUB_TOKEN}@github.com/erxes-web-templates/tour-1.git`;

    await git.clone(repoUrl, tmpDir);
    console.debug('Cloned template repository');

    const configPath = path.join(tmpDir, 'next.config.ts');
    const layoutPath = path.join(tmpDir, 'app', 'layout.tsx');

    // Create the Vercel configuration
    const projectConfig = `
      import type { NextConfig } from "next";

        const nextConfig: NextConfig = {
          env: {
            ERXES_API_URL: "${erxesApiUrl}",
            ERXES_URL: "${domain}",
            ERXES_FILE_URL: "${domain}/gateway/read-file?key=",
            ERXES_CP_ID: "${config._id}",
            ERXES_APP_TOKEN:"${config.erxesAppToken}",
          },
      };

      export default nextConfig;
    `;

    const layout = layoutConfig(config);

    await fs.writeFileSync(layoutPath, layout);

    await fs.writeFileSync(configPath, projectConfig);

    // if (config.icon) {
    //   const iconPath = path.join(tmpDir, 'app', 'favicon.ico');
    //   await downloadImage(
    //     `${domain}/gateway/read-file?key=${config.icon}`,
    //     iconPath
    //   );
    // }

    console.debug('Created Vercel configuration', tmpDir);
    // const files = await getAllFiles(tmpDir);
    await uploadFiles(tmpDir, VERCEL_TOKEN);

    // const name = config.name.toLowerCase().replace(/\s+/g, '-');
    // const { Vercel } = await import('@vercel/sdk');

    // const vercel = new Vercel({ bearerToken: VERCEL_TOKEN });

    // const result = await vercel.deployments.createDeployment({
    //   requestBody: {
    //     name,
    //     project: name,
    //     files,
    //     target: 'production',
    //     meta: {
    //       'erxes-cp-id': config._id,
    //     },
    //   },
    // });

    // console.debug('Vercel deployment result', result);
    // // console.debug('Files', files);
    // const body = JSON.stringify({
    //   name: config.name.toLowerCase().replace(/\s+/g, '-'),
    //   files,
    //   target: 'production',
    //   project: `${name}_final`,
    //   projectSettings: {
    //     devCommand: 'yarn dev',
    //     installCommand: 'yarn install',
    //     buildCommand: 'next build',
    //     outputDirectory: 'out',
    //     framework: 'nextjs',
    //   },
    // });

    // const result = await fetch(
    //   `https://api.vercel.com/v13/deployments?forceNew=0&skipAutoDetectionConfirmation=0`,
    //   {
    //     method: 'POST',
    //     headers: {
    //       Authorization: `Bearer ${VERCEL_TOKEN}`,
    //       'Content-Type': 'application/json',
    //     },
    //     body,
    //   }
    // ).then((response) => response.json());

    // console.debug('Vercel deployment result', result);
  } catch (e) {
    console.error(e.message);
    throw new Error('Failed to clone template repository');
  }
};
