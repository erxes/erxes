import { IconPlus } from '@tabler/icons-react';
import { Button, Form, Select, Table } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { LoyaltyScoreFormValues } from '../../../constants/formSchema';
import { EARN_ROW_KINDS } from '../../../types/earnTable';
import { useEarnTableEditor } from '../../hooks/useEarnTableEditor';
import { SortableRows } from '../../../../../components/SortableRows';
import { CreateTierAutomationButton } from './CreateTierAutomationButton';
import { EarnPreview } from './EarnPreview';
import { EarnRowEditor } from './EarnRowEditor';

export const EarnTableEditor = ({
  form,
}: {
  form: UseFormReturn<LoyaltyScoreFormValues>;
}) => {
  const { t } = useTranslation('loyalty');
  const {
    tiers,
    currencyRatio,
    byTier,
    hasCap,
    rows,
    addRow,
    removeRow,
    moveRow,
  } = useEarnTableEditor(form);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        {t('earn-table-hint', {
          ratio: Number(currencyRatio).toLocaleString(),
        })}
      </p>
      <div className="grid grid-cols-2 gap-4">
        <Form.Field
          control={form.control}
          name="add.table.amountSource"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('earn-amount-source')}</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  <Select.Item value="paid">
                    {t('earn-amount-paid')}
                  </Select.Item>
                  <Select.Item value="total">
                    {t('earn-amount-total')}
                  </Select.Item>
                </Select.Content>
              </Select>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="add.table.rounding"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('earn-rounding')}</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  {['floor', 'round', 'none'].map((value) => (
                    <Select.Item key={value} value={value}>
                      {t(`earn-rounding-${value}`)}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </Form.Item>
          )}
        />
      </div>
      <CreateTierAutomationButton form={form} />
      <div className="overflow-x-auto rounded-md border">
        <Table className="[&_tr>*:last-child]:border-r-0">
          <Table.Header>
            <Table.Row>
              <Table.Head className="w-8 border-r" />
              <Table.Head className="w-9 border-r" />
              <Table.Head>{t('name')}</Table.Head>
              <Table.Head>{t('earn-kind')}</Table.Head>
              <Table.Head>{t('earn-value-type')}</Table.Head>
              <Table.Head>{t('earn-conditions')}</Table.Head>
              <Table.Head>{t('earn-scope')}</Table.Head>
              {byTier ? (
                <>
                  <Table.Head>{t('earn-no-tier')}</Table.Head>
                  {tiers.map(({ key, name }) => (
                    <Table.Head key={key}>{name}</Table.Head>
                  ))}
                </>
              ) : (
                <Table.Head>{t('earn-value')}</Table.Head>
              )}
              {hasCap && <Table.Head>{t('earn-cap')}</Table.Head>}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <SortableRows ids={rows.map(({ id }) => id)} onMove={moveRow}>
              {rows.map((row, index) => (
                <EarnRowEditor
                  key={row.id}
                  id={row.id}
                  form={form}
                  index={index}
                  tiers={tiers}
                  byTier={byTier}
                  hasCap={hasCap}
                  onRemove={() => removeRow(index)}
                />
              ))}
            </SortableRows>
          </Table.Body>
        </Table>
        {!rows.length && (
          <p className="p-4 text-center text-sm text-muted-foreground">
            {t('earn-no-rows')}
          </p>
        )}
      </div>
      <EarnPreview form={form} />
      <div className="flex gap-2">
        {EARN_ROW_KINDS.map((kind) => (
          <Button
            key={kind}
            type="button"
            variant="secondary"
            onClick={() => addRow(kind)}
          >
            <IconPlus />
            {t(`earn-add-${kind}`)}
          </Button>
        ))}
      </div>
    </div>
  );
};
