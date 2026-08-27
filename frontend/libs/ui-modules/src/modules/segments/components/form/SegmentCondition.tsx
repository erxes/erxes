import { IconTrash } from '@tabler/icons-react';
import { Button, Combobox, Command, Form, Popover, Select } from 'erxes-ui';
import { FieldPath } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSegment } from '../../context/SegmentProvider';
import { useSegmentConditionRow } from '../../hooks/useSegmentConditionRow';
import {
  TNodePath,
  TSegmentField,
  TSegmentForm,
  TSegmentNode,
  TSegmentOperator,
} from '../../types';
import { FieldWithError } from '../FieldWithError';
import { SegmentConditionValue } from './SegmentConditionValue';
import { SegmentRelationFilters } from './SegmentRelationFilters';

/**
 * One condition: which entity, which field or measure of it, how to compare,
 * and to what.
 *
 * The column widths are fixed rather than proportional so a condition inside a
 * nested group has controls the same size as one at the top - only its left
 * edge moves.
 */
export const SegmentCondition = ({
  path,
  onRemove,
  contextType,
  onReplace,
}: {
  path: TNodePath;
  onRemove: () => void;
  contextType?: string;
  /** Replaces the whole row through its field array, so nothing stale is kept. */
  onReplace: (next: TSegmentNode) => void;
}) => {
  const { form } = useSegment();
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });
  const {
    isRelation,
    isMeasure,
    propertyTypes,
    selectedType,
    options,
    selectedField,
    operator,
    comparisonPath,
    selectType,
    selectField,
    loading,
  } = useSegmentConditionRow(path, contextType, onReplace);

  const operatorName = `${comparisonPath}.operator` as FieldPath<TSegmentForm>;

  return (
    <div className="flex flex-row items-start gap-2 py-1 group/row">
      <div className="w-[120px] shrink-0">
        <Select
          value={selectedType?.relationKey || selectedType?.contentType || ''}
          onValueChange={(next) => {
            const type = propertyTypes.find(
              (candidate) =>
                (candidate.relationKey || candidate.contentType) === next,
            );

            if (type) {
              selectType(type);
            }
          }}
        >
          <Select.Trigger className="w-full">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {propertyTypes.map((option) => (
              <Select.Item
                key={option.relationKey || option.contentType}
                value={option.relationKey || option.contentType}
              >
                {option.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>

      {/* One cell, so the field select fills it whole unless a measured
          relation needs to share it with its filter button. */}
      <div className="flex-1 min-w-[150px] flex gap-1.5">
        {isRelation && isMeasure && selectedType && (
          <SegmentRelationFilters
            path={path}
            relatedType={selectedType.contentType}
            label={selectedType.label}
          />
        )}
        <Popover>
          <Combobox.Trigger disabled={loading} className="w-full">
            <Combobox.Value
              placeholder={t('select-property')}
              value={selectedField?.label}
            />
          </Combobox.Trigger>
          <Combobox.Content>
            <Command>
              <Command.Input placeholder={t('search-properties')} />
              <Command.List className="max-h-64">
                <Command.Empty>{t('no-property-found')}</Command.Empty>
                {options.map((option: TSegmentField) => (
                  <Command.Item
                    key={option.key}
                    value={option.label}
                    onSelect={() => selectField(option)}
                  >
                    {option.label}
                  </Command.Item>
                ))}
              </Command.List>
            </Command>
          </Combobox.Content>
        </Popover>
      </div>

      <div className="w-[150px] shrink-0">
        <Form.Field
          control={form.control}
          name={operatorName}
          render={({ field, fieldState }) => (
            <FieldWithError error={fieldState.error}>
              <Select
                value={typeof field.value === 'string' ? field.value : ''}
                disabled={!selectedField}
                onValueChange={(next) => {
                  field.onChange(next);
                  form.setValue(
                    `${comparisonPath}.value` as FieldPath<TSegmentForm>,
                    undefined,
                  );
                }}
              >
                <Select.Trigger className="w-full">
                  <Select.Value placeholder={t('select-condition')} />
                </Select.Trigger>
                <Select.Content>
                  {/* Only what this field accepts - never a merged list. */}
                  {(selectedField?.operators || []).map(
                    (option: TSegmentOperator) => (
                      <Select.Item key={option.value} value={option.value}>
                        {option.label}
                      </Select.Item>
                    ),
                  )}
                </Select.Content>
              </Select>
            </FieldWithError>
          )}
        />
      </div>

      <div className="flex-1 min-w-[120px]">
        <SegmentConditionValue
          path={comparisonPath}
          field={selectedField}
          operator={operator}
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        type="button"
        title={t('remove-condition')}
        onClick={onRemove}
        className="shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity text-destructive"
      >
        <IconTrash />
      </Button>
    </div>
  );
};
