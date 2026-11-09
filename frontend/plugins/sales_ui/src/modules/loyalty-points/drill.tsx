import { Badge, Sheet } from 'erxes-ui';
import { createContext, ReactNode, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TTimelineInterval } from './summary';

export type TLoyaltyDrillKind =
  | 'earned'
  | 'spent'
  | 'refunded'
  | 'recalculated'
  | 'other';

/**
 * One of a page's sums opened to the entries behind it. Each source maps
 * the record fields (group, person, branch, record) to its own filters;
 * the kind and period are loyalty's to match.
 */
export type TLoyaltyDrill = {
  label: ReactNode;
  kind?: TLoyaltyDrillKind;
  period?: { interval: TTimelineInterval; key: string };
  groupId?: string;
  customerId?: string;
  personId?: string;
  branchId?: string;
  recordId?: string;
};

type TLoyaltyDrillContext = {
  drill: TLoyaltyDrill | null;
  open: (drill: TLoyaltyDrill) => void;
  close: () => void;
};

const LoyaltyDrillContext = createContext<TLoyaltyDrillContext | null>(null);

export const LoyaltyDrillProvider = ({ children }: { children: ReactNode }) => {
  const [drill, setDrill] = useState<TLoyaltyDrill | null>(null);

  return (
    <LoyaltyDrillContext.Provider
      value={{ drill, open: setDrill, close: () => setDrill(null) }}
    >
      {children}
    </LoyaltyDrillContext.Provider>
  );
};

/** The page's drill, or null where a list is shown without one. */
export const useLoyaltyDrill = () => useContext(LoyaltyDrillContext);

// The period as the movement queries take it: in the viewer's zone, as the
// timeline cut it.
export const drillPeriod = (drill?: TLoyaltyDrill | null) =>
  drill?.period
    ? {
        ...drill.period,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }
    : undefined;

/** The movements behind the opened sum; the source's own list inside. */
export const LoyaltyDrillSheet = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation('sales');
  const context = useLoyaltyDrill();
  const drill = context?.drill;

  return (
    <Sheet open={!!drill} onOpenChange={(open) => !open && context?.close()}>
      {/* From the bottom, so the figure that opened it stays in sight. */}
      <Sheet.View
        side="bottom"
        className="mx-2 mb-2 flex h-[75dvh] flex-col overflow-hidden p-0"
      >
        <Sheet.Header className="flex-row items-center gap-2 border-b px-4 py-3">
          <Sheet.Title>{t('loyalty-tab-movements', 'Movements')}</Sheet.Title>
          {drill?.label && (
            <Badge variant="secondary" className="max-w-xs truncate">
              {drill.label}
            </Badge>
          )}
          <Sheet.Description className="sr-only">
            {t(
              'loyalty-drill-description',
              'The loyalty entries behind the chosen figure',
            )}
          </Sheet.Description>
          <Sheet.Close />
        </Sheet.Header>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </Sheet.View>
    </Sheet>
  );
};
