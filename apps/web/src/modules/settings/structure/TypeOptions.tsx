import type { UnitType } from '@erxes/core-contract';
import { IconSettings } from '@tabler/icons-react';
import { Button, Command } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { TypeIcon } from './TypeIcon';

/** The unit types a picker offers, searchable, with a link to manage them. */
export const TypeOptions = ({
  types,
  onPick,
}: {
  types: UnitType[];
  onPick: (type: UnitType) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });

  return (
    <>
      <Command>
        <Command.Input placeholder={t('search-types', 'Search types')} />
        <Command.List>
          <Command.Empty>{t('no-type-fits', 'No unit type fits here.')}</Command.Empty>
          {types.map((type) => (
            <Command.Item
              key={type.id}
              value={`${type.name} ${type.id}`}
              onSelect={() => onPick(type)}
            >
              <TypeIcon type={type} size="sm" />
              <span className="truncate">{type.name}</span>
            </Command.Item>
          ))}
        </Command.List>
      </Command>
      <div className="border-t p-1">
        <Button variant="ghost" size="sm" render={<Link to={paths.settings.unitTypes} />}>
          <IconSettings />
          {t('manage-unit-types', 'Manage unit types')}
        </Button>
      </div>
    </>
  );
};
