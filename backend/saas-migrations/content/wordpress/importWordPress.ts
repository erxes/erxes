import 'dotenv/config';

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

const HELP = String.raw`
Import a WordPress WXR export into an existing erxes content CMS.

Usage:
  pnpm import:wordpress -- \
    --file=/absolute/path/site.xml \
    --target-subdomain=acme \
    --client-portal-id=portal_id \
    --admin-user-id=user_id \
    [--dry-run] [--skip-media]

Options:
  --batch-size=500
  --max-wxr-bytes=536870912
  --max-media-bytes=104857600
  --media-timeout-ms=30000
  --media-concurrency=3
`.trim();

const BOOLEAN_ARGUMENTS = new Set(['dry-run', 'help', 'skip-media']);
const VALUE_ARGUMENTS = new Set([
  'admin-user-id',
  'batch-size',
  'client-portal-id',
  'file',
  'max-media-bytes',
  'max-wxr-bytes',
  'media-concurrency',
  'media-timeout-ms',
  'target-subdomain',
]);

interface ParsedArguments {
  flags: Set<string>;
  values: Map<string, string>;
}

interface ParsedArgument {
  name: string;
  inlineValue?: string;
}

const parseArgument = (argument: string): ParsedArgument => {
  if (!argument.startsWith('--')) {
    throw new Error(`Unexpected positional argument "${argument}".`);
  }

  const separatorIndex = argument.indexOf('=');

  return {
    name: argument.slice(2, separatorIndex === -1 ? undefined : separatorIndex),
    inlineValue:
      separatorIndex === -1 ? undefined : argument.slice(separatorIndex + 1),
  };
};

const addBooleanArgument = (
  flags: Set<string>,
  name: string,
  inlineValue: string | undefined,
): void => {
  if (inlineValue !== undefined) {
    throw new Error(`Boolean option "--${name}" does not accept a value.`);
  }

  flags.add(name);
};

const readValueArgument = (
  argv: string[],
  index: number,
  name: string,
  inlineValue: string | undefined,
): { value: string; consumedNext: boolean } => {
  const consumedNext = inlineValue === undefined;
  const value = inlineValue ?? argv[index + 1];

  if (!value || (consumedNext && value.startsWith('--'))) {
    throw new Error(`Option "--${name}" requires a value.`);
  }

  return { value, consumedNext };
};

const parseArguments = (argv: string[]): ParsedArguments => {
  const flags = new Set<string>();
  const values = new Map<string, string>();

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === '--') {
      continue;
    }

    const { name, inlineValue } = parseArgument(argument);

    if (BOOLEAN_ARGUMENTS.has(name)) {
      addBooleanArgument(flags, name, inlineValue);
      continue;
    }

    if (!VALUE_ARGUMENTS.has(name)) {
      throw new Error(`Unknown option "--${name}".`);
    }

    const { value, consumedNext } = readValueArgument(
      argv,
      index,
      name,
      inlineValue,
    );
    values.set(name, value);

    if (consumedNext) {
      index += 1;
    }
  }

  return { flags, values };
};

const parsePositiveInteger = (
  value: string | undefined,
  fallback: number,
  name: string,
): number => {
  const normalized = value || String(fallback);
  const parsed = /^\d+$/.test(normalized) ? Number(normalized) : Number.NaN;

  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new Error(`--${name} must be a positive integer.`);
  }

  return parsed;
};

const envFlag = (value: string | undefined): boolean =>
  value === '1' || value?.toLowerCase() === 'true';

export const parseImportOptions = (
  argv: string[],
  env: NodeJS.ProcessEnv = process.env,
): WordPressImportOptions | null => {
  const { flags, values } = parseArguments(argv);

  if (flags.has('help')) {
    return null;
  }

  const wxrPath = values.get('file');
  const targetSubdomain = (
    values.get('target-subdomain') ||
    env.TARGET_SUBDOMAIN ||
    ''
  ).trim();
  const clientPortalId = (
    values.get('client-portal-id') ||
    env.CLIENT_PORTAL_ID ||
    ''
  ).trim();
  const adminUserId = (
    values.get('admin-user-id') ||
    env.ADMIN_USER_ID ||
    ''
  ).trim();
  const missing = [
    !wxrPath && '--file',
    !targetSubdomain && '--target-subdomain',
    !clientPortalId && '--client-portal-id',
    !adminUserId && '--admin-user-id',
  ].filter((value): value is string => Boolean(value));

  if (!wxrPath || !targetSubdomain || !clientPortalId || !adminUserId) {
    throw new Error(`Missing required options: ${missing.join(', ')}`);
  }

  return {
    wxrPath: resolve(wxrPath),
    targetSubdomain,
    clientPortalId,
    adminUserId,
    dryRun: flags.has('dry-run') || envFlag(env.DRY_RUN),
    skipMedia: flags.has('skip-media'),
    batchSize: parsePositiveInteger(
      values.get('batch-size') || env.BATCH_SIZE,
      500,
      'batch-size',
    ),
    maxWxrBytes: parsePositiveInteger(
      values.get('max-wxr-bytes') || env.MAX_WXR_BYTES,
      512 * 1024 * 1024,
      'max-wxr-bytes',
    ),
    maxMediaBytes: parsePositiveInteger(
      values.get('max-media-bytes') || env.MAX_MEDIA_BYTES,
      100 * 1024 * 1024,
      'max-media-bytes',
    ),
    mediaTimeoutMs: parsePositiveInteger(
      values.get('media-timeout-ms') || env.MEDIA_TIMEOUT_MS,
      30_000,
      'media-timeout-ms',
    ),
    mediaConcurrency: parsePositiveInteger(
      values.get('media-concurrency') || env.MEDIA_CONCURRENCY,
      3,
      'media-concurrency',
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
        '[warning] Media transfer was skipped; original WordPress URLs remain in content.',
      );
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

if (require.main === module) {
  let options: WordPressImportOptions | null;

  try {
    options = parseImportOptions(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    console.error(HELP);
    process.exitCode = 1;
    options = null;
  }

  if (!options) {
    if (!process.exitCode) {
      console.log(HELP);
    }
  } else {
    runWordPressImport(options)
      .then((exitCode) => {
        process.exitCode = exitCode;
      })
      .catch((error) => {
        console.error(error instanceof Error ? error.stack : String(error));
        process.exitCode = 1;
      });
  }
}
