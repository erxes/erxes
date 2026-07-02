import { IconCircleCheck, IconCircleDashed, IconSquareToggle } from "@tabler/icons-react"
import { Badge, Combobox, Command, Filter, Popover, useFilterContext, useQueryState } from "erxes-ui"
import { useState } from "react";
import { useTranslation } from "react-i18next";

const BarItem = () => {
  const { t } = useTranslation('frontline');
  const [query, setQuery] = useQueryState<string | null>('status');
  const [open, setOpen] = useState(false);
  const handleSelect = (value: string) => {
    setQuery(value);
    setOpen(false);
  };
  return (
    <Filter.BarItem queryKey="status">
      <Filter.BarName>
        <IconSquareToggle />
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey={'status'} className="capitalize">
            {query || ''}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <Command>
            <Command.List>
              <Command.Group>
                <Command.Item onSelect={handleSelect} value="active">{t('active')}</Command.Item>
                <Command.Item onSelect={handleSelect} value="archived">{t('archived')}</Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
}

const View = () => {
  const { t } = useTranslation('frontline');
  const [_, setQuery] = useQueryState<string | null>('status');
  const { resetFilterState } = useFilterContext();
  const handleSelect = (value: string) => {
    setQuery(value);
    resetFilterState();
  };
  return (
    <Filter.View filterKey={'status'}>
      <Combobox.Content>
        <Command>
          <Command.List>
            <Command.Group>
              <Command.Item onSelect={handleSelect} value="active">{t('active')}</Command.Item>
              <Command.Item onSelect={handleSelect} value="archived">{t('archived')}</Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Filter.View>
  )
}

const Item = () => {
  const { t } = useTranslation('frontline');
  return (
    <Filter.Item value="status">
      <IconSquareToggle />
      {t('status')}
    </Filter.Item>
  )
}

const StatusBadge = ({ status }: { status: string }) => {
  return (
    <Badge variant={status === 'active' ? 'success' : 'secondary'}>
      {status === 'active' ? <IconCircleCheck size={16} /> : <IconCircleDashed size={16} />}
      {status}
    </Badge>
  )
}

export const FormStatus = Object.assign({ BarItem, View, Item, Badge: StatusBadge });
