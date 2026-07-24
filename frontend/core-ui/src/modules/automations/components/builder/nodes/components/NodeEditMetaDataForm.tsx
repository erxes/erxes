import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { AutomationNodeType, NodeData } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { Node, useReactFlow } from '@xyflow/react';
import { Button, Dialog, IconPicker, Input } from 'erxes-ui';
import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { FieldPath, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type NodeMetadataFormData = NodeData &
  Partial<Pick<Node<NodeData>, 'position'>>;

type Props = {
  id: string;
  data: NodeMetadataFormData;
  callback: () => void;
};

export const NodeEditMetaDataForm = ({ id, data, callback }: Props) => {
  const { setAutomationBuilderFormValue } = useAutomationFormController();
  const { getValues } = useFormContext<TAutomationBuilderForm>();
  const { updateNodeData, getNode } = useReactFlow<Node<NodeData>>();
  const { t } = useTranslation('automations');

  const { label, description, icon } = data || {};

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
    if (!data.formPath) {
      return;
    }

    const currentNode = getNode(id);
    const currentEntry =
      getValues(data.formPath as FieldPath<TAutomationBuilderForm>) || {};

    // The form entry shape differs per node kind: workflows store the title
    // as `name`, triggers/actions as `label`.
    const metaValues =
      data.nodeType === AutomationNodeType.Workflow
        ? { name: doc.label, description: doc.description, icon: doc.icon }
        : { label: doc.label, description: doc.description, icon: doc.icon };

    const updatedEntry = {
      ...currentEntry,
      ...metaValues,
      position: currentNode?.position ?? currentEntry?.position,
    };

    setAutomationBuilderFormValue(data.formPath, updatedEntry, {
      shouldValidate: true,
      shouldDirty: true,
    });
    updateNodeData(id, { ...data, ...doc });
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
