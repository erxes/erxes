import { ACCOUNTING_SETTINGS_CODES } from '@/settings/constants/settingsRoutes';
import { getSyncConfigFormSchema } from '@/settings/syncSettings/syncConfigSchema';

const translate = (key: string) => key;

const validate = (
  code: ACCOUNTING_SETTINGS_CODES,
  values: Record<string, unknown>,
) => getSyncConfigFormSchema(code, translate).safeParse(values);

const getFieldErrors = (
  code: ACCOUNTING_SETTINGS_CODES,
  values: Record<string, unknown>,
) => {
  const result = validate(code, values);
  return result.success ? {} : result.error.flatten().fieldErrors;
};

const completeDealRule = {
  title: 'Online shop won deals',
  boardId: 'board-sales',
  pipelineId: 'pipeline-online',
  stageId: 'stage-won',
  dateRule: 'syncedDateOrNow',
  trStatus: 'complete',
  saleAccountId: 'acc-510100',
  saleOutAccountId: 'acc-150100',
  saleCostAccountId: 'acc-610100',
  hasVat: true,
  vatRowId: 'vat-row-sales',
  hasCtax: false,
  payments: { cash: { accountId: 'acc-110100' } },
  defaultPayment: { accountId: 'acc-120100' },
  defaultNegPayment: { accountId: 'acc-310100' },
};

describe('deal sync rule validation', () => {
  it('blocks saving a freshly opened rule that was submitted untouched', () => {
    expect(getFieldErrors(ACCOUNTING_SETTINGS_CODES.SYNC_DEAL, {})).toEqual({
      title: ['Required'],
      stageId: ['Required'],
      saleAccountId: ['Required'],
      saleOutAccountId: ['Required'],
      saleCostAccountId: ['Required'],
    });
  });

  it('blocks a rule whose pipeline was changed, clearing the chosen stage', () => {
    expect(
      getFieldErrors(ACCOUNTING_SETTINGS_CODES.SYNC_DEAL, {
        ...completeDealRule,
        pipelineId: 'pipeline-wholesale',
        stageId: '',
      }),
    ).toEqual({ stageId: ['Required'] });
  });

  it('blocks a rule with only spaces typed as its title', () => {
    expect(
      getFieldErrors(ACCOUNTING_SETTINGS_CODES.SYNC_DEAL, {
        ...completeDealRule,
        title: '   ',
      }),
    ).toEqual({ title: ['Required'] });
  });

  it('asks for the cost account the backend needs to post sale cost', () => {
    expect(
      getFieldErrors(ACCOUNTING_SETTINGS_CODES.SYNC_DEAL, {
        ...completeDealRule,
        saleCostAccountId: undefined,
      }),
    ).toEqual({ saleCostAccountId: ['Required'] });
  });

  it('asks for a VAT row once VAT is switched on', () => {
    expect(
      getFieldErrors(ACCOUNTING_SETTINGS_CODES.SYNC_DEAL, {
        ...completeDealRule,
        vatRowId: '',
      }),
    ).toEqual({ vatRowId: ['VAT row is required'] });
  });

  it('asks for a city tax row once city tax is switched on', () => {
    expect(
      getFieldErrors(ACCOUNTING_SETTINGS_CODES.SYNC_DEAL, {
        ...completeDealRule,
        hasCtax: true,
      }),
    ).toEqual({ ctaxRowId: ['CTAX row is required'] });
  });

  it('saves a complete rule with its payment accounts intact', () => {
    const result = validate(
      ACCOUNTING_SETTINGS_CODES.SYNC_DEAL,
      completeDealRule,
    );

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      stageId: 'stage-won',
      dateRule: 'syncedDateOrNow',
      payments: { cash: { accountId: 'acc-110100' } },
      defaultPayment: { accountId: 'acc-120100' },
    });
  });

  it('re-saves an older rule stored with nulls and no date rule', () => {
    const result = validate(ACCOUNTING_SETTINGS_CODES.SYNC_DEAL, {
      ...completeDealRule,
      hasVat: false,
      vatRowId: null,
      branchId: null,
      departmentId: null,
      dateRule: undefined,
      payments: null,
      defaultPayment: null,
      defaultNegPayment: undefined,
    });

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      dateRule: 'alwaysNow',
      branchId: '',
      payments: {},
      defaultPayment: null,
      defaultNegPayment: null,
    });
  });
});

describe('deal return rule validation', () => {
  it('blocks a return rule without a title or stage', () => {
    expect(
      getFieldErrors(ACCOUNTING_SETTINGS_CODES.SYNC_DEAL_RETURN, {
        returnType: 'delete',
      }),
    ).toEqual({ title: ['Required'], stageId: ['Required'] });
  });

  it('saves a return rule without a refund account as a full reversal', () => {
    const result = validate(ACCOUNTING_SETTINGS_CODES.SYNC_DEAL_RETURN, {
      title: 'Refunded deals',
      stageId: 'stage-refunded',
    });

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      returnType: 'fullTr',
      defaultPayment: null,
    });
  });
});

describe('deal inventory movement rule validation', () => {
  it('asks for both inventory accounts of the move', () => {
    expect(
      getFieldErrors(ACCOUNTING_SETTINGS_CODES.SYNC_DEAL_MOVEMENT, {
        title: 'Warehouse to shop',
        stageId: 'stage-shipped',
        sourceAccountId: 'acc-150100',
      }),
    ).toEqual({ destinationAccountId: ['Required'] });
  });

  it('saves a movement rule and keeps the deal location on the source side', () => {
    const result = validate(ACCOUNTING_SETTINGS_CODES.SYNC_DEAL_MOVEMENT, {
      title: 'Warehouse to shop',
      stageId: 'stage-shipped',
      sourceAccountId: 'acc-150100',
      destinationAccountId: 'acc-150200',
    });

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({ dealLocationSide: 'source' });
  });
});

describe('POS order rule validation', () => {
  it('blocks an order rule saved before a POS was picked', () => {
    expect(
      getFieldErrors(ACCOUNTING_SETTINGS_CODES.SYNC_ORDER, {
        ...completeDealRule,
        title: 'Main branch POS',
        stageId: undefined,
      }),
    ).toEqual({ posId: ['Required'] });
  });

  it('saves an order rule for a chosen POS', () => {
    const result = validate(ACCOUNTING_SETTINGS_CODES.SYNC_ORDER, {
      ...completeDealRule,
      title: 'Main branch POS',
      posId: 'pos-main',
    });

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      posId: 'pos-main',
      returnType: 'fullTr',
    });
  });
});
