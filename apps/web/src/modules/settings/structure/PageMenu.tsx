import {
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconCategory,
  IconDots,
  IconFocusCentered,
} from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { useWorkspace } from './context';

/** Show inactive units, open or close what is loaded, fit the chart, and the unit types. */
export const PageMenu = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });

  const { view, includeInactive, setIncludeInactive, expandAll, collapseAll, requestFit } =
    useWorkspace();

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger
        render={
          <Button variant="ghost" size="icon" aria-label={t('more-options', 'More options')} />
        }
      >
        <IconDots />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="min-w-52">
        <DropdownMenu.CheckboxItem checked={includeInactive} onCheckedChange={setIncludeInactive}>
          {t('show-inactive', 'Show inactive units')}
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onClick={expandAll}>
          <IconArrowsMaximize />
          {t('expand-all', 'Expand all')}
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={collapseAll}>
          <IconArrowsMinimize />
          {t('collapse-all', 'Collapse all')}
        </DropdownMenu.Item>
        {view === 'chart' && (
          <DropdownMenu.Item onClick={requestFit}>
            <IconFocusCentered />
            {t('fit-to-screen', 'Fit to screen')}
          </DropdownMenu.Item>
        )}
        <DropdownMenu.Separator />
        <DropdownMenu.LinkItem render={<Link to={paths.settings.unitTypes} />}>
          <IconCategory />
          {t('unit-types', 'Unit types')}
        </DropdownMenu.LinkItem>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
