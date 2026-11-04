import { IconBuilding, IconPlus, IconUser } from '@tabler/icons-react';
import {
  Button,
  cn,
  Combobox,
  Popover,
  PopoverScoped,
  Spinner,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ContactRecordChip,
  PanelField,
  SelectCompany,
  SelectCustomer,
  useManageRelations,
  usePermissionCheck,
  useRelations,
  useSidePanel,
} from 'ui-modules';

/** Edits reciprocal contact links in the detail rows, preserving multiple links. */
export const ContactPanelRelationField = ({
  contentType,
  contentId,
}: {
  contentType: 'core:customer' | 'core:company';
  contentId: string;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const [open, setOpen] = useState(false);
  const { openRecord } = useSidePanel();
  const { hasActionPermission } = usePermissionCheck();
  const kind = contentType === 'core:customer' ? 'company' : 'customer';
  const relatedContentType =
    kind === 'company' ? 'core:company' : 'core:customer';
  const variables = { contentType, contentId, relatedContentType };
  const { relatedIds, loading, error, refetch } = useRelations({ variables });
  const { manageRelations, loading: saving } = useManageRelations();
  const label =
    kind === 'company' ? t('company', 'Company') : t('customer', 'Customer');
  const addLabel =
    kind === 'company'
      ? t('add-company', 'Add company')
      : t('add-customer', 'Add customer');
  const hasLinks = relatedIds.length > 0;
  const moreCount = Math.max(0, relatedIds.length - 1);
  const editLabel =
    kind === 'company'
      ? t('edit-companies', 'Edit companies')
      : t('edit-customers', 'Edit customers');
  const canEdit = hasActionPermission('contactsUpdate');

  const handleChange = (value: string[] | string) => {
    setOpen(false);
    manageRelations({
      ...variables,
      relatedContentIds: Array.isArray(value) ? value : value ? [value] : [],
    }).catch(() => undefined);
  };

  const picker =
    kind === 'company' ? (
      <SelectCompany.Provider
        mode="multiple"
        value={relatedIds}
        onValueChange={handleChange}
      >
        <SelectCompany.Content />
      </SelectCompany.Provider>
    ) : (
      <SelectCustomer.Provider
        mode="multiple"
        value={relatedIds}
        onValueChange={handleChange}
      >
        <SelectCustomer.Content />
      </SelectCustomer.Provider>
    );

  return (
    <PanelField
      icon={kind === 'company' ? IconBuilding : IconUser}
      label={label}
    >
      {loading ? (
        <Spinner containerClassName="h-7 justify-start px-2" size="sm" />
      ) : error ? (
        <div className="px-2 text-xs text-destructive">
          {t('relations-error', 'Unable to load linked records')}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              refetch().catch(() => undefined);
            }}
          >
            {t('retry', 'Try again')}
          </Button>
        </div>
      ) : (
        <div className="group/relations flex min-h-7 min-w-0 items-center gap-1 px-1">
          <div className="flex min-w-0 overflow-hidden">
            {relatedIds.slice(0, 1).map((id) => (
              <ContactRecordChip
                key={id}
                kind={kind}
                id={id}
                onOpen={() =>
                  openRecord(
                    { contentType: relatedContentType, contentId: id },
                    { stack: true },
                  )
                }
              />
            ))}
          </div>
          {canEdit || moreCount > 0 ? (
            <PopoverScoped
              scope={`contact-detail.${contentType}.${contentId}.${kind}`}
              open={open}
              onOpenChange={setOpen}
            >
              <Popover.Trigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  data-panel-inline=""
                  disabled={saving}
                  aria-label={hasLinks ? editLabel : addLabel}
                  className={cn(
                    'h-6 shrink-0 px-1.5 text-xs font-normal text-muted-foreground',
                    hasLinks &&
                      !moreCount &&
                      'opacity-0 group-hover/relations:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100',
                    moreCount > 0 && 'bg-muted hover:bg-accent',
                  )}
                >
                  {saving ? (
                    <Spinner size="sm" />
                  ) : moreCount > 0 ? (
                    `+${moreCount}`
                  ) : hasLinks ? (
                    <IconPlus className="size-3.5" />
                  ) : (
                    <>
                      <IconPlus className="size-3.5" />
                      {addLabel}
                    </>
                  )}
                </Button>
              </Popover.Trigger>
              <Combobox.Content>
                {canEdit ? (
                  picker
                ) : (
                  <div className="flex flex-col items-start gap-1 p-2">
                    {relatedIds.map((id) => (
                      <ContactRecordChip
                        key={id}
                        kind={kind}
                        id={id}
                        onOpen={() =>
                          openRecord(
                            { contentType: relatedContentType, contentId: id },
                            { stack: true },
                          )
                        }
                      />
                    ))}
                  </div>
                )}
              </Combobox.Content>
            </PopoverScoped>
          ) : !relatedIds.length ? (
            <span className="px-1 text-xs text-muted-foreground">
              {t('not-specified', 'Not specified')}
            </span>
          ) : null}
        </div>
      )}
    </PanelField>
  );
};
