import { Icon, IconAddressBook } from '@tabler/icons-react';
import { ScrollArea, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const RelationWidgetEmptyState = ({
  icon: EmptyIcon,
  message,
  children,
}: {
  icon: Icon;
  message: React.ReactNode;
  children?: React.ReactNode;
}) => (
  <div className="flex flex-auto flex-col gap-4 justify-center items-center text-muted-foreground">
    <div className="border border-dashed p-6 bg-background rounded-xl">
      <EmptyIcon />
    </div>
    <span className="text-sm">{message}</span>
    {children}
  </div>
);

// The header and scrolling list every relation widget shows once it has items.
export const RelationWidgetList = ({
  label,
  actions,
  children,
}: {
  label: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <>
    <div
      data-side-menu-header=""
      className="h-11 px-4 flex items-center gap-2 flex-none bg-background justify-between"
    >
      <span className="font-medium text-primary">{label}</span>
      {actions && <div className="flex gap-2 items-center">{actions}</div>}
    </div>
    <Separator />
    <ScrollArea className="flex-auto">
      <div className="flex flex-col gap-4 p-4">{children}</div>
    </ScrollArea>
  </>
);

// Records that reach the host only through its customers and companies.
export const RelationWidgetContactsSection = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'widgets' });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs font-medium text-accent-foreground">
        <IconAddressBook className="size-4" />
        {t('through-contacts', 'Through contacts')}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
};
