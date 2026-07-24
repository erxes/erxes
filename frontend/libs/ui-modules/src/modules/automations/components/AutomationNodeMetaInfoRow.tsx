import { cn } from 'erxes-ui';

export const AutomationNodeMetaInfoRow = ({
  fieldName,
  content,
  className,
}: {
  fieldName: string;
  content: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'flex justify-between items-center text-foreground text-xs w-max',
        className,
      )}
    >
      <span className="font-mono">{fieldName}:</span>
      <span className="font-mono min-w-0">{content ? content : 'Empty'}</span>
    </div>
  );
};
