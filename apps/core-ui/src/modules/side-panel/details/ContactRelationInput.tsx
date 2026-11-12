import { IconPlus } from '@tabler/icons-react';
import { Button, cn, Combobox, Popover, PopoverScoped, Spinner } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ContactRecordChip,
  SelectContactContent,
  type TContactKind,
} from '~/modules/contacts/components/ContactPicker';
import { useSidePanel } from '../useSidePanel';

const ContactRelationTriggerLabel = ({
  saving,
  moreCount,
  hasLinks,
  addLabel,
}: {
  saving: boolean;
  moreCount: number;
  hasLinks: boolean;
  addLabel: string;
}) => {
  if (saving) return <Spinner size="sm" />;

  if (moreCount > 0) return <span>+{moreCount}</span>;

  return (
    <>
      <IconPlus className="size-3.5" aria-hidden="true" />
      {!hasLinks && addLabel}
    </>
  );
};

const ContactRelationPicker = ({
  kind,
  relatedIds,
  onValueChange,
  onOpen,
}: {
  kind: TContactKind;
  relatedIds: string[];
  onValueChange?: (value: string[]) => void;
  onOpen: (id: string) => void;
}) => {
  if (!onValueChange) {
    return (
      <div className="flex flex-col items-start gap-1 p-2">
        {relatedIds.map((id) => (
          <ContactRecordChip key={id} kind={kind} id={id} onOpen={() => onOpen(id)} />
        ))}
      </div>
    );
  }

  return <SelectContactContent kind={kind} value={relatedIds} onValueChange={onValueChange} />;
};

/** The button after the first chip: `+N` more, or add, opening the picker. */
const ContactRelationPopover = ({
  kind,
  value,
  scope,
  disabled,
  onValueChange,
  onOpen,
}: {
  kind: TContactKind;
  value: string[];
  scope: string;
  disabled: boolean;
  onValueChange?: (ids: string[]) => void;
  onOpen: (id: string) => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const [open, setOpen] = useState(false);
  const hasLinks = value.length > 0;
  const moreCount = Math.max(0, value.length - 1);

  const addLabel =
    kind === 'company' ? t('add-company', 'Add company') : t('add-customer', 'Add customer');

  const editLabel =
    kind === 'company'
      ? t('edit-companies', 'Edit companies')
      : t('edit-customers', 'Edit customers');

  return (
    <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="ghost"
          size="sm"
          data-panel-inline=""
          disabled={disabled}
          aria-label={hasLinks ? editLabel : addLabel}
          className={cn(
            'h-6 shrink-0 gap-1.5 px-1 text-xs font-normal text-muted-foreground [&>svg]:size-3.5',
            hasLinks &&
              !moreCount &&
              'opacity-0 group-hover/relations:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100',
            moreCount > 0 && 'bg-muted hover:bg-accent',
          )}
        >
          <ContactRelationTriggerLabel
            saving={disabled}
            moreCount={moreCount}
            hasLinks={hasLinks}
            addLabel={addLabel}
          />
        </Button>
      </Popover.Trigger>
      <Combobox.Content>
        <ContactRelationPicker
          kind={kind}
          relatedIds={value}
          onValueChange={
            onValueChange &&
            ((ids) => {
              if (!disabled) onValueChange(ids);
            })
          }
          onOpen={onOpen}
        />
      </Combobox.Content>
    </PopoverScoped>
  );
};

/** The same compact contact picker for saved records and unsaved drafts. */
export const ContactRelationInput = ({
  kind,
  value,
  onValueChange,
  scope,
  disabled = false,
}: {
  kind: TContactKind;
  value: string[];
  onValueChange?: (ids: string[]) => void;
  scope: string;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const { openRecord } = useSidePanel();
  const relatedContentType = kind === 'company' ? 'core:company' : 'core:customer';

  const openContact = (id: string) =>
    openRecord({ contentType: relatedContentType, contentId: id }, { stack: true });

  let control = null;

  if (onValueChange || value.length > 1) {
    control = (
      <ContactRelationPopover
        kind={kind}
        value={value}
        scope={scope}
        disabled={disabled}
        onValueChange={onValueChange}
        onOpen={openContact}
      />
    );
  } else if (!value.length) {
    control = (
      <span className="px-1 text-xs text-muted-foreground">
        {t('not-specified', 'Not specified')}
      </span>
    );
  }

  return (
    <div className="group/relations flex min-h-7 min-w-0 items-center gap-1 px-1">
      {value.slice(0, 1).map((id) => (
        <div key={id} className="flex min-w-0 overflow-hidden">
          <ContactRecordChip kind={kind} id={id} onOpen={() => openContact(id)} />
        </div>
      ))}
      {control}
    </div>
  );
};
