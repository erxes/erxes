import { IconCircleDashedCheck } from '@tabler/icons-react';
import { Label } from 'erxes-ui';

export const SendEmailConfigFormRow = ({
  title,
  isDone,
  subContent,
  children,
}: {
  title: string;
  isDone?: boolean;
  subContent?: string;
  children: React.ReactNode;
}) => {
  return (
    <>
      <div className="space-y-1 text-left">
        <div className="flex items-center space-x-2">
          <Label className="text-sm font-medium">{title}</Label>
          {isDone && <IconCircleDashedCheck className="text-success size-4" />}
        </div>
        {subContent && (
          <p className="font-mono text-muted-foreground text-xs">
            {subContent}
          </p>
        )}
      </div>
      <div className="p-2 border-b">{children}</div>
    </>
  );
};
