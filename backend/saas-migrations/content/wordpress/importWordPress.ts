import { resolve } from 'node:path';

import { MongoClient } from 'mongodb';

import { buildImportPlan } from './buildImportPlan';
import { normalizeSourceSite } from './idMap';
import { applyMediaToImportPlan, importWordPressMedia } from './media';
import { parseWxrFile } from './parseWxr';
import { extractDatabaseName, resolveWordPressTarget } from './resolveTarget';
import { resolveImportSlugs } from './resolveSlugs';
import { WordPressImportOptions } from './types';
import {
  loadWordPressMappings,
  prepareWordPressMappingCollection,
  validateImportConflicts,
  writeImportPlan,
} from './writeImport';

const DEFAULT_MONGO_URL =
  'mongodb://localhost:27017/erxes?directConnection=true';

const parsePositiveInteger = (
  value: string | undefined,
  fallback: number,
  name: string,
): number => {
  const normalized = value || String(fallback);
  const parsed = /^\d+$/.test(normalized) ? Number(normalized) : Number.NaN;

  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return parsed;
};

const parseEnvironmentFlag = (
  value: string | undefined,
  name: string,
): boolean => {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === '1' || normalized === 'true') {
    return true;
  }

  if (normalized === '0' || normalized === 'false') {
    return false;
  }

  throw new Error(`${name} must be one of: true, false, 1, 0.`);
};

export const readWordPressImportOptions = (
  wxrPath: string,
  env: NodeJS.ProcessEnv = process.env,
): WordPressImportOptions => {
  const targetSubdomain = (env.TARGET_SUBDOMAIN || '').trim();
  const clientPortalId = (env.CLIENT_PORTAL_ID || '').trim();
  const adminUserId = (env.ADMIN_USER_ID || '').trim();
  const missing = [
    !targetSubdomain && 'TARGET_SUBDOMAIN',
    !clientPortalId && 'CLIENT_PORTAL_ID',
    !adminUserId && 'ADMIN_USER_ID',
  ].filter((value): value is string => Boolean(value));

  if (!targetSubdomain || !clientPortalId || !adminUserId) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }

  return {
    wxrPath: resolve(wxrPath),
    targetSubdomain,
    clientPortalId,
    adminUserId,
    dryRun: parseEnvironmentFlag(env.DRY_RUN, 'DRY_RUN'),
    skipMedia: parseEnvironmentFlag(env.SKIP_MEDIA, 'SKIP_MEDIA'),
    batchSize: parsePositiveInteger(env.BATCH_SIZE, 500, 'BATCH_SIZE'),
    maxWxrBytes: parsePositiveInteger(
      env.MAX_WXR_BYTES,
      512 * 1024 * 1024,
      'MAX_WXR_BYTES',
    ),
    maxMediaBytes: parsePositiveInteger(
      env.MAX_MEDIA_BYTES,
      100 * 1024 * 1024,
      'MAX_MEDIA_BYTES',
    ),
    mediaTimeoutMs: parsePositiveInteger(
      env.MEDIA_TIMEOUT_MS,
      30_000,
      'MEDIA_TIMEOUT_MS',
    ),
    mediaConcurrency: parsePositiveInteger(
      env.MEDIA_CONCURRENCY,
      3,
      'MEDIA_CONCURRENCY',
    ),
  };
};

const printPlanSummary = (
  options: WordPressImportOptions,
  plan: ReturnType<typeof buildImportPlan>,
): void => {
  console.log(`Source site: ${plan.sourceSite}`);
  console.log(`Target subdomain: ${options.targetSubdomain}`);
  console.log(`Client portal: ${options.clientPortalId}`);
  console.log(`Admin author: ${options.adminUserId}`);
  console.log(`Categories: ${plan.categories.length}`);
  console.log(`Tags: ${plan.tags.length}`);
  console.log(`Custom post types: ${plan.customPostTypes.length}`);
  console.log(`Custom field groups: ${plan.customFieldGroups.length}`);
  console.log(`Posts/CPT entries: ${plan.posts.length}`);
  console.log(`Pages: ${plan.pages.length}`);
  console.log(`Translations: ${plan.translations.length}`);
  console.log(`Menu items: ${plan.menus.length}`);
  console.log(`Media files: ${plan.media.length}`);

  if (Object.keys(plan.skipped).length > 0) {
    console.log(`Skipped: ${JSON.stringify(plan.skipped)}`);
  }

  for (const warning of plan.warnings) {
    console.warn(`[warning] ${warning}`);
  }
};

export const runWordPressImport = async (
  options: WordPressImportOptions,
): Promise<number> => {
  const mongoUrl =
    process.env.CORE_MONGO_URL || process.env.MONGO_URL || DEFAULT_MONGO_URL;
  const client = new MongoClient(mongoUrl);

  try {
    const wxr = await parseWxrFile(options.wxrPath, options.maxWxrBytes);

    await client.connect();

    const coreDbName = extractDatabaseName(mongoUrl);
    const coreDb = client.db(coreDbName);
    const target = await resolveWordPressTarget(
      client,
      coreDb,
      options.targetSubdomain,
      options.clientPortalId,
      options.adminUserId,
    );
    const targetDb = client.db(target.targetDbName);
    const sourceSite = normalizeSourceSite(
      wxr.site.baseBlogUrl || wxr.site.baseSiteUrl || wxr.site.link,
    );
    const existingMappings = await loadWordPressMappings(
      targetDb,
      sourceSite,
      options.clientPortalId,
    );
    const plan = buildImportPlan(wxr, {
      clientPortalId: options.clientPortalId,
      adminUserId: options.adminUserId,
      existingMappings,
    });

    await resolveImportSlugs(targetDb, plan);
    console.log(`Core database: ${coreDbName}`);
    console.log(`Target database: ${target.targetDbName}`);
    printPlanSummary(options, plan);
    await validateImportConflicts(targetDb, plan);

    if (options.dryRun) {
      console.log(
        'DRY RUN complete: validation passed; no files or data changed.',
      );
      return 0;
    }

    await prepareWordPressMappingCollection(targetDb);

    let mediaFailureCount = 0;

    if (options.skipMedia) {
      console.warn(
        '[warning] Media transfer was skipped; original WordPress URLs were stored in attachment fields and remain in content.',
      );
      applyMediaToImportPlan(plan, {
        attachments: new Map(),
        failures: [],
      });
    } else {
      const mediaResult = await importWordPressMedia({
        db: targetDb,
        plan,
        targetSubdomain: options.targetSubdomain,
        maxBytes: options.maxMediaBytes,
        timeoutMs: options.mediaTimeoutMs,
        concurrency: options.mediaConcurrency,
      });

      applyMediaToImportPlan(plan, mediaResult);
      mediaFailureCount = mediaResult.failures.length;

      for (const failure of mediaResult.failures) {
        console.error(
          `[media failed] WordPress attachment ${failure.sourceId} (${failure.sourceUrl}): ${failure.message}`,
        );
      }
    }

    const report = await writeImportPlan(
      targetDb,
      target,
      plan,
      options.batchSize,
    );

    for (const [collection, stats] of Object.entries(report.collections)) {
      console.log(
        `${collection}: ${stats.upserted} inserted, ${stats.matched} matched/updated`,
      );
    }

    console.log(`content_cms: ${report.cmsUpdated} metadata record updated`);

    if (mediaFailureCount > 0) {
      console.error(
        `Import data completed with ${mediaFailureCount} media failure(s). Rerun the same command to retry them safely.`,
      );
      return 2;
    }

    console.log('WordPress import completed successfully.');
    return 0;
  } finally {
    await client.close();
  }
};
