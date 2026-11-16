import { type EbarimtTaxRule, caller, type Db, ebarimtSettings } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { assertOutboundUrl, OutboundError } from '~/lib/outbound';
import { oneRow } from '~/lib/rows';
import { recordAudit } from '~/modules/audit/audit.service';
import { settingsOf } from './plan';
import { posApiInfo } from './posapi';

interface SettingsInput {
  status?: (typeof ebarimtSettings.$inferSelect)['status'];
  posApiUrl: string;
  companyName: string;
  merchantTin: string;
  posNo?: string;
  districtCode: string;
  branchNo?: string;
  vatPercent?: number;
  cityTaxPercent?: number;
  classificationCode?: string;
  plugins?: string[];
  rules?: EbarimtTaxRule[];
}

/** A PosAPI address core may call (https and public outside development). 400 INVALID_URL. */
const checkUrl = (url: string) => {
  try {
    assertOutboundUrl(url);
  } catch (error) {
    throw fail(
      'INVALID_URL',
      error instanceof OutboundError ? error.message : 'Not a valid address',
    );
  }
};

export const getSettings = (client: Db) => settingsOf(client);

/** Sets eBarimt up, or changes its settings; audited with what changed. */
export const saveSettings = async (client: Db, input: SettingsInput) => {
  checkUrl(input.posApiUrl);

  const before = await settingsOf(client);
  const values = { ...input, updatedBy: caller('user').userId, updatedAt: sql`now()` };

  const row = oneRow(
    await client
      .insert(ebarimtSettings)
      .values(values)
      .onConflictDoUpdate({ target: ebarimtSettings.orgId, set: values })
      .returning(),
  );

  await recordAudit(client, {
    action: before ? 'ebarimt.settings_changed' : 'ebarimt.set_up',
    targetType: 'ebarimt_settings',
    targetId: row.orgId,
    targetLabel: row.companyName,
    metadata: {
      status: row.status,
      merchantTin: row.merchantTin,
      posNo: row.posNo,
      plugins: row.plugins,
      rules: row.rules.length,
    },
  });

  return row;
};

/** Removes eBarimt. Issued receipts stay with their invoices. */
export const removeSettings = async (client: Db) => {
  const before = await settingsOf(client);

  if (!before) return { ok: true as const };

  await client.delete(ebarimtSettings);
  await recordAudit(client, {
    action: 'ebarimt.removed',
    targetType: 'ebarimt_settings',
    targetId: before.orgId,
    targetLabel: before.companyName,
  });

  return { ok: true as const };
};

/** Asks the PosAPI for its state. Calls out: outside any scope. */
export const testConnection = (posApiUrl: string) => {
  checkUrl(posApiUrl);

  return posApiInfo(posApiUrl);
};
