import {
  Combobox,
  Command,
  EnumCursorDirection,
  Popover,
  Skeleton,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { useFormDetail } from '@/forms/hooks/useFormDetail';
import { useFormsList } from '@/forms/hooks/useFormsList';

const SelectTriggerFormValue = ({ formId }: { formId?: string }) => {
  const { t } = useTranslation('frontline');
  const { formDetail, loading } = useFormDetail({ formId: formId || '' });

  if (!formId) {
    return (
      <span className="text-muted-foreground">
        {t('form-trigger-select-form', 'Select a form')}
      </span>
    );
  }

  if (loading) {
    return <Skeleton className="w-24 h-4" />;
  }

  return <span>{formDetail?.name || formDetail?.title || formId}</span>;
};

export const SelectTriggerForm = ({
  channelId,
  value,
  onValueChange,
}: {
  channelId?: string;
  value?: string;
  onValueChange: (formId: string) => void;
}) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);

  const {
    forms = [],
    loading,
    handleFetchMore,
    totalCount,
  } = useFormsList({
    variables: {
      channelId: channelId || undefined,
      searchValue: debouncedSearch || undefined,
    },
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger className="w-full">
        <SelectTriggerFormValue formId={value} />
      </Combobox.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder={t('form-trigger-search-forms', 'Search forms...')}
          />
          <Command.List>
            <Combobox.Empty loading={loading} />
            {forms.map((form) => (
              <Command.Item
                key={form._id}
                value={form._id}
                onSelect={() => {
                  onValueChange(form._id);
                  setOpen(false);
                }}
              >
                {form.name || form.title || form._id}
                <Combobox.Check checked={form._id === value} />
              </Command.Item>
            ))}
            <Combobox.FetchMore
              fetchMore={() =>
                handleFetchMore({ direction: EnumCursorDirection.FORWARD })
              }
              totalCount={totalCount ?? 0}
              currentLength={forms.length}
            />
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
