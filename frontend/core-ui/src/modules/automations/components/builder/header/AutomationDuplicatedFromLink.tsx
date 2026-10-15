import { useAutomation } from '@/automations/context/AutomationProvider';
import { IconArrowBackUp } from '@tabler/icons-react';
import { Button, Separator, Tooltip } from 'erxes-ui';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

export const AutomationDuplicatedFromLink = () => {
  const { t } = useTranslation('automations');
  const { detail } = useAutomation();
  const { duplicatedFrom, duplicatedFromName } = detail || {};

  if (!duplicatedFrom) {
    return null;
  }

  const label = duplicatedFromName || t('header-the-original');

  return (
    <>
      <Separator.Inline />
      <Tooltip.Provider>
        <Tooltip>
          <Tooltip.Trigger asChild>
            <Button variant="ghost" size="sm" className="shrink-0" asChild>
              <Link to={`/automations/edit/${duplicatedFrom}`}>
                <IconArrowBackUp className="shrink-0" />
                <span className="max-w-40 truncate">{label}</span>
              </Link>
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>
            {t('header-duplicated-from', { name: label })}
          </Tooltip.Content>
        </Tooltip>
      </Tooltip.Provider>
    </>
  );
};
