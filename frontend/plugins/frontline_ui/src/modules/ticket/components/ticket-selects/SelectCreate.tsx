import { IconChevronLeft, IconPlus } from '@tabler/icons-react';
import { Button, Command, Separator, Spinner } from 'erxes-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const canCreateFromSearch = (search: string, names: string[]) => {
  const trimmed = search.trim().toLowerCase();

  if (!trimmed) return false;

  return !names.some((name) => name.trim().toLowerCase() === trimmed);
};

export const SelectCreateCommandItem = ({
  search,
  label,
  onSelect,
}: {
  search: string;
  label: string;
  onSelect: (name: string) => void;
}) => (
  <Command.Item
    forceMount
    value={`create-new-${search}`}
    onSelect={() => onSelect(search.trim())}
    className="font-medium"
  >
    <IconPlus />
    <span className="truncate">
      {label}: "{search.trim()}"
    </span>
  </Command.Item>
);

export const SelectCreateContainer = ({
  title,
  onBack,
  onSubmit,
  loading,
  children,
}: {
  title: string;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
  children: React.ReactNode;
}) => {
  const { t } = useTranslation('frontline');

  // The select lives inside the ticket form, and React bubbles submit events
  // through portals, so the nested form must not reach the outer one.
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="overflow-auto">
      <div className="flex items-center p-1">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="pl-1 gap-1"
        >
          <IconChevronLeft />
          <h6>{title}</h6>
        </Button>
      </div>
      <Separator />
      <div className="flex flex-col gap-3 p-3">{children}</div>
      <Separator />
      <div className="p-3">
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Spinner /> : t('create', 'Create')}
        </Button>
      </div>
    </form>
  );
};
