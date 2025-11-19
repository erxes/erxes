import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { AutomationNodesType, NodeData } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { Node, useReactFlow } from '@xyflow/react';
import { Button, Dialog, IconPicker, Input } from 'erxes-ui';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

type Props = {
  id: string;
  fieldName:
    | AutomationNodesType.Triggers
    | AutomationNodesType.Actions
    | AutomationNodesType.Workflows;
  data: NodeData;
  callback: () => void;
};

export const NodeEditMetaDataForm = ({
  id,
  fieldName,
  data,
  callback,
}: Props) => {
  const { setAutomationBuilderFormValue } = useAutomationFormController();
  const { updateNodeData } = useReactFlow<Node<NodeData>>();

  const { nodeIndex, label, description, icon } = data || {};

  const [doc, setDoc] = useState({
    label: label || '',
    description: description || '',
    icon,
  });

  const handleChange = (e: any) => {
    const { value, name } = e.currentTarget as HTMLInputElement;

    setDoc({ ...doc, [name]: value });
  };

  const handleSave = () => {
    const updatedNode = {
      ...data,
      ...doc,
      id,
    };
    setAutomationBuilderFormValue(`${fieldName}.${nodeIndex}`, updatedNode, {
      shouldValidate: true,
      shouldDirty: true,
    });
    updateNodeData(id, updatedNode);
    callback();
  };

  return (
    <Dialog.Content>
      <Dialog.Title>Edit Node Metadata</Dialog.Title>
      <Dialog.Description>
        Customize the name and description of this node for better clarity.
      </Dialog.Description>
      <IconPicker
        // onValueChange={field.onChange}
        // value={field.value}
        onValueChange={(icon) => setDoc({ ...doc, icon: icon || '' })}
        value={icon}
        variant="secondary"
        size="lg"
        className="w-min p-2"
      />
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
