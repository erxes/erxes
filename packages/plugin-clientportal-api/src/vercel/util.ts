import { getEnv } from '@erxes/api-utils/src/core';
import * as fs from 'fs';
import fetch from 'node-fetch';
import * as path from 'path';
import simpleGit from 'simple-git';
import * as tmp from 'tmp';
import { IClientPortalDocument } from '../models/definitions/clientPortal';
import { sendCommonMessage } from '../messageBroker';


const buildConfigs = async (subdomain:string, config: IClientPortalDocument, pages, menus) => {
  const json = {
    "template": config.template,
    "templateId": config.templateId,
    "meta": {
      "title": config.name,
      "description": config.description || config.name,
      "logo": config.logo || "",
      "favicon": config.icon || "",
      "keywords": config.keywords || "",
      // "coverImage": "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
      "author": subdomain,
      "url": config.url
    },
    "appearance": {
      "theme": "light",
      "baseFont": config.styles?.baseFont || "Roboto, sans-serif",
      "headingFont": config.styles?.headingFont || "Roboto, sans-serif",
      "baseColor": config.styles?.baseColor || "#3f51b5",
      "backgroundColor": config.styles?.backgroundColor || "#f5f5f5",
    },
    "menus": {
      "main": [
        {
          "label": "Home",
          "url": "/",
          "icon": "dashboard",
          "parentId": ""
        },
        {
          "label": "About",
          "url": "/about",
          "icon": "about",
          "parentId": ""
        },
        {
          "label": "Contact",
          "url": "/contact",
          "icon": "contact",
          "parentId": ""
        }
      ],
      "footerMenu": [
        {
          "title": "Dashboard",
          "url": "/dashboard",
          "icon": "dashboard"
        },
        {
          "title": "Language",
          "url": "/dashboard/language",
          "icon": "language"
        },
        {
          "title": "about",
          "url": "/dashboard/about",
          "icon": "about"
        }
      ]
    },
    "additional": {
      "copyright": {
        "text": "© 2019 erxes Inc. All rights reserved.",
        "url": "https://www.erxes.io"
      },
      "social": [
        {
          "name": "facebook",
          "url": "https://www.facebook.com/erxes.io"
        },
        {
          "name": "twitter",
          "url": "https://twitter.com/erxesio"
        },
        {
          "name": "linkedin",
          "url": "https://www.linkedin.com/company/erxes"
        },
        {
          "name": "youtube",
          "url": "https://www.youtube.com/channel/UCJ1bNel6mOz8Kv1b0eIc5kg"
        }
      ],
      "integrations": {
        "googleAnalytics": "UA-XXXXX-X",
        "facebookPixel": "1234567890",
        "GTM": "GTM-XXXXX",
        "messengerId": "Your CRM API Key"
      }
    }
  }
}


const layoutConfig = (config) => {
  const title = config.name || 'Adventure tours';
  const description =
    config.description || 'Explore the world with our exciting tour packages';

  return `import type { Metadata } from "next";
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
}`;
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

const allFilePaths = (dirPath: string, arrayOfFiles: any[] = []) => {
  const ignoreFiles = ['.DS_Store', '.git', '.gitignore', 'README.md'];
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Directory not found: ${dirPath}`);
  }

  const files = fs.readdirSync(dirPath);

  files.forEach((file, index) => {
    const fullPath = path.join(dirPath, file);

    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== '.git') {
        allFilePaths(fullPath, arrayOfFiles);
      }
    } else {
      if (!ignoreFiles.includes(file)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
};

export const deploy = async (subdomain, config: IClientPortalDocument) => {
  if (!config.name) {
    throw new Error('Client portal name is required');
  }

  if (!config.erxesAppToken) {
    throw new Error('Erxes app token is required');
  }

  if (!config.templateId) {
    throw new Error('Template id is required');
  }

  const pages = await sendCommonMessage({
    subdomain,
    serviceName: 'cms',
    action: 'pages.find',
    data: {
      clientPortalId: config._id,
    },
    isRPC: true,
    defaultValue: [],
  });
  
  if (pages.length === 0) {
    throw new Error('No pages found');
  }

  const mainMenus = await sendCommonMessage({
    subdomain,
    serviceName: 'cms',
    action: 'menus.find',
    data: {
      clientPortalId: config._id,
      kind: 'main',
    },
    isRPC: true,
    defaultValue: [],
  });

  const footerMenus = await sendCommonMessage({
    subdomain,
    serviceName: 'cms',
    action: 'menus.find',
    data: {
      clientPortalId: config._id,
      kind: 'footer',
    },
    isRPC: true,
    defaultValue: [],
  })

  if (mainMenus.length === 0 && footerMenus.length === 0) {
    throw new Error('No menus found');
  }

  const GITHUB_TOKEN = getEnv({ name: 'GITHUB_TOKEN' });
  const tmpDir = tmp.dirSync({ unsafeCleanup: true }).name;
  const TEMPLATE_REPO = `https://oauth2:${GITHUB_TOKEN}@github.com/erxes-web-templates/${config.templateId}.git`;
  const DOMAIN = 'https://apose.app.erxes.io';
  const domain = DOMAIN.replace('<subdomain>', subdomain);
  const VERCEL_TOKEN = getEnv({ name: 'VERCEL_TOKEN' });

  try {
    const git = simpleGit();

    await git.clone(TEMPLATE_REPO, tmpDir);
    console.debug('Cloned template repository');

    const configPath = path.join(tmpDir, 'next.config.ts');
    const layoutPath = path.join(tmpDir, 'app', 'layout.tsx');
    const dataPath = path.join(tmpDir, 'data','configs.json');

    
    const projectConfig = `export default {
      env: {
        ERXES_API_URL: "${domain}/gateway/graphql",
        ERXES_URL: "${domain}",
        ERXES_FILE_URL: "${domain}/gateway/read-file?key=",
        ERXES_CP_ID: "${config._id}",
        ERXES_APP_TOKEN: "${config.erxesAppToken}",
      },
    };`;

    // const layout = layoutConfig(config);

    // fs.writeFileSync(layoutPath, layout);
    fs.writeFileSync(configPath, projectConfig);

    if (config.icon) {
      const iconPath = path.join(tmpDir, 'app', 'favicon.ico');
      await downloadImage(
        `${domain}/gateway/read-file?key=${config.icon}`,
        iconPath
      );
    }


    const files = allFilePaths(tmpDir).map((filePath, index) => {
      const encoding = path
        .extname(filePath)
        .match(/\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)
        ? 'base64'
        : 'utf8';

      const fileData = fs.readFileSync(filePath);

      if (
        path
          .extname(filePath)
          .match(/\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)
      ) {
        return {
          file: path.relative(tmpDir, filePath).replace(/\\/g, '/'),
          data: fileData.toString('base64'),
          encoding: 'base64',
        };
      }

      const fileObject = {
        file: path.relative(tmpDir, filePath).replace(/\\/g, '/'),
        data: fileData.toString('utf8'),
        // encoding,
      };

      return fileObject;
    });

    const name = (config.name || '').toLowerCase().replace(/\s+/g, '_');

    const body = JSON.stringify({
      name,
      files,
      target: 'production',
      project: `${name}_${subdomain}`,
      // deploymentId: 'dpl_4mvHT7jG4e6Q6W1fvvsCzYC8KDm8',
      projectSettings: {
        installCommand: 'yarn install',
        buildCommand: 'next build',
        framework: 'nextjs',
      },
    });

    const response = await fetch(
      'https://api.vercel.com/v13/deployments?forceNew=0&skipAutoDetectionConfirmation=0',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body,
      }
    );

    const result = await response.json();
    console.debug('Vercel deployment result', result);

    if (!response.ok) {
      throw new Error(
        `Deployment failed: ${result.error?.message || 'Unknown error'}`
      );
    }

    return result;
    // return null
  } catch (error) {
    console.error(error.message);
    throw new Error('Failed to deploy to Vercel');
  } finally {
    tmp.setGracefulCleanup();
  }
};
