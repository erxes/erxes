import React from 'react';
import { Button } from 'erxes-ui';
import {
  IconTrash,
  IconDownload,
  IconCheck,
  IconEdit,
} from '@tabler/icons-react';
import { ITemplate } from '../types/types';
import { useTemplateRemove, useTemplateUse } from '../hooks/useTemplates';

interface IProps {
  template: ITemplate;
  onRefetch: () => void;
  onEdit: (template: ITemplate) => void;
}

const TemplateActions: React.FC<IProps> = ({ template, onRefetch, onEdit }) => {
  const { removeTemplate } = useTemplateRemove({
    onCompleted: () => {
      onRefetch();
    },
  });

  const { useTemplate } = useTemplateUse();

  const handleEdit = () => {
    onEdit(template);
  };

  const handleRemove = () => {
    if (window.confirm(`Are you sure you want to remove "${template.name}"?`)) {
      removeTemplate({
        variables: { _id: template._id },
      });
    }
  };

  const handleUse = () => {
    useTemplate({
      variables: {
        _id: template._id,
        contentType: template.contentType,
      },
    });
  };

  const handleExport = () => {
    const exportData = {
      name: template.name,
      content: template.content,
      contentType: template.contentType,
      description: template.description,
      pluginType: template.pluginType,
      categoryIds: template.categoryIds,
      status: template.status,
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.name
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()}_template.json`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleUse}
        title="Use Template"
      >
        <IconCheck size={16} />
      </Button>
      <Button variant="ghost" size="sm" onClick={handleEdit} title="Edit">
        <IconEdit size={16} />
      </Button>
      <Button variant="ghost" size="sm" onClick={handleExport} title="Export">
        <IconDownload size={16} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemove}
        title="Remove"
        className="text-red-600 hover:text-red-700"
      >
        <IconTrash size={16} />
      </Button>
    </div>
  );
};

export default TemplateActions;
