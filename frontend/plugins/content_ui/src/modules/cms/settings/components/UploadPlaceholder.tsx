import { IconUpload } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { ComponentType } from 'react';

export const UploadPlaceholder = ({
  icon: Icon,
  label,
  hint,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  hint: string;
  onClick: () => void;
}) => (
  <div className="flex items-center gap-3 rounded-lg border border-dashed bg-muted/30 p-3">
    <div className="flex size-11 flex-none items-center justify-center rounded-md bg-muted text-muted-foreground">
      <Icon className="size-5" />
    </div>
    <div className="min-w-0 flex-1">
      <div className="text-sm font-semibold">{label}</div>
      <div className="text-xs text-muted-foreground">{hint}</div>
    </div>
    <Button variant="secondary" size="sm" onClick={onClick}>
      <IconUpload />
      Upload
    </Button>
  </div>
);
