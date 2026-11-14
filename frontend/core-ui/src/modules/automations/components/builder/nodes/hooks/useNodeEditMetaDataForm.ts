import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { AutomationNodeType, NodeData } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { Node, useReactFlow } from '@xyflow/react';
import { ChangeEvent, useCallback, useState } from 'react';
import { FieldPath, useFormContext } from 'react-hook-form';

type TNodeMeta = { label: string; description: string; icon?: string };

// Workflows store the title as `name`, triggers and actions as `label`
const entryMetaOf = (nodeType: NodeData['nodeType'], doc: TNodeMeta) =>
  nodeType === AutomationNodeType.Workflow
    ? { name: doc.label, description: doc.description, icon: doc.icon }
    : { label: doc.label, description: doc.description, icon: doc.icon };

/**
 * A node's name, description and icon edited in a dialog, then written to
 * its form entry (keeping where it sits on the canvas) and its drawn node.
 */
export const useNodeEditMetaDataForm = ({
  id,
  data,
  callback,
}: {
  id: string;
  data: NodeData;
  callback: () => void;
}) => {
  const { setAutomationBuilderFormValue } = useAutomationFormController();
  const { getValues } = useFormContext<TAutomationBuilderForm>();
  const { updateNodeData, getNode } = useReactFlow<Node<NodeData>>();
  const [doc, setDoc] = useState<TNodeMeta>({
    label: data?.label || '',
    description: data?.description || '',
    icon: data?.icon,
  });

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value, name } = event.currentTarget;

      setDoc((current) => ({ ...current, [name]: value }));
    },
    [],
  );

  const handleIconChange = useCallback(
    (icon: string | null) =>
      setDoc((current) => ({ ...current, icon: icon || '' })),
    [],
  );

  const handleSave = useCallback(() => {
    if (!data.formPath) {
      return;
    }

    const formPath = data.formPath as FieldPath<TAutomationBuilderForm>;
    const currentEntry = getValues(formPath) || {};

    setAutomationBuilderFormValue(
      formPath,
      {
        ...currentEntry,
        ...entryMetaOf(data.nodeType, doc),
        position: getNode(id)?.position ?? currentEntry?.position,
      },
      { shouldValidate: true, shouldDirty: true },
    );
    updateNodeData(id, { ...data, ...doc });
    callback();
  }, [
    data,
    doc,
    id,
    getValues,
    getNode,
    setAutomationBuilderFormValue,
    updateNodeData,
    callback,
  ]);

  return { doc, handleChange, handleIconChange, handleSave };
};
