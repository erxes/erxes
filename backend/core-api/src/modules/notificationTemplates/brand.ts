import { escapeHtml } from 'erxes-api-shared/core-modules';
import {
  ExpectedError,
  getEnv,
  resetConfigsCache,
} from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { getConfigs } from '@/organization/settings/utils/configs';
import {
  formatPostalAddress,
  getPostalAddress,
} from '~/utils/email/postalAddress';
import {
  findTemplateKeyByFile,
  SYSTEM_EMAIL_TEMPLATES,
} from '@/notificationTemplates/registry';

export type TEmailBrand = {
  name: string;
  logoUrl: string;
  color: string;
  footerText: string;
};

const BRAND_CONFIG_CODES: Record<keyof TEmailBrand, string> = {
  name: 'EMAIL_BRAND_NAME',
  logoUrl: 'EMAIL_BRAND_LOGO',
  color: 'EMAIL_BRAND_COLOR',
  footerText: 'EMAIL_BRAND_FOOTER',
};

const DEFAULT_COLOR = '#4f46e5';
const COLOR = /^#[0-9a-f]{6}$/i;

/**
 * An uploaded address can carry spaces from its file name, and mail apps and
 * image proxies load only an encoded one. Already-encoded parts stay as they are.
 */
export const normalizeImageUrl = (url: string) => {
  const trimmed = url.trim();

  try {
    return encodeURI(decodeURI(trimmed));
  } catch {
    // a lone % is not an encoding, so the address is encoded as written
    return encodeURI(trimmed);
  }
};

export const getEmailBrand = async (models: IModels): Promise<TEmailBrand> => {
  const configs = (await getConfigs(models)) as Record<string, unknown>;
  const read = (key: keyof TEmailBrand) =>
    String(configs[BRAND_CONFIG_CODES[key]] || '');

  return {
    name: read('name'),
    logoUrl: normalizeImageUrl(read('logoUrl')),
    color: read('color') || DEFAULT_COLOR,
    footerText: read('footerText'),
  };
};

export const updateEmailBrand = async (
  models: IModels,
  brand: Partial<TEmailBrand>,
) => {
  if (brand.color && !COLOR.test(brand.color)) {
    throw new ExpectedError('Brand color must be a hex color such as #4f46e5');
  }

  if (brand.logoUrl && !/^https?:\/\//i.test(brand.logoUrl)) {
    throw new ExpectedError(
      'The logo must be an http(s) address an email can load',
    );
  }

  const values = {
    ...brand,
    ...(brand.logoUrl !== undefined && {
      logoUrl: normalizeImageUrl(brand.logoUrl),
    }),
  };

  for (const key of Object.keys(BRAND_CONFIG_CODES) as (keyof TEmailBrand)[]) {
    if (values[key] !== undefined) {
      await models.Configs.createOrUpdateConfig({
        code: BRAND_CONFIG_CODES[key],
        value: (values[key] || '').trim(),
      });
    }
  }

  await resetConfigsCache();

  return getEmailBrand(models);
};

const renderHeader = ({ name, logoUrl, color }: TEmailBrand) => {
  if (logoUrl) {
    return `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(
      name,
    )}" height="32" style="display: inline-block; height: 32px; width: auto; border: 0;" />`;
  }

  // no logo yet: the name stands in, and nothing at all when neither is set
  return name
    ? `<span style="font-size: 18px; font-weight: 600; color: ${color};">${escapeHtml(
        name,
      )}</span>`
    : '';
};

const renderFooter = (
  { footerText, color }: TEmailBrand,
  postalAddress: string,
  manageUrl?: string,
) => {
  const lines = [
    footerText && escapeHtml(footerText).replace(/\n/g, '<br />'),
    postalAddress && escapeHtml(postalAddress),
    manageUrl &&
      `<a href="${escapeHtml(manageUrl)}" style="color: ${color};">Manage notification settings</a>`,
  ].filter(Boolean);

  return lines.length
    ? `<div style="font-size: 12px; line-height: 1.6; color: #6b7280;">${lines.join(
        '<br />',
      )}</div>`
    : '';
};

const toBrandValues = async (
  models: IModels,
  subdomain: string,
  brand: TEmailBrand,
  { manageLink }: { manageLink: boolean },
) => {
  const postalAddress = formatPostalAddress(await getPostalAddress(models));
  const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });

  return {
    name: brand.name,
    color: brand.color,
    header: renderHeader(brand),
    footer: renderFooter(
      brand,
      postalAddress,
      manageLink ? `${DOMAIN}/settings/notification` : undefined,
    ),
  };
};

/**
 * The values a published template's brand fields are filled with on every
 * send, so a brand change reaches templates without saving them again.
 */
export const buildBrandValues = async (
  models: IModels,
  subdomain: string,
  options: { manageLink: boolean },
) => toBrandValues(models, subdomain, await getEmailBrand(models), options);

/**
 * The brand a built-in file is sent in, or null while the workspace has not
 * chosen one, so a workspace without a brand keeps the erxes design untouched.
 */
export const buildBuiltInBrand = async (
  models: IModels,
  subdomain: string,
  file: string,
) => {
  const key = findTemplateKeyByFile(file);

  if (!key) {
    return null;
  }

  const brand = await getEmailBrand(models);

  if (!brand.name && !brand.logoUrl && !brand.footerText) {
    return null;
  }

  return toBrandValues(models, subdomain, brand, {
    manageLink: SYSTEM_EMAIL_TEMPLATES[key].manageLink,
  });
};
