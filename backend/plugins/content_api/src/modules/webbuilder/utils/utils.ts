// modules/webbuilder/utils/deploy.ts
import { getEnv } from 'erxes-api-shared/utils';
import * as fs from 'fs';
import fetch from 'node-fetch';
import * as path from 'path';
import simpleGit from 'simple-git';
import * as tmp from 'tmp';
import { IWebDocument } from '@/webbuilder/@types/web';
import { IModels } from '~/connectionResolvers';
import { ICMSPageDocument, ICMSMenuDocument } from '@/cms/@types/cms';

const buildConfigs = (
  subdomain: string,
  web: IWebDocument,
  mainMenus: ICMSMenuDocument[],
  footerMenus: ICMSMenuDocument[],
) => {
  const links: { name: string; url: string }[] = [];
  const externalLinks = web.externalLinks || {};

  for (const [name, url] of Object.entries(externalLinks)) {
    if (name && url) links.push({ name, url });
  }

  return {
    cpId: web.clientPortalId,
    templateId: web.templateId,
    templateType: web.templateType,
    meta: {
      title: web.name,
      description: web.description || web.name,
      logo: (web.logo as any)?.url || '',
      favicon: (web.favicon as any)?.url || '',
      keywords: (web.keywords || []).join(', '),
      author: subdomain,
      url: web.domain,
    },
    appearance: {
      theme: 'light',
      baseFont: web.appearances?.fontSans || 'Roboto, sans-serif',
      headingFont: web.appearances?.fontHeading || 'Roboto, sans-serif',
      baseColor: web.appearances?.primaryColor || '#3f51b5',
      backgroundColor: web.appearances?.backgroundColor || '#f5f5f5',
    },
    menus: {
      main: mainMenus.map((m) => ({
        _id: m._id,
        label: m.label,
        url: m.url,
        icon: m.icon,
        parentId: m.parentId,
        order: m.order,
      })),
      footerMenu: footerMenus.map((m) => ({
        _id: m._id,
        label: m.label,
        url: m.url,
        icon: m.icon,
        parentId: m.parentId,
        order: m.order,
      })),
    },
    additional: {
      copyright: {
        text: web.copyright || 'All rights reserved.',
        url: web.domain,
      },
      social: links,
      integrations: {
        googleAnalytics: web.integrations?.googleAnalytics,
        facebookPixel: web.integrations?.facebookPixel,
        GTM: web.integrations?.googleTagManager,
        messengerId: web.integrations?.messengerBrandCode,
      },
    },
  };
};

const buildPageConfigs = (page: ICMSPageDocument) => ({
  title: page.name,
  description: page.description || page.name,
  coverImage: page.coverImage,
  pageItems: (page.pageItems || []).map((item) => ({
    type: item.type,
    content: item.content,
    order: item.order,
    objectType: item.objectType,
    objectId: item.objectId,
    config: item.config,
  })),
});

const downloadImage = async (url: string, filePath: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  const fileStream = fs.createWriteStream(filePath);
  response.body.pipe(fileStream);
  return new Promise<void>((resolve, reject) => {
    fileStream.on('finish', resolve);
    fileStream.on('error', reject);
  });
};

const allFilePaths = (dirPath: string, arrayOfFiles: string[] = []) => {
  const ignoreFiles = ['.DS_Store', '.git', '.gitignore', 'README.md'];
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Directory not found: ${dirPath}`);
  }

  for (const file of fs.readdirSync(dirPath)) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== '.git') allFilePaths(fullPath, arrayOfFiles);
    } else {
      if (!ignoreFiles.includes(file)) arrayOfFiles.push(fullPath);
    }
  }
  return arrayOfFiles;
};

export const deploy = async (
  subdomain: string,
  web: IWebDocument,
  models: IModels,
) => {
  console.log(
    'GITHUB_TOKEN:',
    getEnv({ name: 'GITHUB_TOKEN' }) ? 'set' : 'missing',
  );
  console.log(
    'VERCEL_TOKEN:',
    getEnv({ name: 'VERCEL_TOKEN' }) ? 'set' : 'missing',
  );
  console.log(
    'VERCEL_TEAM_ID:',
    getEnv({ name: 'VERCEL_TEAM_ID' }) ? 'set' : 'missing',
  );
  console.log('DOMAIN:', getEnv({ name: 'DOMAIN' }));
  console.log('web.templateId:', web.templateId);
  console.log('web.erxesAppToken:', web.erxesAppToken ? 'set' : 'missing');
  console.log('web.clientPortalId:', web.clientPortalId);

  if (!web.name) throw new Error('Web name is required');
  if (!web.erxesAppToken) throw new Error('Erxes app token is required');
  if (!web.templateId) throw new Error('Template id is required');

  const pages = await (models as any).WebPages.find({
    webId: web._id,
    clientPortalId: web.clientPortalId,
  }).lean();
  console.log('pages found:', pages.length);
  if (pages.length === 0) throw new Error('No pages found');

  const mainMenus = await models.MenuItems.find({
    clientPortalId: web.clientPortalId,
    kind: 'main',
  }).lean();
  console.log('mainMenus found:', mainMenus.length);

  const footerMenus = await models.MenuItems.find({
    clientPortalId: web.clientPortalId,
    kind: 'footer',
  }).lean();
  console.log('footerMenus found:', footerMenus.length);

  if (mainMenus.length === 0 && footerMenus.length === 0) {
    throw new Error('No menus found');
  }

  const GITHUB_TOKEN = getEnv({ name: 'GITHUB_TOKEN' });
  const VERCEL_TOKEN = getEnv({ name: 'VERCEL_TOKEN' });
  const DOMAIN = getEnv({ name: 'DOMAIN' })
    ? `${getEnv({ name: 'DOMAIN' })}/gateway`
    : 'http://localhost:4000';
  const domain = DOMAIN.replace('<subdomain>', subdomain);
  const TEMPLATE_REPO = `https://oauth2:${GITHUB_TOKEN}@github.com/erxes-web-templates/${web.templateId}.git`;
  const tmpDir = tmp.dirSync({ unsafeCleanup: true }).name;

  try {
    const git = simpleGit();
    await git.clone(TEMPLATE_REPO, tmpDir);
    console.log('Cloned template repository');

    // changing next.js version to 15.3.6 bcs of vercel auto detection issue with affected versions
    const packageJsonPath = path.join(tmpDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    const nextVersion = packageJson.dependencies?.['next'];
    if (nextVersion) {
      packageJson.dependencies['next'] = '15.3.8';
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log(`patched next.js from ${nextVersion} to 15.3.8`);
    }

    // Delete package-lock.json only — keep yarn.lock so yarn resolves
    // only the patched package instead of re-fetching everything from scratch
    const packageLockPath = path.join(tmpDir, 'package-lock.json');
    if (fs.existsSync(packageLockPath)) {
      fs.unlinkSync(packageLockPath);
      console.log('deleted package-lock.json');
    }
    // Build env object
    const env: Record<string, string> = {
      ERXES_API_URL: `${domain}/graphql`,
      ERXES_URL: domain,
      ERXES_FILE_URL: `${domain}/read-file?key=`,
      ERXES_CP_ID: web.clientPortalId || '',
      ERXES_APP_TOKEN: web.erxesAppToken,
      ERXES_WEB_ID: web._id || '',
      TEMPLATE_TYPE: web.templateType || '',
      BUILD_MODE: 'production',
      NEXT_PUBLIC_BUILD_MODE: 'production',
    };

    for (const ev of web.environmentVariables || []) {
      env[ev.key] = ev.value;
    }

    // Write next.config.ts with eslint and typescript errors ignored
    const configPath = path.join(tmpDir, 'next.config.ts');
    const projectConfig = `export default {
      env: ${JSON.stringify(env, null, 2)},
      eslint: {
        ignoreDuringBuilds: true,
      },
      typescript: {
        ignoreBuildErrors: true,
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
    fs.writeFileSync(configPath, projectConfig);
    console.log('wrote next.config.ts');

    // Write configs.json
    const dataPath = path.join(tmpDir, 'data', 'configs.json');
    fs.writeFileSync(
      dataPath,
      JSON.stringify(
        buildConfigs(subdomain, web, mainMenus as any, footerMenus as any),
      ),
    );
    console.log('wrote configs.json');

    // Write page json files
    for (const page of pages) {
      const fileName = ['/', '', 'home'].includes(page.slug)
        ? 'index'
        : page.slug;
      const pagePath = path.join(tmpDir, 'data', 'pages', `${fileName}.json`);
      fs.writeFileSync(pagePath, JSON.stringify(buildPageConfigs(page as any)));
    }
    console.log('wrote all pages');

    // Download favicon if exists
    if ((web.favicon as any)?.url) {
      const iconPath = path.join(tmpDir, 'app', 'favicon.ico');
      await downloadImage(
        `${domain}/read-file?key=${(web.favicon as any).url}`,
        iconPath,
      );
    }
    console.log('favicon url:', (web.favicon as any)?.url);

    // Collect all files for Vercel upload
    const binaryExts = /\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/;
    const files = allFilePaths(tmpDir).map((filePath) => {
      const relPath = path.relative(tmpDir, filePath).replace(/\\/g, '/');
      const isBinary = binaryExts.test(path.extname(filePath));
      const fileData = fs.readFileSync(filePath);
      return isBinary
        ? {
            file: relPath,
            data: fileData.toString('base64'),
            encoding: 'base64',
          }
        : { file: relPath, data: fileData.toString('utf8') };
    });
    console.log('total files to upload:', files.length);

    // Deploy to Vercel
    const projectName = `${web.name}`
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '-');
    console.log('calling vercel api...');

    const response = await fetch(
      'https://api.vercel.com/v13/deployments?forceNew=0&skipAutoDetectionConfirmation=0',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName,
          files,
          target: 'production',
          project: projectName,
          projectSettings: {
            installCommand: 'yarn install',
            buildCommand: 'next build',
            framework: 'nextjs',
          },
        }),
      },
    );

    console.log('vercel response status:', response.status);
    const result = await response.json();
    console.log('vercel result:', JSON.stringify(result));

    if (!response.ok) {
      throw new Error(
        `Deployment failed: ${result.error?.message || 'Unknown error'}`,
      );
    }

    return result;
  } catch (error) {
    throw new Error('Failed to deploy to Vercel: ' + error.message);
  } finally {
    tmp.setGracefulCleanup();
  }
};

// ---- Vercel utility functions ----

export const getDomains = async (projectId: string) => {
  const VERCEL_TOKEN = getEnv({ name: 'VERCEL_TOKEN' });
  const response = await fetch(
    `https://api.vercel.com/v9/projects/${projectId}/domains`,
    { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } },
  );
  return response.json();
};

export const getDomainConfig = async (domain: string) => {
  const VERCEL_TOKEN = getEnv({ name: 'VERCEL_TOKEN' });
  const VERCEL_TEAM_ID = getEnv({ name: 'VERCEL_TEAM_ID' });
  const response = await fetch(
    `https://api.vercel.com/v6/domains/${domain}/config?teamId=${VERCEL_TEAM_ID}`,
    { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } },
  );
  return response.json();
};

export const removeProject = async (projectId: string) => {
  const VERCEL_TOKEN = getEnv({ name: 'VERCEL_TOKEN' });
  const response = await fetch(
    `https://api.vercel.com/v9/projects/${projectId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
    },
  );
  return response.json();
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
    },
  );
  return response.json();
};

export const getDeployment = async (id: string) => {
  const VERCEL_TOKEN = getEnv({ name: 'VERCEL_TOKEN' });
  const response = await fetch(`https://api.vercel.com/v13/deployments/${id}`, {
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
  });
  return response.json();
};

export const getDeploymentEvents = async (id: string) => {
  const VERCEL_TOKEN = getEnv({ name: 'VERCEL_TOKEN' });
  const response = await fetch(
    `https://api.vercel.com/v3/deployments/${id}/events`,
    { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } },
  );
  return response.json();
};
