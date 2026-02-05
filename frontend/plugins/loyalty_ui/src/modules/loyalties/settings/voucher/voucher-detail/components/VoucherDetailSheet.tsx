import {
  cn,
  Resizable,
  ScrollArea,
  Sheet,
  Spinner,
  useQueryState,
  Button,
  Label,
} from 'erxes-ui';
import { IconMoodAnnoyed } from '@tabler/icons-react';

export const VoucherDetailSheet = ({
  children,
  queryKey,
}: {
  children: React.ReactNode;
  queryKey: string;
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
          <Sheet.Close tabIndex={-1} />
        </Sheet.Header>
        <Sheet.Content className="border-b-0 rounded-b-none overflow-hidden">
          {children}
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};

export const VoucherDetailLayout = ({
  children,
  loading,
  notFound,
  title,
  actions,
}: {
  children: React.ReactNode;
  loading: boolean;
  notFound: boolean;
  title: string;
  actions?: React.ReactNode;
}) => {
  if (loading) {
    return <Spinner />;
  }
  if (notFound) {
    return <NotFound title={title} />;
  }
  return (
    <Resizable.PanelGroup
      direction="horizontal"
      className="flex-auto min-h-full overflow-hidden"
    >
      <Resizable.Panel>
        <ScrollArea className="h-full">{children}</ScrollArea>
      </Resizable.Panel>
      {actions}
    </Resizable.PanelGroup>
  );
};

const NotFound = ({ title }: { title: string }) => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-3">
        <IconMoodAnnoyed
          className="size-12 text-accent-foreground"
          strokeWidth={1.5}
        />
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold w-full text-center">
            {title} details not found
          </h2>
          <p className="text-accent-foreground w-full text-center">
            There seems to be no data on this {title}
          </p>
        </div>
        <Sheet.Close asChild>
          <Button variant="outline">Close</Button>
        </Sheet.Close>
      </div>
    </div>
  );
};

export const VoucherDataListItem = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => {
  return (
    <fieldset className="space-y-2">
      <Label asChild>
        <legend>{label}</legend>
      </Label>
      {children}
    </fieldset>
  );
};
