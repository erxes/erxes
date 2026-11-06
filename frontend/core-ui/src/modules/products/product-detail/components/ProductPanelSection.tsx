import { type Icon } from '@tabler/icons-react';
import { Button, Collapsible } from 'erxes-ui';

export const ProductPanelSection = ({
  title,
  icon: Icon,
  count,
  defaultOpen = false,
  disabled = false,
  children,
}: {
  title: string;
  icon: Icon;
  count?: number;
  defaultOpen?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) => (
  <Collapsible defaultOpen={defaultOpen} className="border-t">
    <Collapsible.Trigger asChild>
      <Button
        type="button"
        variant="ghost"
        className="group h-9 w-full justify-start gap-1.5 rounded-none px-0 text-xs font-medium text-accent-foreground hover:bg-transparent [&>svg]:size-3.5"
      >
        <Icon className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="min-w-0 truncate">{title}</span>
        {count !== undefined && (
          <span className="ml-1 text-muted-foreground">{count}</span>
        )}
        <Collapsible.TriggerIcon className="ml-auto size-3.5" />
      </Button>
    </Collapsible.Trigger>
    <Collapsible.Content
      forceMount
      className="min-w-0 pb-3 data-[state=closed]:hidden"
      onSubmit={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (
          event.key === 'Enter' &&
          event.target instanceof HTMLInputElement &&
          event.target.type !== 'file'
        ) {
          event.preventDefault();
        }
      }}
    >
      <fieldset disabled={disabled} className="min-w-0">
        {children}
      </fieldset>
    </Collapsible.Content>
  </Collapsible>
);
