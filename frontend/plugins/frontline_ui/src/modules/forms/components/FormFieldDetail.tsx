import { Label, Input, Sheet, Textarea, ToggleGroup, Button } from 'erxes-ui';
import { IFieldData, useFormDnd } from './FormDndProvider';
import { useState } from 'react';
import { UniqueIdentifier } from '@dnd-kit/core';

// export interface IFieldData {
//     id: string;
//     type: string;
//     label: string;
//     description: string;
//     placeholder: string;
//     required: boolean;
//     options: string[];
//     span: number;
//     order: number;
//     stepId: string;
//   }

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
  const { handleChangeField } = useFormDnd();

  if (!fieldData) {
    return null;
  }

  const handleValueChange = (key: keyof IFieldData, value: string | number) => {
    handleChangeField(stepId, fieldId, {
      ...fieldData,
      [key]: value,
    });
  };

  return (
    <>
      <Sheet.Header>
        <Sheet.Title>{fieldData?.label}</Sheet.Title>
        <Sheet.Close />
      </Sheet.Header>
      <Sheet.Content>
        <div className="grid grid-cols-2 gap-4 p-6">
          <div className="space-y-2 col-span-2">
            <Label>Label</Label>
            <Input
              value={fieldData?.label}
              onChange={(e) => handleValueChange('label', e.target.value)}
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Description</Label>
            <Textarea
              value={fieldData?.description}
              onChange={(e) => handleValueChange('description', e.target.value)}
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Field Width</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              value={fieldData?.span?.toString() ?? '1'}
              onValueChange={(value) =>
                handleValueChange('span', parseInt(value ?? '1'))
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
            <Label>Placeholder</Label>
            <Input
              value={fieldData?.placeholder}
              onChange={(e) => handleValueChange('placeholder', e.target.value)}
            />
          </div>
        </div>
      </Sheet.Content>
      <Sheet.Footer>
        <Button variant="outline" onClick={handleClose}>
          Close
        </Button>
      </Sheet.Footer>
    </>
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
