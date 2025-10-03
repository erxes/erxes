import { TAutomationBuilderForm } from '@/automations/utils/AutomationFormDefinitions';
import { Button, Dialog, Input } from 'erxes-ui';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { NodeData } from '../../../types';

type Props = {
  id: string;
  fieldName: 'actions' | 'triggers';
  data: NodeData;
  callback: () => void;
};

export const EditForm = ({ id, fieldName, data, callback }: Props) => {
  const { setValue } = useFormContext<TAutomationBuilderForm>();

  const { nodeIndex, label, description } = data || {};

  const [doc, setDoc] = useState({
    label: label || '',
    description: description || '',
  });

  const handleChange = (e: any) => {
    const { value, name } = e.currentTarget as HTMLInputElement;

    setDoc({ ...doc, [name]: value });
  };

  const handleSave = () => {
    setValue(
      `${fieldName}.${nodeIndex}`,
      {
        ...data,
        label: doc.label,
        description: doc.description,
      },
      { shouldValidate: true, shouldDirty: true },
    );

    callback();
  };

  return (
    <Dialog.Content>
      <Dialog.Title>Edit Node</Dialog.Title>
      <Input name="label" value={doc.label} onChange={handleChange} />
      <Input
        type="textarea"
        name="description"
        value={doc.description}
        onChange={handleChange}
      />
      <Dialog.Footer>
        <Button onClick={handleSave}>Save</Button>
      </Dialog.Footer>
    </Dialog.Content>
  );
};
