import { IconPlus, IconSearch } from '@tabler/icons-react';
import { Badge, Button, Checkbox, Input, Switch, cn } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ILayoutAsideApi, PropertyAddSheet } from 'ui-modules';
import {
  TTicketLayoutField,
  TTicketLayoutFieldRef,
} from '@/pipelines/hooks/useTicketLayoutFields';
import {
  TICKET_PROPERTY_CONTENT_TYPE,
  toLayoutPropertyId,
} from '@/ticket/constants/createLayout';

type TFieldActions = {
  setCreateOn: (item: TTicketLayoutFieldRef, on: boolean) => Promise<boolean>;
  setRequired: (item: TTicketLayoutFieldRef, on: boolean) => Promise<boolean>;
  saving: boolean;
};

/**
 * Every field the form can hold. The checkbox puts it on this pipeline's form;
 * "Show on create" and "Required" are the Settings → Properties rules, shared
 * by every form, so they save at once.
 */
export const TicketLayoutFieldsPanel = ({
  items,
  api,
  actions,
}: {
  items: TTicketLayoutField[];
  api: ILayoutAsideApi;
  actions: TFieldActions;
}) => {
  const { t } = useTranslation('frontline');
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const shown = items.filter((item) =>
    item.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const toggleOnForm = async (item: TTicketLayoutField, on: boolean) => {
    if (!on) {
      api.unplaceItem(item.id);
      return;
    }

    if (!item.createOn && !(await actions.setCreateOn(item, true))) {
      return;
    }

    api.placeItem(item.id);
  };

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 flex flex-col gap-2 border-b bg-background p-4">
        <span className="text-sm font-medium">{t('fields', 'Fields')}</span>
        <div className="relative">
          <IconSearch className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('search-fields', 'Search fields')}
            className="pl-8"
          />
        </div>
        <div className="flex items-center justify-end gap-3 text-[11px] uppercase text-muted-foreground">
          <span>{t('required', 'Required')}</span>
        </div>
      </div>
      <div className="flex flex-col divide-y">
        {shown.map((item) => {
          const placed = api.placedIds.has(item.id);

          return (
            <div key={item.id} className="flex items-center gap-3 px-4 py-2.5">
              <Checkbox
                checked={placed}
                disabled={item.unsupported || actions.saving}
                onCheckedChange={(checked) =>
                  toggleOnForm(item, checked === true)
                }
                aria-label={t('on-this-form', 'On this form')}
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={cn(
                      'truncate text-sm',
                      (item.unsupported || !item.createOn) &&
                        'text-muted-foreground',
                    )}
                  >
                    {item.name}
                  </span>
                  {placed && item.hiddenInDetail && (
                    <Badge
                      variant="warning"
                      className="shrink-0"
                      title={t(
                        'hidden-in-detail-hint',
                        'Filled on create but not shown on the ticket detail. Turn on Visible in Settings → Properties.',
                      )}
                    >
                      {t('hidden-in-detail', 'Hidden in detail')}
                    </Badge>
                  )}
                </div>
                <span className="truncate text-xs text-muted-foreground">
                  {item.unsupported ? (
                    t(
                      'unsupported-type-hint',
                      'Saved with an unsupported type; fix it in Settings → Properties',
                    )
                  ) : item.createOn ? (
                    item.typeLabel
                  ) : (
                    <>
                      {t('off-for-create', 'Off for create')} ·{' '}
                      <button
                        type="button"
                        className="text-primary hover:underline"
                        disabled={actions.saving}
                        onClick={() => actions.setCreateOn(item, true)}
                      >
                        {t('turn-on', 'Turn on')}
                      </button>
                    </>
                  )}
                </span>
              </div>
              <Switch
                checked={item.required}
                disabled={item.unsupported || actions.saving}
                onCheckedChange={(checked) =>
                  actions.setRequired(item, checked)
                }
                aria-label={t('required', 'Required')}
              />
            </div>
          );
        })}
        {!shown.length && (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            {t('no-fields-found', 'No fields found')}
          </p>
        )}
      </div>
      <div className="border-t p-4">
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => setAdding(true)}
        >
          <IconPlus />
          {t('new-property', 'New property')}
        </Button>
      </div>
      <PropertyAddSheet
        contentType={TICKET_PROPERTY_CONTENT_TYPE}
        open={adding}
        onClose={() => setAdding(false)}
        onCreated={async (fieldId) => {
          // A field made here is meant for this form, so it shows on create.
          await actions.setCreateOn({ kind: 'property', key: fieldId }, true);
          api.placeItem(toLayoutPropertyId(fieldId));
        }}
      />
    </div>
  );
};
