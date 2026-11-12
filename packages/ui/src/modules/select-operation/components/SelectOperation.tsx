import { Badge } from 'erxes-ui/components/badge';
import { Button } from 'erxes-ui/components/button';
import { Combobox } from 'erxes-ui/components/combobox';
import { Form } from 'erxes-ui/components/form';
import { Popover } from 'erxes-ui/components/popover';

import { Filter } from 'erxes-ui/modules/filter/components/Filter';
import { RecordTableInlineCell } from 'erxes-ui/modules/record-table/components/RecordTableCellInline';

const FORM_CONTROL_SELECTOR = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  '[contenteditable="true"]',
  '[tabindex]',
].join(',');

const getFocusableFormControls = (form: HTMLFormElement) =>
  Array.from(form.querySelectorAll<HTMLElement>(FORM_CONTROL_SELECTOR)).filter(
    (element) =>
      element.tabIndex >= 0 &&
      !element.hasAttribute('disabled') &&
      element.getAttribute('aria-hidden') !== 'true' &&
      element.getClientRects().length > 0,
  );

const getPopoverTrigger = (content: HTMLElement) => {
  if (!content.id) {
    return;
  }

  return Array.from(content.ownerDocument.querySelectorAll<HTMLElement>('[aria-controls]')).find(
    (element) => element.getAttribute('aria-controls') === content.id,
  );
};

const handleFormContentTab = (event: React.KeyboardEvent<HTMLDivElement>) => {
  if (event.key !== 'Tab' || event.defaultPrevented) {
    return;
  }

  const trigger = getPopoverTrigger(event.currentTarget);
  const form = trigger?.closest('form');

  if (!trigger || !form) {
    return;
  }

  const controls = getFocusableFormControls(form);
  const triggerIndex = controls.indexOf(trigger);

  if (triggerIndex === -1) {
    return;
  }

  const nextControl = controls[triggerIndex + (event.shiftKey ? -1 : 1)];

  if (!nextControl) {
    return;
  }

  event.preventDefault();
  trigger.click();
  requestAnimationFrame(() => nextControl.focus());
};

export enum SelectTriggerVariant {
  TABLE = 'table',
  CARD = 'card',
  DETAIL = 'detail',
  FORM = 'form',
  FILTER = 'filter',
  ICON = 'icon',
  DEFAULT = 'default',
}

export const SelectTriggerOperation = ({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: `${SelectTriggerVariant}`;
}) => {
  if (variant === 'table') {
    return (
      <RecordTableInlineCell.Trigger className="gap-1">{children}</RecordTableInlineCell.Trigger>
    );
  }

  if (variant === 'card') {
    return (
      <Popover.Trigger asChild>
        <Badge
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {children}
        </Badge>
      </Popover.Trigger>
    );
  }

  if (variant === 'filter') {
    return (
      <Popover.Trigger asChild>
        <Filter.BarButton>{children}</Filter.BarButton>
      </Popover.Trigger>
    );
  }

  if (variant === 'form') {
    return (
      <Form.Control>
        <Combobox.TriggerBase className="w-fit h-7 font-medium max-w-64">
          {children}
        </Combobox.TriggerBase>
      </Form.Control>
    );
  }

  if (variant === 'icon') {
    return (
      <Popover.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {children}
        </Button>
      </Popover.Trigger>
    );
  }

  return (
    <Combobox.TriggerBase className="w-fit h-7 shadow-none py-0 pr-0">
      {children}
    </Combobox.TriggerBase>
  );
};

export const SelectOperationContent = ({
  variant,
  children,
}: {
  variant: `${SelectTriggerVariant}`;
  children: React.ReactNode;
}) => {
  if (variant === 'table') {
    return <RecordTableInlineCell.Content>{children}</RecordTableInlineCell.Content>;
  }

  return (
    <Combobox.Content
      sideOffset={variant === 'card' ? 4 : 8}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={variant === 'form' ? handleFormContentTab : undefined}
    >
      {children}
    </Combobox.Content>
  );
};
