import { Form, Table } from 'erxes-ui';
import { get, UseFormReturn, useFormState, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSortableRow } from '../../../../../components/SortableRows';
import { ILoyaltyTier } from '../../../../account-type/types';
import { LoyaltyScoreFormValues } from '../../../constants/formSchema';
import {
  EARN_ALL_TIERS,
  EARN_NO_TIER,
  EARN_ROW_KINDS,
  EARN_SCOPES,
  EARN_VALUE_TYPES,
  earnValueTypeFor,
} from '../../../types/earnTable';
import { EarnRowActions } from './EarnRowActions';
import { EarnRowConditions } from './EarnRowConditions';
import { InlineInputCell } from './InlineInputCell';
import { InlineSelectCell } from './InlineSelectCell';

// Cells sit edge to edge like a record table; each edits in its own popover.
const CELL = 'p-0 border-r';

type TRowPath = `add.table.rows.${number}`;

// An empty cell means that group earns nothing from the row.
const EarnValueCell = ({
  form,
  name,
  suffix,
  invalid,
}: {
  form: UseFormReturn<LoyaltyScoreFormValues>;
  name: `${TRowPath}.values.${string}` | `${TRowPath}.cap`;
  suffix?: string;
  invalid?: boolean;
}) => (
  <Form.Field
    control={form.control}
    name={name}
    render={({ field }) => (
      <InlineInputCell
        type="number"
        value={field.value ?? ''}
        onChange={field.onChange}
        suffix={suffix}
        invalid={invalid}
      />
    )}
  />
);

export const EarnRowEditor = ({
  id,
  form,
  index,
  tiers,
  byTier,
  hasCap,
  onRemove,
}: {
  id: string;
  form: UseFormReturn<LoyaltyScoreFormValues>;
  index: number;
  tiers: ILoyaltyTier[];
  // Whether the table shows tier columns at all.
  byTier: boolean;
  // Shown when any row can take a cap.
  hasCap: boolean;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('loyalty');
  const { setNodeRef, style, handle } = useSortableRow(id);
  const path: TRowPath = `add.table.rows.${index}`;
  const [kind, valueType, scope] = useWatch({
    control: form.control,
    name: [`${path}.kind`, `${path}.valueType`, `${path}.scope`],
  });
  const { errors } = useFormState({ control: form.control, name: path });
  const valuesInvalid = !!get(errors, `${path}.values`);
  const suffix =
    valueType === 'multiplier'
      ? '×'
      : valueType === 'fixed'
      ? t('earn-points-suffix')
      : '%';

  return (
    <Table.Row ref={setNodeRef} style={style}>
      <Table.Cell className="w-8 p-0 px-1 border-r">{handle}</Table.Cell>
      {/* Row menu leads the row, as the more column does in record tables */}
      <Table.Cell className="w-9 p-0 border-r text-center">
        <EarnRowActions form={form} index={index} onRemove={onRemove} />
      </Table.Cell>
      <Table.Cell className={`${CELL} min-w-40`}>
        <Form.Field
          control={form.control}
          name={`${path}.name`}
          render={({ field, fieldState }) => (
            <InlineInputCell
              value={field.value}
              onChange={field.onChange}
              placeholder={t('earn-row-name-placeholder')}
              invalid={!!fieldState.error}
            />
          )}
        />
      </Table.Cell>
      <Table.Cell className={`${CELL} w-32`}>
        <Form.Field
          control={form.control}
          name={`${path}.kind`}
          render={({ field }) => (
            <InlineSelectCell
              value={field.value}
              onChange={(nextKind) => {
                field.onChange(nextKind);
                // A kind that cannot read the current form falls back to its own.
                form.setValue(
                  `${path}.valueType`,
                  earnValueTypeFor(nextKind, valueType),
                );
              }}
              options={EARN_ROW_KINDS.map((value) => ({
                value,
                label: t(`earn-kind-${value}`),
              }))}
            />
          )}
        />
      </Table.Cell>
      <Table.Cell className={`${CELL} w-32`}>
        <Form.Field
          control={form.control}
          name={`${path}.valueType`}
          render={({ field }) => (
            <InlineSelectCell
              value={field.value}
              onChange={field.onChange}
              options={EARN_VALUE_TYPES[kind].map((value) => ({
                value,
                label: t(
                  value === 'multiplier'
                    ? `earn-value-multiplier-${kind}`
                    : `earn-value-${value}`,
                ),
              }))}
            />
          )}
        />
      </Table.Cell>
      <Table.Cell className={`${CELL} min-w-40`}>
        <EarnRowConditions form={form} index={index} />
      </Table.Cell>
      <Table.Cell className={`${CELL} w-32`}>
        <Form.Field
          control={form.control}
          name={`${path}.scope`}
          render={({ field }) => (
            <InlineSelectCell
              value={field.value}
              onChange={field.onChange}
              options={EARN_SCOPES.map((value) => ({
                value,
                label: t(`earn-scope-${value}`),
              }))}
            />
          )}
        />
      </Table.Cell>
      {scope === 'all' ? (
        <Table.Cell className={CELL} colSpan={byTier ? 1 + tiers.length : 1}>
          <EarnValueCell
            form={form}
            name={`${path}.values.${EARN_ALL_TIERS}`}
            suffix={suffix}
            invalid={valuesInvalid}
          />
        </Table.Cell>
      ) : (
        [EARN_NO_TIER, ...tiers.map(({ key }) => key)].map((tier) => (
          <Table.Cell key={tier} className={`${CELL} w-24`}>
            <EarnValueCell
              form={form}
              name={`${path}.values.${tier}`}
              suffix={suffix}
              invalid={valuesInvalid}
            />
          </Table.Cell>
        ))
      )}
      {hasCap && (
        <Table.Cell className={`${CELL} w-28`}>
          {kind !== 'base' && (
            <EarnValueCell form={form} name={`${path}.cap`} />
          )}
        </Table.Cell>
      )}
    </Table.Row>
  );
};
