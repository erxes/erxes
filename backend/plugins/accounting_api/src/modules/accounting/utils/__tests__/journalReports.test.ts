/// <reference types="jest" />

import { JOURNALS } from '../../@types/constants';
import { resolveErkhetReportJournals } from '../journalReports/erkhetKinds';

describe('resolveErkhetReportJournals', () => {
  it('includes cost adjustments in the inventory adjustment report filter', () => {
    expect(resolveErkhetReportJournals({ getTrKind: 'only_adjust' })).toEqual({
      hasFilter: true,
      journals: [JOURNALS.INV_JUSTIFY],
    });
  });
});
