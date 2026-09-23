import {
  Label,
  Input,
  Sheet,
  ToggleGroup,
  Button,
  Select,
  Checkbox,
  ScrollArea,
  Tooltip,
  BlockEditor,
  useBlockEditor,
} from 'erxes-ui';
import { IFieldData, useFormDnd } from './FormDndProvider';
import { UniqueIdentifier } from '@dnd-kit/core';
import { IconInfoCircle, IconPlus, IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import {
  FieldValidatorPresetKey,
  FieldValidatorType,
  IFieldValidator,
  IFormFieldLogics,
} from '../types/formTypes';
import {
  LOGIC_STRING_OPERATOR_LABELS,
  LOGIC_NUMBER_OPERATOR_LABELS,
  LOGIC_DATE_OPERATOR_LABELS,
} from '../constants/formLogicLabels';

const NUMBER_TYPES = ['number'];
const DATE_TYPES = ['date'];

const VALIDATOR_PRESET_OPTIONS: {
  value: FieldValidatorPresetKey;
  label: string;
}[] = [
  { value: 'EMAIL', label: 'validator-email-address' },
  { value: 'PHONE', label: 'validator-phone-number' },
  { value: 'POSTAL_CODE', label: 'validator-postal-code' },
  { value: 'ALPHANUMERIC', label: 'validator-alphanumeric' },
  { value: 'MN_VEHICLE_REGISTRATION', label: 'validator-vehicle-plate-mn' },
  { value: 'NUMBER', label: 'validator-numeric-value' },
  { value: 'DATE', label: 'validator-date-value' },
  { value: 'DATE_TIME', label: 'validator-date-time' },
];

const getOperatorOptions = (fieldType?: string) => {
  if (fieldType && NUMBER_TYPES.includes(fieldType)) {
    return Object.entries(LOGIC_NUMBER_OPERATOR_LABELS).map(
      ([value, label]) => ({
        value,
        label,
      }),
    );
  }
  if (fieldType && DATE_TYPES.includes(fieldType)) {
    return Object.entries(LOGIC_DATE_OPERATOR_LABELS).map(([value, label]) => ({
      value,
      label,
    }));
  }
  return Object.entries(LOGIC_STRING_OPERATOR_LABELS).map(([value, label]) => ({
    value,
    label,
  }));
};

export const FormFieldDetail = ({
  fieldData,
  fieldId,
  stepId,
  handleClose,
}: {
  fieldData?: IFieldData;
  fieldId: UniqueIdentifier;
  stepId: UniqueIdentifier;
  handleClose: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const { handleChangeField, handleDeleteField, fields, getFieldValue } =
    useFormDnd();

  const editor = useBlockEditor();

  const [draft, setDraft] = useState<IFieldData | undefined>(fieldData);

  useEffect(() => {
    setDraft(fieldData);
  }, [fieldId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let isActive = true;
    const description = fieldData?.description || '';
    editor.tryParseHTMLToBlocks(description).then((blocks) => {
      if (isActive) {
        editor.replaceBlocks(editor.document, blocks);
      }
    });
    return () => {
      isActive = false;
    };
  }, [fieldId]); // eslint-disable-line react-hooks/exhaustive-deps

  const availableFields = Object.entries(fields)
    .flatMap(([stepId, fieldIds]) =>
      fieldIds.map((fId) =>
        getFieldValue(stepId as UniqueIdentifier, fId as UniqueIdentifier),
      ),
    )
    .filter((f): f is IFieldData => !!f && f.id !== fieldId.toString());

  if (!draft) {
    return null;
  }

  const handleValueChange = (
    key: keyof IFieldData,
    value: string | number | string[] | boolean,
  ) => {
    setDraft((prev) => prev && { ...prev, [key]: value });
  };

  const handleAddLogic = () => {
    setDraft(
      (prev) =>
        prev && {
          ...prev,
          logics: [
            ...(prev.logics ?? []),
            { fieldId: '', logicOperator: '', logicValue: '' },
          ],
        },
    );
  };

  const handleChangeLogic = (
    index: number,
    key: keyof IFormFieldLogics,
    value: string,
  ) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const updatedLogics = (prev.logics ?? []).map((logic, i) =>
        i === index ? { ...logic, [key]: value } : logic,
      );
      return { ...prev, logics: updatedLogics };
    });
  };

  const handleRemoveLogic = (index: number) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const updatedLogics = (prev.logics ?? []).filter((_, i) => i !== index);
      return { ...prev, logics: updatedLogics };
    });
  };

  const handleAddOption = () => {
    setDraft((prev) => prev && { ...prev, options: [...prev.options, ''] });
  };

  const handleChangeOption = (index: number, value: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const updatedOptions = prev.options.map((option, i) =>
        i === index ? value : option,
      );
      return { ...prev, options: updatedOptions };
    });
  };

  const handleRemoveOption = (index: number) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return { ...prev, options: prev.options.filter((_, i) => i !== index) };
    });
  };

  const handleChangeValidator = (patch: Partial<IFieldValidator>) => {
    setDraft(
      (prev) =>
        prev && {
          ...prev,
          validator: { type: 'NONE', ...prev.validator, ...patch },
        },
    );
  };

  const handleDelete = () => {
    handleDeleteField(stepId, fieldId);
    handleClose();
  };

  const serializeDescription = async () => {
    const html = await editor.blocksToHTMLLossy(editor.document);
    const safe = DOMPurify.sanitize(html);
    const stripped = safe.replace(/<[^>]*>/g, '').trim();
    return stripped ? safe : '';
  };

  const handleConfirm = async () => {
    if (!draft) return;
    const description = await serializeDescription();
    handleChangeField(stepId, fieldId, { ...draft, description });
    handleClose();
  };

  return (
    <div className="flex flex-col gap-0 size-full">
      <Sheet.Header>
        <Sheet.Title className="truncate min-w-0">{draft?.label}</Sheet.Title>
        <Sheet.Close />
      </Sheet.Header>
      <Sheet.Content className="grow size-full overflow-y-hidden flex flex-col">
        <ScrollArea className="h-full">
          <div className="grid grid-cols-2 gap-4 p-6">
            <div className="space-y-2 col-span-2">
              <Label>{t('field-label', 'Label')}</Label>
              <Input
                value={draft?.label}
                onChange={(e) => handleValueChange('label', e.target.value)}
              />
            </div>
            <div className="space-y-2 col-span-2 flex gap-2 items-center">
              <Label className="flex items-center m-0!">
                {t('required', 'Required')}
              </Label>
              <Checkbox
                checked={draft?.required}
                onCheckedChange={(checked) =>
                  handleValueChange('required', checked === true)
                }
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>{t('description', 'Description')}</Label>
              <BlockEditor
                editor={editor}
                variant="outline"
                className="min-h-20"
                onChange={() => {
                  serializeDescription().then((description) => {
                    handleValueChange('description', description);
                  });
                }}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>{t('field-width', 'Field Width')}</Label>
              <ToggleGroup
                type="single"
                variant="outline"
                value={draft?.span?.toString() ?? '1'}
                onValueChange={(value) =>
                  handleValueChange('span', Number.parseInt(value ?? '1'))
                }
              >
                <ToggleGroup.Item value="1" className="flex-1">
                  {t('half-width', 'Half width')}
                </ToggleGroup.Item>
                <ToggleGroup.Item value="2" className="flex-1">
                  {t('full-width', 'Full width')}
                </ToggleGroup.Item>
              </ToggleGroup>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>
                {t('placeholder-attribute', 'Placeholder Attribute')}
              </Label>
              <Input
                value={draft?.placeholder}
                onChange={(e) =>
                  handleValueChange('placeholder', e.target.value)
                }
              />
            </div>
            {/* Validator Configuration */}
            {draft.type?.startsWith('core:customer') ? null : (
              <div className="space-y-3 col-span-2">
                <Label>{t('validation', 'Validation')}</Label>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={draft.validator?.type ?? 'NONE'}
                  onValueChange={(value) => {
                    if (!value) return;
                    handleChangeValidator({
                      type: value as FieldValidatorType,
                    });
                  }}
                >
                  <ToggleGroup.Item value="NONE" className="flex-1">
                    {t('none', 'None')}
                  </ToggleGroup.Item>
                  <ToggleGroup.Item value="PRESET" className="flex-1">
                    {t('preset', 'Preset')}
                  </ToggleGroup.Item>
                  <ToggleGroup.Item value="CUSTOM" className="flex-1">
                    {t('custom', 'Custom')}
                  </ToggleGroup.Item>
                </ToggleGroup>

                {draft.validator?.type === 'PRESET' && (
                  <Select
                    value={draft.validator.presetKey ?? ''}
                    onValueChange={(value) =>
                      handleChangeValidator({
                        presetKey: value as FieldValidatorPresetKey,
                      })
                    }
                  >
                    <Select.Trigger>
                      <Select.Value
                        placeholder={t(
                          'select-preset-rule',
                          'Select a preset rule',
                        )}
                      />
                    </Select.Trigger>
                    <Select.Content>
                      {VALIDATOR_PRESET_OPTIONS.map((opt) => (
                        <Select.Item key={opt.value} value={opt.value}>
                          {t(opt.label)}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                )}

                {draft.validator?.type === 'CUSTOM' && (
                  <Input
                    value={draft.validator.customRegex ?? ''}
                    onChange={(e) =>
                      handleChangeValidator({ customRegex: e.target.value })
                    }
                    placeholder={t(
                      'regex-pattern-placeholder',
                      'Regex pattern (e.g. ^[A-Z]{3}\\d{4}$)',
                    )}
                    spellCheck={false}
                  />
                )}

                {draft.validator?.type &&
                  draft.validator.type !== 'NONE' && (
                    <Input
                      value={draft.validator.errorMessage ?? ''}
                      onChange={(e) =>
                        handleChangeValidator({ errorMessage: e.target.value })
                      }
                      placeholder={t(
                        'error-message-placeholder',
                        'Error message shown to the user',
                      )}
                    />
                  )}
              </div>
            )}

            {(draft?.type === 'select' ||
              draft?.type === 'select:countries') && (
              <div className="space-y-2 col-span-2 flex gap-2 items-center">
                <Label htmlFor="allowSearch" className="flex items-center m-0!">
                  {t('allow-search', 'Allow search')}
                </Label>
                <Checkbox
                  id="allowSearch"
                  className="flex-none shrink m-0!"
                  checked={draft?.allowSearch}
                  onCheckedChange={(checked) =>
                    handleValueChange('allowSearch', checked === true)
                  }
                />
                <Tooltip.Provider>
                  <Tooltip>
                    <Tooltip.Trigger>
                      <IconInfoCircle
                        size={16}
                        className="text-accent-foreground"
                      />
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                      {t(
                        'enables-search-in-options',
                        'Enables searching within options',
                      )}
                    </Tooltip.Content>
                  </Tooltip>
                </Tooltip.Provider>
              </div>
            )}
            {(draft?.type === 'select' ||
              draft?.type === 'select:countries' ||
              draft?.type === 'radio' ||
              draft?.type === 'check' ||
              draft?.type === 'core:customer:sex') && (
              <div className="space-y-2 col-span-2">
                <Label>{t('options', 'Options')}</Label>
                <div className="space-y-2">
                  {draft.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={option}
                        placeholder={t('option-label', 'Option')}
                        onChange={(e) =>
                          handleChangeOption(index, e.target.value)
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 hover:text-destructive"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <IconTrash size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={handleAddOption}>
                  <IconPlus size={14} />
                  {t('add-option', 'Add option')}
                </Button>
              </div>
            )}
            <div className="space-y-2 col-span-2">
              <Label>{t('field-logic-action', 'Field Logic action')}</Label>
              <Select
                value={draft?.logicAction}
                onValueChange={(value) =>
                  handleValueChange('logicAction', value as string)
                }
              >
                <Select.Trigger>
                  <Select.Value
                    placeholder={t(
                      'select-logic-action',
                      'Select logic action',
                    )}
                  />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="show">
                    {t('show-this-field', 'Show this field')}
                  </Select.Item>
                  <Select.Item value="hide">
                    {t('hide-this-field', 'Hide this field')}
                  </Select.Item>
                </Select.Content>
              </Select>
            </div>
            {/* Logics */}
            <div className="space-y-2 col-span-2">
              <div className="flex items-center justify-between">
                <Label>{t('field-logics', 'Field Logics')}</Label>
                <Button variant="outline" size="sm" onClick={handleAddLogic}>
                  <IconPlus size={14} />
                  {t('add-logic', 'Add Logic')}
                </Button>
              </div>
              <div className="space-y-2">
                {(draft.logics ?? []).map((logic, index) => {
                  const referencedField = availableFields.find(
                    (f) => f.id === logic.fieldId,
                  );
                  const operators = getOperatorOptions(referencedField?.type);
                  return (
                    <div
                      key={index}
                      className="grid grid-cols-2 gap-2 items-center border rounded p-2"
                    >
                      <Select
                        value={logic.fieldId}
                        onValueChange={(value) =>
                          handleChangeLogic(index, 'fieldId', value)
                        }
                      >
                        <Select.Trigger className="col-span-1">
                          <Select.Value
                            placeholder={t('select-field', 'Select field')}
                          />
                        </Select.Trigger>
                        <Select.Content>
                          {availableFields.map((f) => (
                            <Select.Item key={f.id} value={f.id}>
                              {f.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                      <Select
                        value={logic.logicOperator}
                        onValueChange={(value) =>
                          handleChangeLogic(index, 'logicOperator', value)
                        }
                      >
                        <Select.Trigger className="col-span-1">
                          <Select.Value
                            placeholder={t('operator', 'Operator')}
                          />
                        </Select.Trigger>
                        <Select.Content>
                          {operators.map((op) => (
                            <Select.Item key={op.value} value={op.value}>
                              {op.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                      <Input
                        className="col-span-2"
                        value={logic.logicValue ?? ''}
                        onChange={(e) =>
                          handleChangeLogic(index, 'logicValue', e.target.value)
                        }
                        placeholder={t('value', 'Value')}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto col-span-2 hover:text-destructive"
                        onClick={() => handleRemoveLogic(index)}
                      >
                        <IconTrash size={14} />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>
      </Sheet.Content>
      <Sheet.Footer>
        <Button
          variant="secondary"
          className="text-destructive bg-destructive/10 hover:bg-destructive/20"
          onClick={handleDelete}
        >
          <IconTrash />
          {t('delete', 'Delete')}
        </Button>
        <Button onClick={handleConfirm}>{t('confirm', 'Confirm')}</Button>
      </Sheet.Footer>
    </div>
  );
};

export const FormFieldDetailSheet = ({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View>{open && children}</Sheet.View>
    </Sheet>
  );
};
