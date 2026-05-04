import {
  Label,
  Input,
  Sheet,
  Textarea,
  ToggleGroup,
  Button,
  StringArrayInput,
  Select,
  Checkbox,
  ScrollArea,
} from 'erxes-ui';
import { IFieldData, useFormDnd } from './FormDndProvider';
import { UniqueIdentifier } from '@dnd-kit/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { IFormFieldLogics } from '../types/formTypes';
import {
  LOGIC_STRING_OPERATOR_LABELS,
  LOGIC_NUMBER_OPERATOR_LABELS,
  LOGIC_DATE_OPERATOR_LABELS,
} from '../constants/formLogicLabels';

const NUMBER_TYPES = ['number'];
const DATE_TYPES = ['date'];

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
  const { handleChangeField, handleDeleteField, fields, getFieldValue } =
    useFormDnd();

  const availableFields = Object.entries(fields)
    .flatMap(([stepId, fieldIds]) =>
      fieldIds.map((fId) =>
        getFieldValue(stepId as UniqueIdentifier, fId as UniqueIdentifier),
      ),
    )
    .filter((f): f is IFieldData => !!f && f.id !== fieldId.toString());

  if (!fieldData) {
    return null;
  }

  const handleValueChange = (
    key: keyof IFieldData,
    value: string | number | string[] | boolean,
  ) => {
    handleChangeField(stepId, fieldId, {
      ...fieldData,
      [key]: value,
    });
  };

  const handleAddLogic = () => {
    handleChangeField(stepId, fieldId, {
      ...fieldData,
      logics: [
        ...(fieldData.logics ?? []),
        { fieldId: '', logicOperator: '', logicValue: '' },
      ],
    });
  };

  const handleChangeLogic = (
    index: number,
    key: keyof IFormFieldLogics,
    value: string,
  ) => {
    const updatedLogics = (fieldData.logics ?? []).map((logic, i) =>
      i === index ? { ...logic, [key]: value } : logic,
    );
    handleChangeField(stepId, fieldId, { ...fieldData, logics: updatedLogics });
  };

  const handleRemoveLogic = (index: number) => {
    const updatedLogics = (fieldData.logics ?? []).filter(
      (_, i) => i !== index,
    );
    handleChangeField(stepId, fieldId, { ...fieldData, logics: updatedLogics });
  };

  const handleDelete = () => {
    handleDeleteField(stepId, fieldId);
    handleClose();
  };

  return (
    <div className="flex flex-col gap-0 size-full">
      <Sheet.Header>
        <Sheet.Title>{fieldData?.label}</Sheet.Title>
        <Sheet.Close />
      </Sheet.Header>
      <Sheet.Content className="grow size-full overflow-y-hidden flex flex-col">
        <ScrollArea className="h-full">
          <div className="grid grid-cols-2 gap-4 p-6">
            <div className="space-y-2 col-span-2">
              <Label>Label</Label>
              <Input
                value={fieldData?.label}
                onChange={(e) => handleValueChange('label', e.target.value)}
              />
            </div>
            <div className="space-y-2 col-span-2 flex gap-2 items-center">
              <Label className="flex items-center m-0!">Required</Label>
              <Checkbox
                checked={fieldData?.required}
                onCheckedChange={(checked) =>
                  handleValueChange('required', checked === true)
                }
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Description</Label>
              <Textarea
                value={fieldData?.description}
                onChange={(e) =>
                  handleValueChange('description', e.target.value)
                }
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Field Width</Label>
              <ToggleGroup
                type="single"
                variant="outline"
                value={fieldData?.span?.toString() ?? '1'}
                onValueChange={(value) =>
                  handleValueChange('span', Number.parseInt(value ?? '1'))
                }
              >
                <ToggleGroup.Item value="1" className="flex-1">
                  half width
                </ToggleGroup.Item>
                <ToggleGroup.Item value="2" className="flex-1">
                  full width
                </ToggleGroup.Item>
              </ToggleGroup>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Placeholder Attribute</Label>
              <Input
                value={fieldData?.placeholder}
                onChange={(e) =>
                  handleValueChange('placeholder', e.target.value)
                }
              />
            </div>
            {(fieldData?.type === 'select' ||
              fieldData?.type === 'radio' ||
              fieldData?.type === 'check') && (
              <div className="space-y-2 col-span-2">
                <Label>Options</Label>
                <StringArrayInput
                  styleClasses={{
                    inlineTagsContainer: 'shadow-xs',
                  }}
                  value={fieldData?.options ?? []}
                  onValueChange={(value) =>
                    handleValueChange('options', value as string[])
                  }
                />
              </div>
            )}
            <div className="space-y-2 col-span-2">
              <Label>Field Logic action</Label>
              <Select
                value={fieldData?.logicAction}
                onValueChange={(value) =>
                  handleValueChange('logicAction', value as string)
                }
              >
                <Select.Trigger>
                  <Select.Value placeholder="Select logic action" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="show">Show this field</Select.Item>
                  <Select.Item value="hide">Hide this field</Select.Item>
                </Select.Content>
              </Select>
            </div>
            {/* Logics */}
            <div className="space-y-2 col-span-2">
              <div className="flex items-center justify-between">
                <Label>Field Logics</Label>
                <Button variant="outline" size="sm" onClick={handleAddLogic}>
                  <IconPlus size={14} />
                  Add Logic
                </Button>
              </div>
              <div className="space-y-2">
                {(fieldData.logics ?? []).map((logic, index) => {
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
                          <Select.Value placeholder="Select field" />
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
                          <Select.Value placeholder="Operator" />
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
                        placeholder="Value"
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
          Delete
        </Button>
        <Button variant="outline" onClick={handleClose}>
          Close
        </Button>
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
