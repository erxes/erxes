import { useNodeEditMetaDataForm } from '@/automations/components/builder/nodes/hooks/useNodeEditMetaDataForm';
import { NodeData } from '@/automations/types';
import { Node } from '@xyflow/react';
import { Button, Dialog, IconPicker, Input } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

type NodeMetadataFormData = NodeData &
  Partial<Pick<Node<NodeData>, 'position'>>;

type Props = {
  id: string;
  data: NodeMetadataFormData;
  callback: () => void;
};

export const NodeEditMetaDataForm = ({ id, data, callback }: Props) => {
  const { t } = useTranslation('automations');
  const { doc, handleChange, handleIconChange, handleSave } =
    useNodeEditMetaDataForm({ id, data, callback });

  return (
    <Dialog.Content>
      <Dialog.Title>{t('edit-node-metadata-title')}</Dialog.Title>
      <Dialog.Description>
        {t('edit-node-metadata-description')}
      </Dialog.Description>
      <IconPicker
        onValueChange={handleIconChange}
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
