import { orpc } from '@erxes/core-contract/client';
import { IconSitemap } from '@tabler/icons-react';
import { useQueries } from '@tanstack/react-query';
import { PanelField } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { UnitMultiPicker } from '~/modules/settings/structure/UnitPicker';

/**
 * The record's units the member reaches. A unit outside their reach answers 404: the record
 * keeps it, and it is counted here, not named.
 */
const useReachedUnits = (unitIds: string[]) =>
  useQueries({
    queries: unitIds.map((id) =>
      orpc.units.get.queryOptions({ input: { id }, staleTime: 60_000, retry: false }),
    ),
    combine: (results) => unitIds.filter((_, index) => !results[index]?.isError),
  });

/**
 * The units a customer or company is in: whoever reaches one of them, or a unit above it, sees
 * the record. A member changes the units they reach; the others stay as they are.
 */
export const ContactUnitsField = ({
  unitIds,
  onChange,
}: {
  unitIds: string[];
  onChange: (unitIds: string[]) => void;
}) => {
  const { t } = useTranslation('contact', { keyPrefix: 'units' });
  const reached = useReachedUnits(unitIds);
  const elsewhere = unitIds.length - reached.length;

  return (
    <PanelField icon={IconSitemap} label={t('label', 'Units')}>
      <UnitMultiPicker
        variant="ghost"
        className="w-full justify-start"
        value={reached}
        // A record is always in a unit: taking out the last one changes nothing.
        onChange={(next) => {
          if (next.length) onChange(next);
        }}
        placeholder={t('choose', 'Choose units')}
      />
      {elsewhere > 0 && (
        <p className="px-2 pb-1 text-xs text-muted-foreground">
          {t('elsewhere', 'And {{count}} more outside your reach', { count: elsewhere })}
        </p>
      )}
    </PanelField>
  );
};
