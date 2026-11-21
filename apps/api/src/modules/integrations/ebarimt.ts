import { CursorQuery } from '@erxes/core-contract';
import { settingsOf } from '~/modules/ebarimt/plan';
import { listReceipts } from '~/modules/ebarimt/receipts.service';
import { defineIntegration } from './define';

export const ebarimt = defineIntegration({
  key: 'ebarimt',
  name: 'eBarimt',
  summary: 'Mongolian tax receipts for paid invoices, sent through your PosAPI.',
  category: 'tax',
  countries: ['MN'],
  permission: 'integrations.manage',
  async status(tx) {
    const settings = await settingsOf(tx);

    if (!settings) return { state: 'not-set-up', count: null };

    if (settings.status !== 'active') return { state: 'off', count: null };

    const failed = await listReceipts(tx, { ...CursorQuery.parse({ limit: 1 }), status: 'failed' });
    const count = failed.totalCount ?? 0;

    return count ? { state: 'attention', count } : { state: 'connected', count: null };
  },
});
