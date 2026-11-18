import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PanelField } from 'ui-modules';
import {
  SettingsPanelSelect,
  SettingsPanelTextField,
} from '@/settings/components/panel/SettingsPanelFields';
import { TaxRowLedgerFormulas } from '@/settings/components/TaxRowLedgerFormulas';
import {
  ITaxRowLedgerFormula,
  ITaxRowReportValues,
  parseTaxRowLedgerFormulas,
  TTaxRowReportChange,
} from '@/settings/types/taxRowReport';

const NO_SIDE = 'none';

/**
 * Tax report settings of a VAT or city tax row: its text formula, and for
 * formula rows the settlement column plus the account formulas that fill it.
 */
export const TaxRowReportPanelFields = ({
  scope,
  row,
  saving,
  onSave,
}: {
  scope: string;
  row: ITaxRowReportValues;
  saving: boolean;
  onSave: (fields: TTaxRowReportChange) => Promise<boolean>;
}) => {
  const { t } = useTranslation('accounting');
  const ledgerFormulas = useMemo(
    () => parseTaxRowLedgerFormulas(row.ledgerFormulas),
    [row.ledgerFormulas],
  );

  if (row.kind === 'title') {
    return null;
  }

  return (
    <>
      <PanelField label={t('formula')}>
        <SettingsPanelTextField
          scope={`${scope}.formula`}
          value={row.formula || ''}
          placeholder="{5} * 10"
          onSave={(formula) => onSave({ formula: formula.trim() })}
        />
      </PanelField>
      <PanelField label={t('formula-text')}>
        <SettingsPanelTextField
          scope={`${scope}.formulaText`}
          value={row.formulaText || ''}
          placeholder="(5+...+9)"
          onSave={(formulaText) => onSave({ formulaText })}
        />
      </PanelField>
      {row.kind === 'formula' && (
        <>
          <PanelField label={t('settlement-column')}>
            <SettingsPanelSelect
              value={row.valueSide || NO_SIDE}
              placeholder={t('settlement-column')}
              options={[
                { value: NO_SIDE, label: t('report-body') },
                { value: 'debit', label: t('debit') },
                { value: 'credit', label: t('credit') },
              ]}
              onValueChange={(side) =>
                onSave({ valueSide: side === NO_SIDE ? '' : side })
              }
            />
          </PanelField>
          <TaxRowLedgerFormulas
            formulas={ledgerFormulas}
            saving={saving}
            onSave={(formulas: ITaxRowLedgerFormula[]) =>
              onSave({ ledgerFormulas: formulas })
            }
          />
        </>
      )}
    </>
  );
};
