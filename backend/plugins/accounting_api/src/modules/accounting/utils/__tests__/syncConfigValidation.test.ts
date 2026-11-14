/// <reference types="jest" />

import { validateSyncConfig } from '~/modules/accounting/utils/syncConfigValidation';

const dealRule = {
  title: 'Online shop won deals',
  boardId: 'board-sales',
  pipelineId: 'pipeline-online',
  stageId: 'stage-won',
  saleAccountId: 'acc-510100',
  saleOutAccountId: 'acc-150100',
  saleCostAccountId: 'acc-610100',
  hasVat: true,
  vatRowId: 'vat-row-sales',
  hasCtax: false,
  ctaxRowId: '',
};

describe('sync rule validation on save', () => {
  it('rejects a deal rule posted by an old client without accounts or stage', () => {
    expect(() =>
      validateSyncConfig({
        code: 'syncDeal',
        subId: '',
        value: { title: 'Won deals', dateRule: 'alwaysNow' },
      }),
    ).toThrow(
      'Sync rule is missing required fields: stageId, saleAccountId, saleOutAccountId, saleCostAccountId',
    );
  });

  it('rejects a deal rule whose title is only spaces', () => {
    expect(() =>
      validateSyncConfig({
        code: 'syncDeal',
        subId: 'stage-won',
        value: { ...dealRule, title: '   ' },
      }),
    ).toThrow('Sync rule is missing required fields: title');
  });

  it('rejects a deal rule with VAT switched on but no VAT row', () => {
    expect(() =>
      validateSyncConfig({
        code: 'syncDeal',
        subId: 'stage-won',
        value: { ...dealRule, vatRowId: '' },
      }),
    ).toThrow('Sync rule is missing required fields: vatRowId');
  });

  it('rejects a POS rule with city tax switched on but no city tax row', () => {
    expect(() =>
      validateSyncConfig({
        code: 'syncOrder',
        subId: 'pos-main',
        value: { ...dealRule, title: 'Main POS', hasCtax: true },
      }),
    ).toThrow('Sync rule is missing required fields: ctaxRowId');
  });

  it('rejects a POS rule saved before a POS was picked', () => {
    expect(() =>
      validateSyncConfig({
        code: 'syncOrder',
        subId: undefined,
        value: { ...dealRule, title: 'Main POS' },
      }),
    ).toThrow('Sync rule is missing required fields: posId');
  });

  it('rejects a movement rule missing its destination account', () => {
    expect(() =>
      validateSyncConfig({
        code: 'syncDealMovement',
        subId: 'stage-shipped',
        value: { title: 'Warehouse to shop', sourceAccountId: 'acc-150100' },
      }),
    ).toThrow('Sync rule is missing required fields: destinationAccountId');
  });

  it('rejects a return rule with no value at all', () => {
    expect(() =>
      validateSyncConfig({ code: 'syncDealReturn', subId: '', value: null }),
    ).toThrow('Sync rule is missing required fields: title, stageId');
  });

  it('accepts a complete deal rule with VAT', () => {
    expect(() =>
      validateSyncConfig({
        code: 'syncDeal',
        subId: 'stage-won',
        value: dealRule,
      }),
    ).not.toThrow();
  });

  it('accepts a return rule without a refund account', () => {
    expect(() =>
      validateSyncConfig({
        code: 'syncDealReturn',
        subId: 'stage-refunded',
        value: { title: 'Refunded deals', defaultPayment: null },
      }),
    ).not.toThrow();
  });

  it('rejects a deal rule sent through the by-code settings save with no stage', () => {
    expect(() =>
      validateSyncConfig({ code: 'syncDeal', subId: '', value: dealRule }),
    ).toThrow('Sync rule is missing required fields: stageId');
  });

  it('treats a code named like an object property as an ordinary setting', () => {
    expect(() =>
      validateSyncConfig({ code: 'constructor', subId: '', value: {} }),
    ).not.toThrow();
  });

  it('leaves non-sync configs such as an empty custom setting untouched', () => {
    expect(() =>
      validateSyncConfig({ code: 'erkhetConfig', subId: '', value: {} }),
    ).not.toThrow();
  });
});
