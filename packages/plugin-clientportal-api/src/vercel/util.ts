import { getEnv } from '@erxes/api-utils/src/core';
import * as fs from 'fs';
import fetch from 'node-fetch';
import * as path from 'path';
import simpleGit from 'simple-git';
import * as tmp from 'tmp';
import { IClientPortalDocument } from '../models/definitions/clientPortal';
import { sendCommonMessage } from '../messageBroker';

const buildConfigs = (
  subdomain: string,
  config: IClientPortalDocument,
  mainMenus,
  footerMenus
) => {
  const links: any[] = [];
  const { externalLinks = {} } = config;
  for (const name of Object.keys(externalLinks)) {
    const url = externalLinks[name];
    if (name && url) {
      links.push({ name, url });
    }
  }

  const json = {
    cpId: config._id,
    template: config.template,
    templateId: config.templateId,
    meta: {
      title: config.name,
      description: config.description || config.name,
      logo: config.logo || '',
      favicon: config.icon || '',
      keywords: config.keywords || '',
      // "coverImage": "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
      author: subdomain,
      url: config.url,
    },
    appearance: {
      theme: 'light',
      baseFont: config.styles?.baseFont || 'Roboto, sans-serif',
      headingFont: config.styles?.headingFont || 'Roboto, sans-serif',
      baseColor: config.styles?.baseColor || '#3f51b5',
      backgroundColor: config.styles?.backgroundColor || '#f5f5f5',
    },
    menus: {
      main: mainMenus.map((m) => {
        return {
          label: m.label,
          url: m.url,
          icon: m.icon,
          parentId: m.parentId,
        };
      }),
      footerMenu: footerMenus.map((m) => {
        return {
          label: m.label,
          url: m.url,
          icon: m.icon,
          parentId: m.parentId,
        };
      }),
    },
    additional: {
      copyright: {
        text: config.copyright || 'All rights reserved.',
        url: config.url,
      },
      social: links,
      integrations: {
        googleAnalytics: config.googleAnalytics,
        facebookPixel: config.facebookPixel,
        GTM: config.googleTagManager,
        messengerId: config.messengerBrandCode,
      },
    },
  };

  return json;
};

const buildPageConfigs = (page) => {
  return {
    title: page.name,
    description: page.description || page.name,
    coverImage: page.coverImage,
    pageItems: page.pageItems.map((item) => {
      return {
        type: item.type,
        content: item.content,
        order: item.order,
        contentType: item.contentType,
        contentTypeId: item.contentTypeId,
        config: item.config,
      };
    }),
  };
};

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
  });

  if (mainMenus.length === 0 && footerMenus.length === 0) {
    throw new Error('No menus found');
  }

  const GITHUB_TOKEN = getEnv({ name: 'GITHUB_TOKEN' });
  const tmpDir = tmp.dirSync({ unsafeCleanup: true }).name;
  const TEMPLATE_REPO = `https://oauth2:${GITHUB_TOKEN}@github.com/erxes-web-templates/${config.templateId}.git`;
  const DOMAIN = getEnv({ name: 'DOMAIN' })
    ? `${getEnv({ name: 'DOMAIN' })}/gateway`
    : 'http://localhost:4000';
  const domain = DOMAIN.replace('<subdomain>', subdomain);
  const VERCEL_TOKEN = getEnv({ name: 'VERCEL_TOKEN' });

  try {
    const git = simpleGit();

    await git.clone(TEMPLATE_REPO, tmpDir);
    console.debug('Cloned template repository');

    const configPath = path.join(tmpDir, 'next.config.ts');
    // const layoutPath = path.join(tmpDir, 'app', 'layout.tsx');
    const dataPath = path.join(tmpDir, 'data', 'configs.json');

    const projectConfig = `export default {
      env: {
        ERXES_API_URL: "${domain}/graphql",
        ERXES_URL: "${domain}",
        ERXES_FILE_URL: "${domain}/read-file?key=",
        ERXES_CP_ID: "${config._id}",
        ERXES_APP_TOKEN: "${config.erxesAppToken}",
      },
      images: {
        unoptimized: true,
        remotePatterns: [
          {
            protocol: "https",
            hostname: "${subdomain}.app.erxes.io",
          },
        ]
      },
    };`;

    // const layout = layoutConfig(config);

    // fs.writeFileSync(layoutPath, layout);
    fs.writeFileSync(configPath, projectConfig);

    const configsJson = buildConfigs(subdomain, config, mainMenus, footerMenus);

    fs.writeFileSync(dataPath, JSON.stringify(configsJson));

    for (const page of pages) {
      const fileName = ['/', '', 'home'].includes(page.slug)
        ? 'index'
        : page.slug;
      const pagePath = path.join(tmpDir, 'data/pages', `${fileName}.json`);
      const pageContent = buildPageConfigs(page);
      fs.writeFileSync(pagePath, JSON.stringify(pageContent));
    }

    if (config.icon) {
      const iconPath = path.join(tmpDir, 'app', 'favicon.ico');
      await downloadImage(
        `${domain}/read-file?key=${config.icon}`,
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

    if (!response.ok) {
      throw new Error(
        `Deployment failed: ${result.error?.message || 'Unknown error'}`
      );
    }

    return result;
    // return null
  } catch (error) {
    console.error(error.message);
    throw new Error('Failed to deploy to Vercel: ' + error.message);
  } finally {
    tmp.setGracefulCleanup();
  }
};

export const getDomains = async (projectId: string) => {
  const VERCEL_TOKEN = getEnv({ name: 'VERCEL_TOKEN' });

  const response = await fetch(
    `https://api.vercel.com/v9/projects/${projectId}/domains`,
    {
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
      },
    }
  );

  return await response.json();
};

export const getDomainConfig = async (domain: string) => {
  const VERCEL_TOKEN = getEnv({ name: 'VERCEL_TOKEN' });
  const VERCEL_TEAM_ID = getEnv({ name: 'VERCEL_TEAM_ID' });

  const response = await fetch(
    `https://api.vercel.com/v6/domains/${domain}/config?teamId=${VERCEL_TEAM_ID}`,
    {
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
      },
    }
  );

  return await response.json();
};

export const removeProject = async (projectId: string) => {
  const VERCEL_TOKEN = getEnv({ name: 'VERCEL_TOKEN' });

  const response = await fetch(
    `https://api.vercel.com/v9/projects/${projectId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
      },
    }
  );

  return await response.json();
};

export const addDomain = async (projectId: string, domain: string) => {
  const VERCEL_TOKEN = getEnv({ name: 'VERCEL_TOKEN' });

  const response = await fetch(
    `https://api.vercel.com/v10/projects/${projectId}/domains`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: domain }),
    }
  );

  return await response.json();
};

export const getDeploymentEvents = async (id: string) => {
  const VERCEL_TOKEN = getEnv({ name: 'VERCEL_TOKEN' });

  const response = await fetch(
    `https://api.vercel.com/v3/deployments/${id}/events`,
    {
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
      },
    }
  );

  return await response.json();
}
