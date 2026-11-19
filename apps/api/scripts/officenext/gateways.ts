/**
 * Payment gateways → `core_payment_gateways`, their settings sealed with the server's key as core
 * seals them (`seal`, keyed from `CORE_ENCRYPTION_KEY`). `payment_methods` is the list old erxes
 * used, so its gateways keep their state; `payments` is the older plugin's list, replaced by it,
 * so its gateways come in turned off. A kind core has no gateway for, or settings core's form
 * would refuse, is skipped with the reason; the report names fields, never their values.
 */
import { GatewayConfig } from '@erxes/core-contract';
import { config } from '~/config';
import { inOrder } from '~/lib/sequence';
import { seal } from '~/lib/secrets';
import { insert, readAll, type Run, unit } from './run';
import { createdOf, field, readOr, record, text, when } from './values';
import { z } from 'zod';

type Settings = Record<string, unknown>;

const AnySettings = z.record(z.string(), z.unknown());

const OldGateway = record({
  name: text,
  kind: text,
  status: text,
  config: field((value): Settings => AnySettings.safeParse(value).data ?? {}),
  createdAt: when,
  updatedAt: when,
});

type OldGateway = NonNullable<ReturnType<typeof OldGateway.parse>>;

/** Text settings as core's form takes them: numbers as text, blanks left out. */
const given = (value: unknown) =>
  typeof value === 'number'
    ? String(value)
    : typeof value === 'string' && value.trim()
      ? value
      : undefined;

/** Old settings names → core's, per kind old erxes had in use. */
const TO_CORE: Record<string, (settings: Settings) => Settings> = {
  qpay: (settings) => ({
    kind: 'qpay',
    clientId: given(settings.qpayMerchantUser),
    clientSecret: given(settings.qpayMerchantPassword),
    invoiceCode: given(settings.qpayInvoiceCode),
  }),
  monpay: (settings) => ({
    kind: 'monpay',
    username: given(settings.username),
    accountId: given(settings.accountId),
  }),
  storepay: (settings) => ({
    kind: 'storepay',
    storeId: given(settings.storeId),
    username: given(settings.merchantUsername),
    password: given(settings.merchantPassword),
    appUsername: given(settings.appUsername),
    appPassword: given(settings.appPassword),
  }),
  pocket: (settings) => ({
    kind: 'pocket',
    terminalId: given(settings.pocketTerminalId),
    clientId: given(settings.pocketClientId),
    clientSecret: given(settings.pocketClientSecret),
  }),
  // The publishable key was for old erxes's own payment page; core needs only the secret one.
  stripe: (settings) => ({ kind: 'stripe', secretKey: given(settings.secretKey) }),
};

const NO_GATEWAY: Record<string, string> = {
  qpayQuickqr:
    'QPay quick QR: core has no gateway for merchants QPay onboarded through erxes (erxes/erxes#10853)',
};

/** Core's settings for an old gateway, or why it has none. */
export const gatewayConfigOf = (
  kind: string | null,
  settings: Settings,
): { config: GatewayConfig } | { skip: string } => {
  const toCore = TO_CORE[kind ?? ''];

  if (!toCore) return { skip: NO_GATEWAY[kind ?? ''] ?? `no core gateway for ${kind ?? '(none)'}` };

  const parsed = GatewayConfig.safeParse(toCore(settings));

  if (parsed.success) return { config: parsed.data };

  const fields = [...new Set(parsed.error.issues.map((issue) => issue.path.join('.')))];

  return {
    skip: `${kind} settings core can't use: ${fields.toSorted().join(', ')} missing or invalid`,
  };
};

/**
 * Seals with core's key. Without `CORE_ENCRYPTION_KEY` core would fall back to its JWT secret,
 * which the API on the server doesn't use for this, so the import refuses to guess.
 */
export const sealed = (plain: string) => {
  if (!config.auth.encryptionKey) {
    throw new Error(
      'CORE_ENCRYPTION_KEY(_FILE) must be the API server key to import gateways and webhooks',
    );
  }

  return seal(plain);
};

const SOURCES: { collection: string; turnedOff: boolean }[] = [
  { collection: 'payment_methods', turnedOff: false },
  { collection: 'payments', turnedOff: true },
];

const rowOf = (gateway: OldGateway, settings: GatewayConfig, turnedOff: boolean) => {
  const at = createdOf(gateway.id, gateway.createdAt, gateway.updatedAt);

  return [
    gateway.id,
    settings.kind,
    gateway.name ?? settings.kind,
    sealed(JSON.stringify(settings)),
    !turnedOff && gateway.status === 'active' ? 'active' : 'disabled',
    at,
    gateway.updatedAt ?? at,
  ];
};

/** Collections the step reads that hold nothing core keeps, with why. */
const NOT_GATEWAYS: [string, string][] = [
  [
    'golomt_bank_configs',
    "Golomt corporate bank API (account statements), not a card gateway: core's Golomt gateway takes a checksum key and token",
  ],
  ['payment_configs', 'which gateways a messenger offered: plugin:frontline'],
];

/** Every old gateway core has a kind for. */
export const importGateways = async (run: Run) => {
  await inOrder(SOURCES, async ({ collection, turnedOff }) => {
    const gateways = (await readAll(run, collection)).flatMap(
      (raw) => readOr(OldGateway, raw) ?? [],
    );

    run.report.of(collection, 'core_payment_gateways');
    run.report.seen(collection, gateways.length);

    const kept = gateways.flatMap((gateway) => {
      const placed = gatewayConfigOf(gateway.kind, gateway.config);

      if ('skip' in placed) {
        run.report.skip(collection, placed.skip, gateway.id);

        return [];
      }

      return [{ gateway, settings: placed.config }];
    });

    if (turnedOff && kept.length) {
      run.report.note(
        collection,
        'older list, replaced by payment_methods: turned off',
        '',
        kept.length,
      );
    }

    await unit(run, () =>
      insert(run, {
        collection,
        table: 'core_payment_gateways',
        columns: ['id', 'kind', 'name', 'config_sealed', 'status', 'created_at', 'updated_at'],
        rows: kept.map(({ gateway, settings }) => rowOf(gateway, settings, turnedOff)),
        keys: kept.map(({ gateway }) => gateway.id),
      }),
    );
  });

  await inOrder(NOT_GATEWAYS, async ([collection, reason]) => {
    run.report.leftOut(
      collection,
      '(left out)',
      await run.mongo.collection(collection).countDocuments(),
      reason,
    );
  });
};
