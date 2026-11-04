import {
  Label,
  Input,
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
import { useEffect, useRef, useState } from 'react';
import { nanoid } from 'nanoid';
import { RecordSidePanel } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import { useFormFieldConversion } from '../hooks/useFormFieldConversion';
import { useFormConversionTranslation } from '../conversionTranslations';
import { FormConversionFeedback } from './FormConversionFeedback';
import { FORM_FIELD_TYPES } from '../constants/formFieldTypes';
import {
  canConvertFormField,
  getConvertedFieldValidation,
} from '../constants/formFieldConversions';
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
const DATE_TYPES = ['date', 'core:customer:birthDate'];

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

/** Lists the logic operators supported by the referenced field's type. */
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

/** Edits a form field's attributes, options, validation, and logic locally. */
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
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.forms' });
  const conversionText = useFormConversionTranslation();
  const {
    handleChangeField,
    handleDeleteField,
    fields,
    getFieldValue,
    setEditingFieldDirty,
  } = useFormDnd();

  const editor = useBlockEditor();

  const [draft, setDraft] = useState<IFieldData | undefined>(fieldData);
  const descriptionChange = useRef({ version: 0, pending: false });
  const [rowKeys, setRowKeys] = useState(() => ({
    options: (fieldData?.options ?? []).map(() => nanoid()),
    logics: (fieldData?.logics ?? []).map(() => nanoid()),
  }));

  useEffect(() => {
    setEditingFieldDirty(
      fieldId,
      descriptionChange.current.pending ||
        JSON.stringify(draft) !== JSON.stringify(fieldData),
    );
  }, [draft, fieldData, fieldId, setEditingFieldDirty]);

  useEffect(
    () => () => setEditingFieldDirty(fieldId, false),
    [fieldId, setEditingFieldDirty],
  );

  useEffect(() => {
    setDraft(fieldData);
    setRowKeys({
      options: (fieldData?.options ?? []).map(() => nanoid()),
      logics: (fieldData?.logics ?? []).map(() => nanoid()),
    });
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
    .filter(
      (f): f is IFieldData => f !== undefined && f.id !== fieldId.toString(),
    );
  const conversionCheck = useFormFieldConversion(draft, availableFields);

  if (!draft) {
    return null;
  }

  const originalType = draft.expectedType ?? draft.type;
  const conversionTargets = FORM_FIELD_TYPES.filter(
    (field) =>
      field.value !== draft.type &&
      field.value !== originalType &&
      canConvertFormField(originalType, field.value),
  );

  /** Updates one attribute of the local field draft. */
  const handleValueChange = (
    key: keyof IFieldData,
    value: string | number | string[] | boolean,
  ) => {
    setDraft((prev) => prev && { ...prev, [key]: value });
  };

  /** Appends an empty logic rule with a stable editor-row key. */
  const handleAddLogic = () => {
    const key = nanoid();
    setRowKeys((previous) => ({
      ...previous,
      logics: [...previous.logics, key],
    }));
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

  /** Updates one property of the selected logic rule. */
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

  /** Removes a logic rule and its corresponding editor-row key. */
  const handleRemoveLogic = (index: number) => {
    setRowKeys((previous) => ({
      ...previous,
      logics: previous.logics.filter((_, i) => i !== index),
    }));
    setDraft((prev) => {
      if (!prev) return prev;
      const updatedLogics = (prev.logics ?? []).filter((_, i) => i !== index);
      return { ...prev, logics: updatedLogics };
    });
  };

  /** Appends an empty option with a stable editor-row key. */
  const handleAddOption = () => {
    const key = nanoid();
    setRowKeys((previous) => ({
      ...previous,
      options: [...previous.options, key],
    }));
    setDraft((prev) => prev && { ...prev, options: [...prev.options, ''] });
  };

  /** Updates an option without replacing its editor identity. */
  const handleChangeOption = (index: number, value: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const updatedOptions = prev.options.map((option, i) =>
        i === index ? value : option,
      );
      return { ...prev, options: updatedOptions };
    });
  };

  /** Removes an option and its corresponding editor-row key. */
  const handleRemoveOption = (index: number) => {
    setRowKeys((previous) => ({
      ...previous,
      options: previous.options.filter((_, i) => i !== index),
    }));
    setDraft((prev) => {
      if (!prev) return prev;
      return { ...prev, options: prev.options.filter((_, i) => i !== index) };
    });
  };

  /** Merges validation settings into the current field draft. */
  const handleChangeValidator = (patch: Partial<IFieldValidator>) => {
    setDraft(
      (prev) =>
        prev && {
          ...prev,
          validator: { type: 'NONE', ...prev.validator, ...patch },
        },
    );
  };

  /** Removes the field and closes its local editor. */
  const handleDelete = () => {
    handleDeleteField(stepId, fieldId);
    handleClose();
  };

  /** Serializes sanitized editor HTML, preserving an empty description as empty. */
  const serializeDescription = async () => {
    const html = await editor.blocksToHTMLLossy(editor.document);
    const safe = DOMPurify.sanitize(html);
    const stripped = safe.replace(/<[^>]*>/g, '').trim();
    return stripped ? safe : '';
  };

  /** Applies a valid field draft with its latest serialized description. */
  const handleConfirm = async () => {
    if (!draft || !conversionCheck.canConfirm) return;
    const description = await serializeDescription();
    handleChangeField(stepId, fieldId, { ...draft, description });
    handleClose();
  };

  const conversionField = (conversionTargets.length > 0 ||
    draft.type !== originalType) && (
    <div className="space-y-2 col-span-2">
      <Label htmlFor="form-field-conversion">
        {conversionText.t('convert')}
      </Label>
      <Select
        value={draft.type}
        onValueChange={(type) =>
          setDraft(
            (previous) =>
              previous && {
                ...previous,
                expectedType:
                  type === originalType
                    ? undefined
                    : (previous.expectedType ?? previous.type),
                type,
                validation:
                  type === originalType
                    ? (conversionCheck.savedField?.validation ??
                      fieldData?.validation ??
                      '')
                    : getConvertedFieldValidation(type),
                validator:
                  type === originalType
                    ? {
                        type:
                          conversionCheck.savedField?.validator?.type ??
                          fieldData?.validator?.type ??
                          'NONE',
                        presetKey:
                          conversionCheck.savedField?.validator?.presetKey ??
                          fieldData?.validator?.presetKey ??
                          undefined,
                        customRegex:
                          conversionCheck.savedField?.validator?.customRegex ??
                          fieldData?.validator?.customRegex ??
                          undefined,
                        errorMessage:
                          conversionCheck.savedField?.validator?.errorMessage ??
                          fieldData?.validator?.errorMessage ??
                          undefined,
                      }
                    : { type: 'NONE' },
              },
          )
        }
      >
        <Select.Trigger id="form-field-conversion">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value={draft.type}>
            {conversionText.fieldType(draft.type)}
          </Select.Item>
          {draft.type !== originalType && (
            <Select.Item value={originalType}>
              {conversionText.fieldType(originalType)}
            </Select.Item>
          )}
          {conversionTargets.map((field) => (
            <Select.Item key={field.value} value={field.value}>
              {conversionText.fieldType(field.value)}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
      <p className="text-sm text-muted-foreground">
        {conversionText.t('help')}
      </p>
      <FormConversionFeedback check={conversionCheck} />
    </div>
  );

  const validatorConfiguration = draft.type?.startsWith(
    'core:customer',
  ) ? null : (
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
              placeholder={t('select-preset-rule', 'Select a preset rule')}
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

      {draft.validator?.type && draft.validator.type !== 'NONE' && (
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
  );

  const showSearch =
    draft?.type === 'select' || draft?.type === 'select:countries';

  const searchTooltip = showSearch && (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger>
          <IconInfoCircle size={16} className="text-accent-foreground" />
        </Tooltip.Trigger>
        <Tooltip.Content>
          {t('enables-search-in-options', 'Enables searching within options')}
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );

  const showOptions =
    draft?.type === 'select' ||
    draft?.type === 'select:countries' ||
    draft?.type === 'radio' ||
    draft?.type === 'check' ||
    draft?.type === 'core:customer:sex';

  const optionRows =
    showOptions &&
    rowKeys.options.map((key, index) => (
      <div key={key} className="flex items-center gap-2">
        <Input
          value={draft.options[index]}
          placeholder={t('option-label', 'Option')}
          onChange={(e) => handleChangeOption(index, e.target.value)}
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
    ));

  const logicRows = rowKeys.logics.map((key, index) => {
    const logic = (draft.logics ?? [])[index];
    const referencedField = availableFields.find((f) => f.id === logic.fieldId);
    const operators = getOperatorOptions(referencedField?.type);
    return (
      <div
        key={key}
        className="grid grid-cols-2 gap-2 items-center border rounded p-2"
      >
        <Select
          value={logic.fieldId}
          onValueChange={(value) => handleChangeLogic(index, 'fieldId', value)}
        >
          <Select.Trigger className="col-span-1">
            <Select.Value placeholder={t('select-field', 'Select field')} />
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
            <Select.Value placeholder={t('operator', 'Operator')} />
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
  });

  const logicActionField = (
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
            placeholder={t('select-logic-action', 'Select logic action')}
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
  );

  const fieldLogics = (
    <div className="space-y-2 col-span-2">
      <div className="flex items-center justify-between">
        <Label>{t('field-logics', 'Field Logics')}</Label>
        <Button variant="outline" size="sm" onClick={handleAddLogic}>
          <IconPlus size={14} />
          {t('add-logic', 'Add Logic')}
        </Button>
      </div>
      <div className="space-y-2">{logicRows}</div>
    </div>
  );

  const fieldControls = (
    <div className="grid grid-cols-2 gap-4 p-6">
      {conversionField}
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
            const version = ++descriptionChange.current.version;
            descriptionChange.current.pending = true;
            setEditingFieldDirty(fieldId, true);
            serializeDescription().then((description) => {
              if (version !== descriptionChange.current.version) return;
              descriptionChange.current.pending = false;
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
        <Label>{t('placeholder-attribute', 'Placeholder Attribute')}</Label>
        <Input
          value={draft?.placeholder}
          onChange={(e) => handleValueChange('placeholder', e.target.value)}
        />
      </div>
      {/* Validator Configuration */}
      {validatorConfiguration}

      {showSearch && (
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
          {searchTooltip}
        </div>
      )}
      {showOptions && (
        <div className="space-y-2 col-span-2">
          <Label>{t('options', 'Options')}</Label>
          <div className="space-y-2">{optionRows}</div>
          <Button variant="outline" size="sm" onClick={handleAddOption}>
            <IconPlus size={14} />
            {t('add-option', 'Add option')}
          </Button>
        </div>
      )}
      {logicActionField}
      {/* Logics */}
      {fieldLogics}
    </div>
  );

  return (
    <div className="flex flex-col gap-0 size-full">
      <RecordSidePanel.Header title={draft?.label} onClose={handleClose} />
      <div className="grow min-h-0 overflow-y-hidden flex flex-col">
        <ScrollArea className="h-full">{fieldControls}</ScrollArea>
      </div>
      <div className="flex shrink-0 justify-end gap-2 border-t p-3">
        <Button
          variant="secondary"
          className="text-destructive bg-destructive/10 hover:bg-destructive/20"
          onClick={handleDelete}
        >
          <IconTrash />
          {t('delete', 'Delete')}
        </Button>
        <Button onClick={handleConfirm} disabled={!conversionCheck.canConfirm}>
          {t('confirm', 'Confirm')}
        </Button>
      </div>
    </div>
  );
};
