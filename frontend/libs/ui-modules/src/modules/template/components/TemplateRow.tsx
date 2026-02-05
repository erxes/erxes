import React from 'react';
import { Button } from 'erxes-ui';
import {
  IconTrash,
  IconEdit,
  IconDownload,
  IconCheck,
} from '@tabler/icons-react';
import { ITemplate } from '../types/types';
import { useTemplateRemove, useTemplateUse } from '../hooks/useTemplates';
interface IProps {
  template: ITemplate;
  onRefetch: () => void;
  onEdit: (template: ITemplate) => void;
}

const TemplateRow: React.FC<IProps> = ({ template, onRefetch, onEdit }) => {
  const { removeTemplate } = useTemplateRemove({
    onCompleted: () => {
      onRefetch();
    },
  });

  const { useTemplate } = useTemplateUse();

  const handleRemove = () => {
    if (window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
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

  const handleEdit = () => {
    onEdit(template);
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

    // Create temporary download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.name
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()}_template.json`;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-gray-900">{template.name}</div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm text-gray-500">{template.contentType}</div>
        {template.pluginType && (
          <div className="text-xs text-gray-400">{template.pluginType}</div>
        )}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            template.status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {template.status || 'active'}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm text-gray-500 truncate max-w-xs">
          {template.description || '-'}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUse}
            title="Use Template"
          >
            <IconCheck size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            title="Export"
          >
            <IconDownload size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleEdit} title="Edit">
            <IconEdit size={16} />
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
      </td>
    </tr>
  );
};

export default TemplateRow;
