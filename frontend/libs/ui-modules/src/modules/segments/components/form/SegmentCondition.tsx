import { IconInfoCircle, IconTrash } from '@tabler/icons-react';
import {
  Button,
  cn,
  Combobox,
  Command,
  Form,
  Popover,
  Select,
  useIsMobile,
} from 'erxes-ui';
import { FieldPath } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSegment } from '../../context/SegmentProvider';
import { useSegmentScope } from '../../context/SegmentScopeProvider';
import {
  SEGMENT_TYPE_KEY,
  useSegmentConditionRow,
} from '../../hooks/useSegmentConditionRow';
import {
  TNodePath,
  TSegmentField,
  TSegmentForm,
  TSegmentNode,
  TSegmentOperator,
} from '../../types';
import { useSegmentLabels } from '../../hooks/useSegmentLabels';
import { FieldWithError } from '../FieldWithError';
import { SegmentConditionValue } from './SegmentConditionValue';
import { SegmentReferenceValue } from './SegmentReferenceValue';
import { SegmentRelationFilters } from './SegmentRelationFilters';

export const SegmentCondition = ({
  path,
  onRemove,
  onReplace,
}: {
  path: TNodePath;
  onRemove: () => void;
  onReplace: (next: TSegmentNode) => void;
}) => {
  const { form, stats } = useSegment();
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });
  const {
    unavailable,
    isReference,
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
  } = useSegmentConditionRow(path, onReplace);
  const { fieldLabel, operatorLabel, operatorHint, typeLabel } =
    useSegmentLabels();
  const stepped = useIsMobile();

  const fieldType = selectedType?.contentType;

  const operatorName = `${comparisonPath}.operator` as FieldPath<TSegmentForm>;

  const hasValue = Boolean(
    selectedField && operator && operator.input !== 'none',
  );

  const removeButton = (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      title={t('remove-condition')}
      onClick={onRemove}
      className={cn(
        'shrink-0 text-destructive',
        !stepped && 'opacity-0 group-hover/row:opacity-100 transition-opacity',
      )}
    >
      <IconTrash />
    </Button>
  );

  if (unavailable) {
    return (
      <div className="flex flex-row items-center gap-2 py-1 group/row">
        <p
          className={cn(
            'flex flex-auto items-center gap-2 rounded-md',
            'border border-dashed bg-muted px-3 py-1.5 text-sm',
            !stepped &&
              (propertyTypes.length > 1 ? 'min-w-[564px]' : 'min-w-[436px]'),
            stepped && 'min-w-0',
          )}
        >
          <IconInfoCircle className="size-4 shrink-0 text-muted-foreground" />
          {unavailable.pluginName
            ? t('plugin-disabled', { plugin: unavailable.pluginName })
            : t('condition-unavailable')}
        </p>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          title={t('remove-condition')}
          onClick={onRemove}
          className="shrink-0 text-destructive"
        >
          <IconTrash />
        </Button>
      </div>
    );
  }

  return (
    <div className="py-1 group/row">
      <div
        className={cn(
          'flex items-start gap-2',
          stepped ? 'flex-row flex-wrap' : 'flex-row',
        )}
      >
        {propertyTypes.length > 1 && (
          <div className="w-[120px] shrink-0">
            <Select
              value={
                selectedType?.relationKey || selectedType?.contentType || ''
              }
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
                    {option.contentType === SEGMENT_TYPE_KEY
                      ? t('segment-membership')
                      : typeLabel(option)}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        )}

        {isReference && <SegmentReferenceValue path={path} />}

        {!isReference && (
          <>
            <div
              className={cn(
                'flex gap-1.5',
                stepped ? 'flex-1 basis-40 min-w-0' : 'flex-1 min-w-[150px]',
              )}
            >
              {isRelation && isMeasure && selectedType && (
                <SegmentRelationFilters
                  path={path}
                  relatedType={selectedType.contentType}
                  label={typeLabel(selectedType)}
                />
              )}
              <Popover>
                <Combobox.Trigger disabled={loading} className="w-full">
                  <Combobox.Value
                    placeholder={t('select-property')}
                    value={
                      selectedField && fieldLabel(fieldType, selectedField)
                    }
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
                          value={fieldLabel(fieldType, option)}
                          onSelect={() => selectField(option)}
                        >
                          {fieldLabel(fieldType, option)}
                        </Command.Item>
                      ))}
                    </Command.List>
                  </Command>
                </Combobox.Content>
              </Popover>
            </div>

            <div
              className={cn(
                stepped ? 'flex-1 basis-32 min-w-0' : 'w-[150px] shrink-0',
              )}
            >
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
                        stats.countSettled();
                      }}
                    >
                      <Select.Trigger className="w-full">
                        <Select.Value placeholder={t('select-condition')} />
                      </Select.Trigger>
                      <Select.Content>
                        {(selectedField?.operators || []).map(
                          (option: TSegmentOperator) => (
                            <Select.Item
                              key={option.value}
                              value={option.value}
                            >
                              {operatorLabel(option)}
                            </Select.Item>
                          ),
                        )}
                      </Select.Content>
                    </Select>
                  </FieldWithError>
                )}
              />
            </div>

            {/* Stepped, the remove button rides the end of the value line -
                on a line of its own it reads as removing the group. */}
            <div
              className={cn(
                'flex items-start gap-2',
                !stepped && 'flex-1 min-w-[120px]',
                stepped && (hasValue ? 'basis-full min-w-0' : 'hidden'),
              )}
            >
              <div className="flex-1 min-w-0">
                <SegmentConditionValue
                  path={comparisonPath}
                  field={selectedField}
                  fieldType={fieldType}
                  operator={operator}
                />
              </div>
              {stepped && hasValue && removeButton}
            </div>
          </>
        )}

        {(!stepped || !hasValue) && removeButton}
      </div>

      {operatorHint(operator) && (
        <p
          className={cn(
            'flex items-start gap-1.5 pt-1 text-xs text-muted-foreground',
            stepped ? 'pl-1' : 'pl-[128px]',
          )}
        >
          <IconInfoCircle className="size-3.5 shrink-0 mt-px" />
          {operatorHint(operator)}
        </p>
      )}
    </div>
  );
};
