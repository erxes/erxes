import { CursorQuery } from '@erxes/core-contract';
import { anyActive, configOf } from '~/modules/ebarimt/plan';
import { RECEIPT_ACTIONS } from '~/modules/ebarimt/receiptActions';
import { listReceipts } from '~/modules/ebarimt/receipts.service';
import type { PagedIntegration } from './define';

export const ebarimt: PagedIntegration = {
  key: 'ebarimt',
  name: 'eBarimt',
  summary: 'Mongolian tax receipts for paid invoices, sent through your PosAPI.',
  category: 'government',
  countries: ['MN'],
  permission: 'integrations.manage',
  actions: RECEIPT_ACTIONS,
  async status(tx) {
    if (!(await configOf(tx))) return { state: 'not-set-up', count: null };

    if (!(await anyActive(tx))) return { state: 'off', count: null };

    const failed = await listReceipts(tx, { ...CursorQuery.parse({ limit: 1 }), status: 'failed' });
    const count = failed.totalCount ?? 0;

    return count ? { state: 'attention', count } : { state: 'connected', count: null };
  },
};
