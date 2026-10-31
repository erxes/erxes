import { IconPencil, IconPlus } from '@tabler/icons-react';
import { Button, Combobox, Popover, Spinner } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ContactRecordChip,
  PanelField,
  SelectCompany,
  SelectCustomer,
  TRelationEntity,
  useManageRelations,
  usePermissionCheck,
  useRelations,
  useSidePanel,
} from 'ui-modules';

export const ContactPanelRelations = ({
  contentType,
  contentId,
}: TRelationEntity) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const kind = contentType === 'core:customer' ? 'company' : 'customer';
  const relatedContentType = `core:${kind}`;
  const { relatedIds, loading, error, refetch } = useRelations({
    variables: { contentType, contentId, relatedContentType },
  });
  const { manageRelations, loading: saving } = useManageRelations();
  const { hasActionPermission } = usePermissionCheck();
  const { openRecord } = useSidePanel();
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState<string[]>([]);
  const label =
    kind === 'company'
      ? t('companies', 'Companies')
      : t('customers', 'Customers');

  const save = async () => {
    const result = await manageRelations({
      contentType,
      contentId,
      relatedContentType,
      relatedContentIds: selection,
    });
    if (result.data?.manageRelations) setOpen(false);
  };

  const onValueChange = (value: string[] | string) =>
    setSelection(Array.isArray(value) ? value : value ? [value] : []);

  return (
    <PanelField label={label}>
      {loading ? (
        <Spinner containerClassName="py-1" />
      ) : error ? (
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          {t('retry', 'Retry')}
        </Button>
      ) : (
        <div className="flex flex-wrap items-center gap-1 px-1">
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
          {hasActionPermission('contactsUpdate') ? (
            <Popover
              open={open}
              onOpenChange={(next) => {
                if (saving) return;
                if (next) setSelection(relatedIds);
                setOpen(next);
              }}
            >
              <Popover.Trigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-1 text-xs text-muted-foreground"
                  aria-label={label}
                  data-panel-inline=""
                >
                  {relatedIds.length ? <IconPencil /> : <IconPlus />}
                  {!relatedIds.length && label}
                </Button>
              </Popover.Trigger>
              <Combobox.Content>
                <div className={saving ? 'pointer-events-none opacity-60' : ''}>
                  {kind === 'company' ? (
                    <SelectCompany.Provider
                      key={open ? 'open' : 'closed'}
                      mode="multiple"
                      value={selection}
                      onValueChange={onValueChange}
                    >
                      <SelectCompany.Content />
                    </SelectCompany.Provider>
                  ) : (
                    <SelectCustomer.Provider
                      mode="multiple"
                      value={selection}
                      onValueChange={onValueChange}
                    >
                      <SelectCustomer.Content />
                    </SelectCustomer.Provider>
                  )}
                </div>
                <div className="flex justify-end gap-2 border-t p-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={saving}
                    onClick={() => setOpen(false)}
                  >
                    {t('cancel', 'Cancel')}
                  </Button>
                  <Button size="sm" disabled={saving} onClick={save}>
                    {saving ? t('saving', 'Saving…') : t('save', 'Save')}
                  </Button>
                </div>
              </Combobox.Content>
            </Popover>
          ) : (
            !relatedIds.length && (
              <span className="text-muted-foreground">
                {t('not-specified', 'Not specified')}
              </span>
            )
          )}
        </div>
      )}
    </PanelField>
  );
};
