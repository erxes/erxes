import { IconEdit } from '@tabler/icons-react';
import { BlockEditorReadOnly, Button } from 'erxes-ui';
import { useState } from 'react';

export const SendEmailEmailContentPreview = ({
  content,
  onEdit,
}: {
  content: string;
  onEdit: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative border rounded-lg p-4 h-52 overflow-hidden bg-background cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onEdit}
    >
      <BlockEditorReadOnly
        content={content}
        className="text-sm text-muted-foreground"
      />

      {isHovered && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <IconEdit className="size-4" />
            Edit Content
          </Button>
        </div>
      )}
    </div>
  );
};
