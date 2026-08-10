import { canGroup, getGroupActionsMap } from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { CMS_POST_ACTIONS, permissions } from '~/meta/permissions';
import { IContext } from '~/connectionResolvers';

type TranslationInput = {
  language?: string;
};

type CmsPermissionScope = 'own' | 'group' | 'all';

type CmsPermission = {
  plugin?: string;
  module: string;
  actions?: string[];
  scope: CmsPermissionScope;
};

type CmsReadAccess = {
  language?: string;
  translationLanguage?: string;
  query: Record<string, any>;
};

const COMMON_LANGUAGE_ACTIONS: Record<string, string> = {
  [CMS_POST_ACTIONS.languageMn]: 'mn',
  [CMS_POST_ACTIONS.languageEn]: 'en',
};

const normalizeLanguage = (language?: string | null) =>
  language ? language.trim().toLowerCase() : '';

const toLanguageActionSuffix = (language: string) =>
  language
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');

const canCms = (context: IContext, action: string) =>
  canGroup(context.subdomain, action, context.user);

const scopePriority: Record<CmsPermissionScope, number> = {
  own: 1,
  group: 2,
  all: 3,
};

const normalizeScope = (scope?: string): CmsPermissionScope =>
  scope === 'all' || scope === 'group' ? scope : 'own';

const pickStrongerScope = (
  current: CmsPermissionScope | null,
  next?: string,
): CmsPermissionScope => {
  const normalized = normalizeScope(next);

  if (!current || scopePriority[normalized] > scopePriority[current]) {
    return normalized;
  }

  return current;
};

const getUserCmsPermissions = async (
  context: IContext,
): Promise<CmsPermission[]> => {
  const cached = (context as any).__cmsPermissions as
    | CmsPermission[]
    | undefined;

  if (cached) {
    return cached;
  }

  const { user, subdomain } = context;

  if (!user?._id) {
    throw new Error('Login required');
  }

  const groupIds = user.permissionGroupIds || [];
  const defaultGroupIds = groupIds.filter((id) => id.includes(':'));
  const customGroupIds = groupIds.filter((id) => !id.includes(':'));
  const result: CmsPermission[] = [];

  for (const groupId of defaultGroupIds) {
    const group = permissions.defaultGroups?.find((item) => item.id === groupId);

    if (group) {
      result.push(...(group.permissions as CmsPermission[]));
    }
  }

  if (customGroupIds.length) {
    const groups = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'permissionGroups',
      action: 'find',
      input: {
        query: { _id: { $in: customGroupIds } },
      },
      defaultValue: [],
    });

    for (const group of groups) {
      result.push(...((group.permissions || []) as CmsPermission[]));
    }
  }

  result.push(...((user.customPermissions || []) as CmsPermission[]));

  const filtered = result.filter(
    (permission) =>
      permission.plugin === 'content' && permission.module === 'cmsPost',
  );

  (context as any).__cmsPermissions = filtered;

  return filtered;
};

export const getCmsPermissionScope = async (
  context: IContext,
  actions: string | string[],
): Promise<CmsPermissionScope | null> => {
  const { user } = context;

  if (!user?._id) {
    throw new Error('Login required');
  }

  if (user.isOwner) {
    return 'all';
  }

  const actionList = Array.isArray(actions) ? actions : [actions];
  const permissionList = await getUserCmsPermissions(context);
  let bestScope: CmsPermissionScope | null = null;

  for (const permission of permissionList) {
    if (
      permission.actions?.some((action) => actionList.includes(action))
    ) {
      bestScope = pickStrongerScope(bestScope, permission.scope);
    }
  }

  return bestScope;
};

export const hasCmsPermission = async (
  context: IContext,
  actions: string | string[],
) => {
  return Boolean(await getCmsPermissionScope(context, actions));
};

export const requireCmsPermission = async (
  context: IContext,
  actions: string | string[],
) => {
  const scope = await getCmsPermissionScope(context, actions);

  if (scope) {
    return scope;
  }

  throw new Error('Permission required');
};

export const getCmsScopeQuery = async (
  context: IContext,
  actions: string | string[],
) => {
  const scope = await requireCmsPermission(context, actions);

  if (context.user?.isOwner || scope === 'all') {
    return {};
  }

  if (!context.user?._id) {
    throw new Error('Login required');
  }

  return { authorId: context.user._id };
};

export const assertCmsDocumentAccess = async ({
  context,
  actions,
  document,
}: {
  context: IContext;
  actions: string | string[];
  document?: { authorId?: string | null };
}) => {
  const scope = await requireCmsPermission(context, actions);

  if (context.user?.isOwner || scope === 'all') {
    return;
  }

  if (!document || String(document.authorId || '') !== context.user?._id) {
    throw new Error('Permission required');
  }
};

export const getAllowedCmsLanguages = async (context: IContext) => {
  const { user, subdomain } = context;

  if (!user?._id) {
    throw new Error('Login required');
  }

  if (user.isOwner || (await canCms(context, CMS_POST_ACTIONS.languageAll))) {
    return null;
  }

  const actionsMap = await getGroupActionsMap(subdomain, user);
  const languages = new Set<string>();

  for (const [action, language] of Object.entries(COMMON_LANGUAGE_ACTIONS)) {
    if (actionsMap[action]) {
      languages.add(language);
    }
  }

  for (const action of Object.keys(actionsMap)) {
    if (action.startsWith('cmsLanguage:')) {
      languages.add(normalizeLanguage(action.replace('cmsLanguage:', '')));
    }
  }

  return languages;
};

export const isCmsLanguageAllowed = async (
  context: IContext,
  language?: string | null,
) => {
  const normalized = normalizeLanguage(language);

  if (!normalized) {
    return true;
  }

  if (await canCms(context, CMS_POST_ACTIONS.languageAll)) {
    return true;
  }

  const actionSuffix = toLanguageActionSuffix(normalized);

  if (actionSuffix && (await canCms(context, `cmsLanguage${actionSuffix}`))) {
    return true;
  }

  return canCms(context, `cmsLanguage:${normalized}`);
};

const getDefaultLanguage = async (
  context: IContext,
  clientPortalId?: string,
) => {
  if (!clientPortalId) {
    return undefined;
  }

  const cms = await context.models.CMS.findOne({ clientPortalId })
    .select({ language: 1 })
    .lean();

  return cms?.language;
};

export const assertCmsLanguageAccess = async ({
  context,
  clientPortalId,
  language,
  translations,
}: {
  context: IContext;
  clientPortalId?: string;
  language?: string;
  translations?: TranslationInput[];
}) => {
  const languages = new Set<string>();

  if (language) {
    languages.add(normalizeLanguage(language));
  }

  for (const translation of translations || []) {
    if (translation?.language) {
      languages.add(normalizeLanguage(translation.language));
    }
  }

  if (languages.size === 0) {
    const defaultLanguage = await getDefaultLanguage(context, clientPortalId);
    if (defaultLanguage) {
      languages.add(normalizeLanguage(defaultLanguage));
    }
  }

  for (const item of languages) {
    if (!(await isCmsLanguageAllowed(context, item))) {
      throw new Error(`CMS language permission required: ${item}`);
    }
  }
};

export const applyCmsReadLanguageFilter = async (
  context: IContext,
  clientPortalId?: string,
  requestedLanguage?: string,
) => {
  return getCmsReadAccess(context, clientPortalId, requestedLanguage);
};

export const getCmsReadAccess = async (
  context: IContext,
  clientPortalId?: string,
  requestedLanguage?: string,
): Promise<CmsReadAccess> => {
  const query = await getCmsScopeQuery(context, CMS_POST_ACTIONS.read);

  if (requestedLanguage) {
    if (!clientPortalId) {
      throw new Error('clientPortalId is required when querying by language');
    }

    await assertCmsLanguageAccess({
      context,
      clientPortalId,
      language: requestedLanguage,
    });

    const defaultLanguage = await getDefaultLanguage(context, clientPortalId);
    const normalizedLanguage = normalizeLanguage(requestedLanguage);

    return {
      query,
      language: normalizedLanguage,
      translationLanguage:
        defaultLanguage &&
        normalizeLanguage(defaultLanguage) !== normalizedLanguage
          ? normalizedLanguage
          : undefined,
    };
  }

  const allowedLanguages = await getAllowedCmsLanguages(context);

  if (!allowedLanguages) {
    return { query };
  }

  if (allowedLanguages.size === 0) {
    throw new Error('CMS language permission required');
  }

  if (!clientPortalId) {
    throw new Error('clientPortalId is required for CMS language permissions');
  }

  if (allowedLanguages.size > 1) {
    throw new Error('CMS language is required');
  }
  const language = Array.from(allowedLanguages)[0];
  const defaultLanguage = await getDefaultLanguage(context, clientPortalId);

  return {
    query,
    language,
    translationLanguage:
      !defaultLanguage || normalizeLanguage(defaultLanguage) !== language
        ? language
        : undefined,
  };
};
