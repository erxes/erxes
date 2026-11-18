import { Form } from 'erxes-ui';
import {
  ReportForm,
  TextSetting,
  TextareaSetting,
  ChoiceSetting,
  CheckSetting,
  PeriodSettings,
  Choice,
} from '@/tunable-reports/fields';
import { useReportTranslation } from '@/tunable-reports/locales';
import { notifyMutationResult } from '@/utils/graphqlMutation';

type SectionFieldsProps = { form: ReportForm; index: number };

export const ReportSectionFields = ({ form, index }: SectionFieldsProps) => {
  const { t } = useReportTranslation();
  const path = `sections.${index}` as const;
  return (
    <div className="space-y-4 p-4">
      <TextSetting form={form} name={`${path}.name`} label={t('name')} />
      <FormScope form={form} index={index} />
      <CheckSetting
        form={form}
        name={`${path}.isActive`}
        label={t('enabled')}
      />
      <TextareaSetting
        form={form}
        name={`${path}.header`}
        label={t('header')}
      />
      <TextareaSetting
        form={form}
        name={`${path}.footer`}
        label={t('footer')}
      />
    </div>
  );
};

export const ReportRowFields = ({
  form,
  index,
  rowIndex,
}: SectionFieldsProps & { rowIndex: number }) => {
  const { t } = useReportTranslation();
  const path = `sections.${index}` as const;
  return (
    <div className="space-y-4 p-4">
      <TextSetting
        form={form}
        name={`${path}.rows.${rowIndex}.number`}
        label={t('number')}
      />
      <TextSetting
        form={form}
        name={`${path}.rows.${rowIndex}.name`}
        label={t('name')}
      />
      <ChoiceSetting
        form={form}
        name={`${path}.rows.${rowIndex}.kind`}
        label={t('kind')}
        options={[
          { value: 'formula', label: t('formulaRow') },
          { value: 'plus_formula', label: t('positiveRow') },
          { value: 'title', label: t('titleRow') },
          { value: 'date', label: t('dateRow') },
        ]}
      />
      <PeriodSettings form={form} path={`${path}.rows.${rowIndex}`} />
      <ChoiceSetting
        form={form}
        name={`${path}.rows.${rowIndex}.valueSide`}
        label={t('valueSide')}
        options={['call_value', 'debit', 'credit'].map((value) => ({
          value,
          label: t(value),
        }))}
      />
      <TextSetting
        form={form}
        name={`${path}.rows.${rowIndex}.tabCount`}
        label={t('indent')}
        type="number"
      />
      <div className="flex gap-4">
        {(['isBold', 'isItalic', 'isUnderline'] as const).map((field) => (
          <CheckSetting
            key={field}
            form={form}
            name={`${path}.rows.${rowIndex}.${field}`}
            label={t(
              {
                isBold: 'bold',
                isItalic: 'italic',
                isUnderline: 'underline',
              }[field],
            )}
          />
        ))}
      </div>
      <CheckSetting
        form={form}
        name={`${path}.rows.${rowIndex}.isActive`}
        label={t('enabled')}
      />
    </div>
  );
};

export const ReportColumnFields = ({
  form,
  index,
  columnIndex,
}: SectionFieldsProps & { columnIndex: number }) => {
  const { t } = useReportTranslation();
  const path = `sections.${index}` as const;
  return (
    <div className="space-y-4 p-4">
      <TextSetting
        form={form}
        name={`${path}.columns.${columnIndex}.name`}
        label={t('name')}
      />
      <PeriodSettings form={form} path={`${path}.columns.${columnIndex}`} />
      <CheckSetting
        form={form}
        name={`${path}.columns.${columnIndex}.isActive`}
        label={t('enabled')}
      />
    </div>
  );
};

const FormScope = ({ form, index }: { form: ReportForm; index: number }) => {
  const { t } = useReportTranslation();
  return (
    <Form.Field
      control={form.control}
      name={`sections.${index}.formulaType`}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('formulaType')}</Form.Label>
          <Choice
            label={t('formulaType')}
            value={field.value}
            options={[
              { value: 'row', label: t('rowScope') },
              { value: 'cell', label: t('cellScope') },
            ]}
            onChange={(value) => {
              if (
                value !== field.value &&
                form.getValues(`sections.${index}.formulas`).length
              ) {
                notifyMutationResult(false, t('changeScope'));
                return;
              }
              field.onChange(value);
            }}
          />
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
