import React from 'react';
import { Button, Select } from 'erxes-ui';
import { IconUpload } from '@tabler/icons-react';

interface IProps {
  onSearch?: (value: string) => void;
  onUpload: () => void;
  onStatusChange?: (status: string) => void;
  currentStatus?: string;
}

const TemplatesHeader: React.FC<IProps> = ({
  onUpload,
  onStatusChange,
  currentStatus,
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-sidebar">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Templates</h2>
      </div>
      <div className="flex items-center gap-2">
        <Select
          value={currentStatus || 'all'}
          onValueChange={(value) => onStatusChange?.(value)}
        >
          <Select.Trigger className="w-[140px]">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="active">Active</Select.Item>
            <Select.Item value="inactive">Inactive</Select.Item>
            <Select.Item value="all">All</Select.Item>
          </Select.Content>
        </Select>
        <Button size="sm" onClick={onUpload}>
          <IconUpload size={16} />
          Upload Template
        </Button>
      </div>
    </div>
  );
};

export default TemplatesHeader;
