import { useQuery } from '@apollo/client';
import {
  Badge,
  Combobox,
  Command,
  Form,
  PopoverScoped,
  TextOverflowTooltip,
} from 'erxes-ui';
import { TFunction } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GET_HELP_CENTER_FORM_OPTIONS } from '@/helpcenter/graphql/queries/getHelpCenterFormOptions';

const FORM_OPTIONS_LIMIT = 100;

const MAX_VISIBLE_BADGES = 3;

type TFormOption = {
  _id: string;
  name?: string;
  title?: string;
};

const getFormName = (form: TFormOption, t: TFunction) =>
  form.name || form.title || t('unnamed-form', 'Untitled form');

const SelectedFormsValue = ({
  selectedForms,
  count,
  loading,
  t,
}: {
  selectedForms: TFormOption[];
  count: number;
  loading: boolean;
  t: TFunction;
}) => {
  if (!count) {
    return <Combobox.Value placeholder={t('select', 'Select...')} />;
  }

  if (!selectedForms.length) {
    return (
      <Combobox.Value
        loading={loading}
        value={t('n-selected', '{{count}} selected', { count })}
      />
    );
  }

  const visibleForms = selectedForms.slice(0, MAX_VISIBLE_BADGES);
  const hiddenCount = count - visibleForms.length;

  return (
    <div className="flex overflow-hidden flex-1 gap-1 items-center min-w-0">
      {visibleForms.map((form) => (
        <Badge key={form._id} variant="secondary" className="max-w-40">
          <TextOverflowTooltip value={getFormName(form, t)} />
        </Badge>
      ))}
      {hiddenCount > 0 && <Badge variant="secondary">+{hiddenCount}</Badge>}
    </div>
  );
};

export const SelectHelpCenterForms = ({
  value,
  channelId,
  onValueChange,
  scope,
}: {
  value: string[];
  channelId: string;
  onValueChange: (formIds: string[]) => void;
  scope?: string;
}) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);

  const { data, loading, error } = useQuery<{
    forms: { list: TFormOption[] | null } | null;
  }>(GET_HELP_CENTER_FORM_OPTIONS, {
    variables: { channelId, limit: FORM_OPTIONS_LIMIT },
    skip: !channelId,
    fetchPolicy: 'cache-and-network',
  });

  const forms = channelId ? (data?.forms?.list ?? []) : [];
  const selectedForms = value
    .map((formId) => forms.find((form) => form._id === formId))
    .filter((form): form is TFormOption => !!form);

  const toggleForm = (formId: string) =>
    onValueChange(
      value.includes(formId)
        ? value.filter((selectedId) => selectedId !== formId)
        : [...value, formId],
    );

  return (
    <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
      <Form.Control>
        <Combobox.Trigger className="w-full shadow-xs" disabled={!channelId}>
          <SelectedFormsValue
            selectedForms={selectedForms}
            count={value.length}
            loading={loading}
            t={t}
          />
        </Combobox.Trigger>
      </Form.Control>
      <Combobox.Content>
        <Command>
          <Command.Input placeholder={t('search', 'Search')} focusOnMount />
          {selectedForms.length > 0 && (
            <>
              <div className="flex flex-wrap gap-2 p-2">
                {selectedForms.map((form) => (
                  <Badge
                    key={form._id}
                    variant="secondary"
                    className="max-w-56"
                    onClose={() => toggleForm(form._id)}
                  >
                    <TextOverflowTooltip value={getFormName(form, t)} />
                  </Badge>
                ))}
              </div>
              <Command.Separator />
            </>
          )}
          <Command.List>
            {loading || error ? (
              <Combobox.Empty loading={loading} error={error} />
            ) : (
              <Command.Empty>
                <p className="p-8 text-center text-muted-foreground">
                  {channelId
                    ? t('no-forms-found', 'No forms found')
                    : t('channel-not-selected', 'Channel not selected')}
                </p>
              </Command.Empty>
            )}
            {forms.map((form) => {
              const formName = getFormName(form, t);

              return (
                <Command.Item
                  key={form._id}
                  value={form._id}
                  keywords={[formName]}
                  onSelect={() => toggleForm(form._id)}
                >
                  <TextOverflowTooltip
                    value={formName}
                    className="flex-auto w-auto font-medium"
                  />
                  <Combobox.Check checked={value.includes(form._id)} />
                </Command.Item>
              );
            })}
          </Command.List>
        </Command>
      </Combobox.Content>
    </PopoverScoped>
  );
};
