import { cn, Sheet, useQueryState } from 'erxes-ui';
import { AdjustClosingEntryDetail } from './AdjustClosingDetail';

export const AdjustClosingDetailSheet = ({
  children,
  queryKey,
  title,
}: {
  children: React.ReactNode;
  queryKey: string;
  title: string;
}) => {
  const [open, setOpen] = useQueryState<string>(queryKey);
  return (
    <Sheet open={!!open} onOpenChange={() => setOpen(null)}>
      <Sheet.View
        className={cn(
          'p-0 flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none sm:max-w-5xl',
        )}
      >
        <Sheet.Header className="border-b py-2 pl-8 flex-row items-center space-y-0 gap-3">
          <Sheet.Title>{title}</Sheet.Title>
          <Sheet.Close tabIndex={-1} />
          <Sheet.Description className="sr-only">{title}</Sheet.Description>
        </Sheet.Header>
        <Sheet.Content className="border-b-0 rounded-b-none overflow-hidden">
          {children}
          <AdjustClosingEntryDetail />
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
