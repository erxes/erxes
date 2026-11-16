import { gatewayTakes, PAYMENT_GATEWAYS, type PaymentGatewayKind } from '@erxes/core-contract';
import { IconChevronRight, IconWorld } from '@tabler/icons-react';
import { Badge } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { countryNames } from '~/lib/region';
import { useSession } from '~/modules/auth/session';
import {
  GATEWAY_NAMES,
  GATEWAY_PAYS,
  type GatewaySection,
  gatewaySections,
} from './gatewayCatalog';

/** What the gateway takes and refunds, under its name. */
export const GatewayFacts = ({
  kind,
  currency,
}: {
  kind: PaymentGatewayKind;
  currency: string;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const { currencies, refunds } = PAYMENT_GATEWAYS[kind];
  const takes = gatewayTakes(kind, currency);

  const listed =
    currencies.length > 3
      ? t('many-currencies', '{{count}} currencies', { count: currencies.length })
      : currencies.join(', ');

  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {takes ? (
        <Badge variant="secondary">
          {currencies.length ? listed : t('takes-any', 'Any currency')}
        </Badge>
      ) : (
        <Badge variant="warning">
          {t('takes-only', 'Takes {{currencies}} only', { currencies: listed })}
        </Badge>
      )}
      {refunds !== 'none' && (
        <Badge variant="secondary">
          {refunds === 'partial'
            ? t('refunds-partial', 'Refunds')
            : t('refunds-full', 'Full refunds')}
        </Badge>
      )}
    </span>
  );
};

const GatewayCard = ({
  kind,
  currency,
  onPick,
}: {
  kind: PaymentGatewayKind;
  currency: string;
  onPick: (kind: PaymentGatewayKind) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const takes = gatewayTakes(kind, currency);

  return (
    <li>
      <button
        type="button"
        className="group flex h-full w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-primary"
        onClick={() => onPick(kind)}
      >
        <span className="min-w-0 flex-1 space-y-1.5">
          <span className={takes ? 'block font-medium' : 'block font-medium text-muted-foreground'}>
            {kind === 'test' ? t('test-gateway', 'Test (development)') : GATEWAY_NAMES[kind]}
          </span>
          <span className="block text-xs text-muted-foreground">
            {t(`pays-${GATEWAY_PAYS[kind]}`)}
          </span>
          <GatewayFacts kind={kind} currency={currency} />
        </span>
        <IconChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
      </button>
    </li>
  );
};

const SectionTitle = ({ region }: { region: string }) => {
  const { t, i18n } = useTranslation('settings', { keyPrefix: 'payments' });

  if (region === 'global')
    return (
      <span className="flex items-center gap-1.5">
        <IconWorld className="size-4" />
        {t('region-global', 'Global')}
      </span>
    );

  if (region === 'development') return t('region-development', 'Development');

  return countryNames([region], i18n.language);
};

/** Every gateway core connects, in sections by where it works, the organisation's country first. */
export const GatewayPicker = ({ onPick }: { onPick: (kind: PaymentGatewayKind) => void }) => {
  const { country, currency } = useSession().organization;

  return (
    <div className="space-y-5">
      {gatewaySections(country, currency).map(({ region, kinds }: GatewaySection) => (
        <section key={region} className="space-y-2" aria-labelledby={`gateways-${region}`}>
          <h3
            id={`gateways-${region}`}
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            <SectionTitle region={region} />
          </h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {kinds.map((kind) => (
              <GatewayCard key={kind} kind={kind} currency={currency} onPick={onPick} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};
