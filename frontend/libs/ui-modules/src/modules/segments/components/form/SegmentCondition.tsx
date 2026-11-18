import { IconInfoCircle, IconTrash } from '@tabler/icons-react';
import { Button, cn, Combobox, Command, Form, Popover, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSegmentConditionView } from '../../hooks/useSegmentConditionView';
import { TNodePath, TSegmentNode } from '../../types';
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
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });
  const {
    unavailable,
    isReference,
    isRelation,
    isMeasure,
    selectedType,
    selectedField,
    operator,
    comparisonPath,
    selectField,
    loading,
    stepped,
    fieldType,
    hasTypeChoice,
    typeOptions,
    selectedTypeValue,
    selectedTypeLabel,
    selectedFieldLabel,
    propertyGroups,
    operatorName,
    operatorOptions,
    operatorHint,
    hasValue,
    unavailableMessage,
    control,
    onTypeChange,
    changeOperator,
  } = useSegmentConditionView(path, onReplace);

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
            !stepped && (hasTypeChoice ? 'min-w-[604px]' : 'min-w-[436px]'),
            stepped && 'min-w-0',
          )}
        >
          <IconInfoCircle className="size-4 shrink-0 text-muted-foreground" />
          {unavailableMessage}
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
        {hasTypeChoice && (
          <div className="w-[160px] shrink-0">
            <Select value={selectedTypeValue} onValueChange={onTypeChange}>
              <Select.Trigger className="w-full">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {typeOptions.map((option) => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
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
                  label={selectedTypeLabel}
                />
              )}
              <Popover>
                <Combobox.Trigger disabled={loading} className="w-full">
                  <Combobox.Value
                    placeholder={t('select-property')}
                    value={selectedFieldLabel}
                  />
                </Combobox.Trigger>
                <Combobox.Content>
                  <Command>
                    <Command.Input placeholder={t('search-properties')} />
                    <Command.List className="max-h-64">
                      <Command.Empty>{t('no-property-found')}</Command.Empty>
                      {propertyGroups.map((group) => (
                        <Command.Group
                          key={group.key}
                          heading={t(`property-group.${group.key}`)}
                        >
                          {group.options.map(({ option, label }) => (
                            <Command.Item
                              key={option.key}
                              value={label}
                              onSelect={() => selectField(option)}
                            >
                              {label}
                            </Command.Item>
                          ))}
                        </Command.Group>
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
                control={control}
                name={operatorName}
                render={({ field, fieldState }) => (
                  <FieldWithError error={fieldState.error}>
                    <Select
                      value={typeof field.value === 'string' ? field.value : ''}
                      disabled={!selectedField}
                      onValueChange={changeOperator(field.onChange)}
                    >
                      <Select.Trigger className="w-full">
                        <Select.Value placeholder={t('select-condition')} />
                      </Select.Trigger>
                      <Select.Content>
                        {operatorOptions.map((option) => (
                          <Select.Item key={option.value} value={option.value}>
                            {option.label}
                          </Select.Item>
                        ))}
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

      {operatorHint && (
        <p
          className={cn(
            'flex items-start gap-1.5 pt-1 text-xs text-muted-foreground',
            stepped ? 'pl-1' : 'pl-[168px]',
          )}
        >
          <IconInfoCircle className="size-3.5 shrink-0 mt-px" />
          {operatorHint}
        </p>
      )}
    </div>
  );
};
