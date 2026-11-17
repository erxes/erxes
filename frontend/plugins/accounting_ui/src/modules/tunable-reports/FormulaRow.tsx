import { Button, Form, Table } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import {
  ReportForm,
  ChoiceSetting,
  TextSetting,
  Choice,
} from '@/tunable-reports/fields';
import {
  ACCOUNT_FIELDS,
  AccountField,
  FormulaKind,
} from '@/tunable-reports/formulaColumns';
import { FormulaReferenceFields } from '@/tunable-reports/FormulaReferenceFields';
import { useReportTranslation } from '@/tunable-reports/locales';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { SelectAccountCategory } from '@/settings/account/account-categories/components/SelectAccountCategory';

const AccountSetting = ({
  form,
  name,
  label,
  category,
}: {
  form: ReportForm;
  name: `sections.${number}.formulas.${number}.${AccountField}`;
  label: string;
  category: boolean;
}) => {
  const { t } = useReportTranslation();
  return (
    <Form.Field
      control={form.control}
      name={name}
      render={({ field }) => (
        <Form.Item className="space-y-0">
          <Form.Label className="sr-only">{label}</Form.Label>
          <div className="flex min-w-0 items-center">
            {category ? (
              <SelectAccountCategory
                className="h-cell w-full rounded-none border-0 bg-transparent px-2 shadow-none"
                selected={field.value}
                recordId={name}
                nullable
                onSelect={(value) => field.onChange(value || undefined)}
              />
            ) : (
              <SelectAccount.InlineCell
                scope={name}
                value={field.value}
                onValueChange={(value) =>
                  field.onChange(typeof value === 'string' ? value : value[0])
                }
              />
            )}
            {field.value && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`${t('cancel')} · ${label}`}
                onClick={() => field.onChange(undefined)}
              >
                ×
              </Button>
            )}
          </div>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

export const FormulaRow = ({
  form,
  sectionIndex,
  formulaIndex,
  kind,
  reportId,
  onRemove,
}: {
  form: ReportForm;
  sectionIndex: number;
  formulaIndex: number;
  kind: FormulaKind;
  reportId?: string;
  onRemove: () => void;
}) => {
  const { t } = useReportTranslation();
  const path = `sections.${sectionIndex}.formulas.${formulaIndex}` as const;
  const accountFields =
    kind === 'balance' || kind === 'transaction' ? ACCOUNT_FIELDS[kind] : [];
  return (
    <Table.Row className="h-cell hover:bg-background!">
      <Table.Cell className="sticky left-0 z-10">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-destructive"
          aria-label={t('remove')}
          onClick={onRemove}
        >
          <IconTrash />
        </Button>
      </Table.Cell>
      {accountFields.map(({ field, label }) => (
        <Table.Cell key={field}>
          <AccountSetting
            form={form}
            name={`${path}.${field}`}
            label={kind === 'balance' ? t(label, { keyPrefix: '' }) : t(label)}
            category={field.endsWith('CategoryId')}
          />
        </Table.Cell>
      ))}
      {(kind === 'from_row' || kind === 'ratio') && (
        <Table.Cell className="whitespace-normal align-top p-2">
          <FormulaReferenceFields
            form={form}
            sectionIndex={sectionIndex}
            formulaIndex={formulaIndex}
            operand="source"
            reportId={reportId}
          />
        </Table.Cell>
      )}
      {kind === 'ratio' && (
        <>
          <Table.Cell className="whitespace-normal align-top p-2">
            <FormulaReferenceFields
              form={form}
              sectionIndex={sectionIndex}
              formulaIndex={formulaIndex}
              operand="ratioSource"
              reportId={reportId}
            />
          </Table.Cell>
          <Table.Cell>
            <ChoiceSetting
              inline
              form={form}
              name={`${path}.ratioRule`}
              label={t('operation')}
              options={['divide', 'multiply'].map((value) => ({
                value,
                label: t(value),
              }))}
            />
          </Table.Cell>
        </>
      )}
      <Table.Cell>
        <TextSetting
          inline
          form={form}
          inputClassName="h-cell rounded-none"
          name={`${path}.percent`}
          label={t('percent')}
        />
      </Table.Cell>
      <Table.Cell>
        <Form.Field
          control={form.control}
          name={`${path}.plusOrMinus`}
          render={({ field }) => (
            <Form.Item className="space-y-0">
              <Form.Label className="sr-only">{t('operation')}</Form.Label>
              <Choice
                inline
                label={t('operation')}
                value={field.value ? 'add' : 'subtract'}
                onChange={(value) => field.onChange(value === 'add')}
                options={[
                  { value: 'add', label: t('addValue') },
                  { value: 'subtract', label: t('subtractValue') },
                ]}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
      </Table.Cell>
      {kind === 'transaction' && (
        <Table.Cell>
          <ChoiceSetting
            inline
            form={form}
            name={`${path}.valueSide`}
            label={t('valueSide')}
            options={['__inherit', 'debit', 'credit'].map((value) => ({
              value,
              label: t(value === '__inherit' ? 'inherit' : value),
            }))}
          />
        </Table.Cell>
      )}
      <Table.Cell>
        <ChoiceSetting
          inline
          form={form}
          name={`${path}.getDate`}
          label={t('period')}
          options={['__inherit', 'first', 'last', 'between']
            .filter((value) => kind !== 'balance' || value !== 'between')
            .map((value) => ({
              value,
              label: t(value === '__inherit' ? 'inherit' : value),
            }))}
        />
      </Table.Cell>
      <Table.Cell>
        <Form.Field
          control={form.control}
          name={`${path}.isPre`}
          render={({ field }) => (
            <Form.Item className="space-y-0">
              <Form.Label className="sr-only">{t('comparison')}</Form.Label>
              <Choice
                inline
                label={t('comparison')}
                value={
                  field.value === undefined
                    ? '__inherit'
                    : field.value
                    ? 'previous'
                    : 'current'
                }
                onChange={(value) =>
                  field.onChange(
                    value === '__inherit' ? undefined : value === 'previous',
                  )
                }
                options={['__inherit', 'current', 'previous'].map((value) => ({
                  value,
                  label: t(value === '__inherit' ? 'inherit' : value),
                }))}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
      </Table.Cell>
    </Table.Row>
  );
};
