import { type EbarimtTaxRule, EbarimtTaxType } from '@erxes/core-contract';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Input, Label, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CategoryPicker } from '~/modules/products/categories/CategoryPicker';

/** A rule as the form edits it: `key` keeps its row while rules are added and removed. */
export type DraftRule = EbarimtTaxRule & { key: string };

type Rule = DraftRule;

export const draftRule = (rule: EbarimtTaxRule): DraftRule => ({
  ...rule,
  key: crypto.randomUUID(),
});

const TAX_LABELS: Record<Rule['taxType'], string> = {
  VAT_ABLE: 'With VAT',
  VAT_FREE: 'VAT-free',
  VAT_ZERO: '0% VAT',
  NOT_SEND: 'Left off the receipt',
};

const RuleRow = ({
  rule,
  onChange,
  onRemove,
}: {
  rule: Rule;
  onChange: (rule: Rule) => void;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt' });
  const [categoryId = null] = rule.categoryIds;

  return (
    <li className="flex items-center gap-2">
      <CategoryPicker
        value={categoryId}
        onChange={(id) => onChange({ ...rule, categoryIds: id ? [id] : [] })}
        noneLabel={t('rule-category', 'Pick a category')}
        className="min-w-0 flex-1"
      />
      <Select
        value={rule.taxType}
        onValueChange={(next) => {
          const taxType = EbarimtTaxType.options.find((option) => option === next);

          if (taxType) onChange({ ...rule, taxType });
        }}
      >
        <Select.Trigger aria-label={t('rule-tax-type', 'Tax')} className="w-36">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {EbarimtTaxType.options.map((taxType) => (
            <Select.Item key={taxType} value={taxType}>
              {t(`tax-type.${taxType}`, TAX_LABELS[taxType])}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
      <Input
        className="w-24"
        aria-label={t('rule-tax-code', 'Tax code')}
        placeholder={t('rule-tax-code', 'Tax code')}
        value={rule.taxCode ?? ''}
        onChange={(event) => onChange({ ...rule, taxCode: event.target.value || null })}
      />
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('rule-remove', 'Remove rule')}
        onClick={onRemove}
      >
        <IconTrash />
      </Button>
    </li>
  );
};

/** Categories whose products are taxed otherwise than with VAT, with the tax office's code. */
export const EbarimtRules = ({
  rules,
  onChange,
}: {
  rules: Rule[];
  onChange: (rules: Rule[]) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt' });

  return (
    <div className="space-y-2">
      <Label>{t('rules', 'Tax by product category')}</Label>
      <p className="text-xs text-muted-foreground">
        {t(
          'rules-help',
          'Products in these categories (and those under them) are taxed this way; the rest carry VAT.',
        )}
      </p>
      {rules.length > 0 && (
        <ul className="space-y-2">
          {rules.map((rule) => (
            <RuleRow
              key={rule.key}
              rule={rule}
              onChange={(next) =>
                onChange(rules.map((item) => (item.key === rule.key ? next : item)))
              }
              onRemove={() => onChange(rules.filter((item) => item.key !== rule.key))}
            />
          ))}
        </ul>
      )}
      <Button
        variant="secondary"
        size="sm"
        onClick={() =>
          onChange([
            ...rules,
            draftRule({ productIds: [], categoryIds: [], taxType: 'VAT_FREE', taxCode: null }),
          ])
        }
      >
        <IconPlus />
        {t('rule-add', 'Add a rule')}
      </Button>
    </div>
  );
};
