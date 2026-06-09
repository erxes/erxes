import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { AutomationNodesType, NodeData } from '@/automations/types';
import { Node, useReactFlow } from '@xyflow/react';
import { Button, Dialog, IconPicker, Input } from 'erxes-ui';
import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

type NodeMetadataFormData = NodeData &
  Partial<Pick<Node<NodeData>, 'position'>>;

type Props = {
  id: string;
  fieldName:
    | AutomationNodesType.Triggers
    | AutomationNodesType.Actions
    | AutomationNodesType.Workflows;
  data: NodeMetadataFormData;
  callback: () => void;
};

export const NodeEditMetaDataForm = ({
  id,
  fieldName,
  data,
  callback,
}: Props) => {
  const { setAutomationBuilderFormValue } = useAutomationFormController();
  const { updateNodeData, getNode } = useReactFlow<Node<NodeData>>();
  const { t } = useTranslation('automations');

  const { nodeIndex, label, description, icon } = data || {};

  const [doc, setDoc] = useState({
    label: label || '',
    description: description || '',
    icon,
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { value, name } = e.currentTarget;

    setDoc({ ...doc, [name]: value });
  };

  const handleSave = () => {
    const currentNode = getNode(id);
    const updatedNodeData = {
      ...data,
      ...doc,
      id,
    };
    const updatedNode = {
      ...updatedNodeData,
      position: currentNode?.position ?? data.position,
    };

    setAutomationBuilderFormValue(`${fieldName}.${nodeIndex}`, updatedNode, {
      shouldValidate: true,
      shouldDirty: true,
    });
    updateNodeData(id, updatedNodeData);
    callback();
  };

  return (
    <Dialog.Content>
      <Dialog.Title>{t('edit-node-metadata-title')}</Dialog.Title>
      <Dialog.Description>
        {t('edit-node-metadata-description')}
      </Dialog.Description>
      <IconPicker
        onValueChange={(icon) => setDoc({ ...doc, icon: icon || '' })}
        value={doc.icon}
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
        <Button onClick={handleSave}>{t('save')}</Button>
      </Dialog.Footer>
    </Dialog.Content>
  );
};
