import * as dotenv from 'dotenv';
import { Db, MongoClient } from 'mongodb';
import { getTargetDbs } from '../../core/commands/_organizationDbs';

dotenv.config();

/**
 * Copies score campaigns' spending rules (`subtract.rules`, no longer read)
 * onto their wallet's `spendRules`, for wallets that have none yet. Campaigns
 * of one wallet that disagree give the strictest values (reported). Safe to
 * run again: a wallet with rules is left as it is.
 *
 * Run (DRY_RUN=true reports only, writes nothing):
 *   self-hosted:  MONGO_URL=mongodb://.../erxes npx tsx <this file>
 *   SaaS, one:    MONGO_URL=<core db> TARGET_SUBDOMAIN=<subdomain> npx tsx <this file>
 *   SaaS, all:    MONGO_URL=<core db> ALL_ORGS=true npx tsx <this file>
 */

const {
  CORE_MONGO_URL,
  MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true',
} = process.env;

const DRY_RUN = process.env.DRY_RUN === 'true';

type SpendRules = { minBalance?: number; maxShare?: number; step?: number };

type CampaignDocument = {
  _id: string;
  title?: string;
  accountTypeId?: string;
  subtract?: { rules?: SpendRules };
};

type AccountTypeDocument = {
  _id: string;
  name?: string;
  spendRules?: SpendRules;
};

const client = new MongoClient(CORE_MONGO_URL || MONGO_URL);

const numberOrUndefined = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) && number >= 0 ? number : undefined;
};

const cleanRules = (rules?: SpendRules): SpendRules => ({
  minBalance: numberOrUndefined(rules?.minBalance),
  maxShare: numberOrUndefined(rules?.maxShare),
  step: numberOrUndefined(rules?.step) || undefined,
});

const isEmpty = ({ minBalance, maxShare, step }: SpendRules) =>
  minBalance === undefined && maxShare === undefined && step === undefined;

const sameRules = (a: SpendRules, b: SpendRules) =>
  a.minBalance === b.minBalance &&
  a.maxShare === b.maxShare &&
  a.step === b.step;

const definedValues = (values: (number | undefined)[]) =>
  values.filter((value): value is number => value !== undefined);

// Campaigns of one wallet that disagree keep every limit any of them set.
const strictest = (all: SpendRules[]): SpendRules => {
  const minBalances = definedValues(all.map(({ minBalance }) => minBalance));
  const maxShares = definedValues(all.map(({ maxShare }) => maxShare));
  const steps = definedValues(all.map(({ step }) => step));

  return {
    minBalance: minBalances.length ? Math.max(...minBalances) : undefined,
    maxShare: maxShares.length ? Math.min(...maxShares) : undefined,
    step: steps.length ? Math.max(...steps) : undefined,
  };
};

const formatRules = ({ minBalance, maxShare, step }: SpendRules) =>
  `minBalance=${minBalance ?? '-'} maxShare=${maxShare ?? '-'} step=${
    step ?? '-'
  }`;

const migrateDb = async (db: Db) => {
  const Campaigns = db.collection<CampaignDocument>('score_campaigns');
  const AccountTypes = db.collection<AccountTypeDocument>(
    'loyalty_account_types',
  );

  const campaigns = await Campaigns.find(
    { 'subtract.rules': { $exists: true } },
    { projection: { title: 1, accountTypeId: 1, subtract: 1 } },
  ).toArray();

  const byWallet = new Map<string, CampaignDocument[]>();
  const walletless: string[] = [];

  for (const campaign of campaigns) {
    if (isEmpty(cleanRules(campaign.subtract?.rules))) {
      continue;
    }

    if (!campaign.accountTypeId) {
      walletless.push(`${campaign._id} ${campaign.title || ''}`.trim());
      continue;
    }

    byWallet.set(campaign.accountTypeId, [
      ...(byWallet.get(campaign.accountTypeId) || []),
      campaign,
    ]);
  }

  const moved: string[] = [];
  const merged: string[] = [];
  const kept: string[] = [];
  const missing: string[] = [];

  for (const [accountTypeId, walletCampaigns] of byWallet) {
    const wallet = await AccountTypes.findOne(
      { _id: accountTypeId },
      { projection: { name: 1, spendRules: 1 } },
    );

    if (!wallet) {
      missing.push(accountTypeId);
      continue;
    }

    // Run twice, or after someone set the wallet's rules: theirs stand.
    if (wallet.spendRules && !isEmpty(cleanRules(wallet.spendRules))) {
      kept.push(`${wallet.name} (${accountTypeId})`);
      continue;
    }

    const all = walletCampaigns.map(({ subtract }) =>
      cleanRules(subtract?.rules),
    );
    const agree = all.every((rules) => sameRules(rules, all[0]));
    const rules = agree ? all[0] : strictest(all);

    if (!DRY_RUN) {
      await AccountTypes.updateOne(
        { _id: accountTypeId },
        { $set: { spendRules: rules } },
      );
    }

    const line = `${wallet.name} (${accountTypeId}): ${formatRules(rules)}`;

    if (agree) {
      moved.push(line);
      continue;
    }

    merged.push(
      [
        line,
        ...walletCampaigns.map(
          ({ _id, title, subtract }) =>
            `    from ${title || _id}: ${formatRules(cleanRules(subtract?.rules))}`,
        ),
      ].join('\n'),
    );
  }

  const report = (title: string, lines: string[]) => {
    if (!lines.length) {
      return;
    }

    console.log(title);
    lines.forEach((line) => console.log(`  ${line}`));
  };

  console.log(
    `${DRY_RUN ? '[dry run] ' : ''}campaigns with spending rules: ${
      campaigns.length
    }`,
  );
  report('Wallets given their campaigns’ rules:', moved);
  report(
    'Wallets whose campaigns disagreed (strictest kept; check them):',
    merged,
  );
  report('Wallets that already had rules (left as they are):', kept);
  report('Campaign wallets that no longer exist:', missing);
  report(
    'Campaigns without a wallet (their rules no longer apply; give them a wallet):',
    walletless,
  );
};

const command = async () => {
  await client.connect();
  console.log(`Process started at: ${new Date().toISOString()}`);

  const failed: string[] = [];

  for (const { label, db } of await getTargetDbs(client)) {
    console.log(`\n== ${label}`);

    try {
      await migrateDb(db);
    } catch (error) {
      console.error(`${label}: ${(error as Error).message}`);
      failed.push(label);
    }
  }

  if (failed.length) {
    console.error(`\nFailed:\n  ${failed.join('\n  ')}`);
  }

  console.log(`Process finished at: ${new Date().toISOString()}`);

  await client.close();
  process.exit(failed.length ? 1 : 0);
};

command().catch(async (error) => {
  console.error(`Migration failed: ${error.message}`, error);
  await client.close();
  process.exit(1);
});
