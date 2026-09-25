import { useAutomation } from '@/automations/context/AutomationProvider';
import { IconArrowBackUp } from '@tabler/icons-react';
import { Button, Separator, Tooltip } from 'erxes-ui';
import { Link } from 'react-router';

export const AutomationDuplicatedFromLink = () => {
  const { detail } = useAutomation();
  const { duplicatedFrom, duplicatedFromName } = detail || {};

  if (!duplicatedFrom) {
    return null;
  }

  const label = duplicatedFromName || 'the original';

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
          <Tooltip.Content>Duplicated from “{label}” — open it</Tooltip.Content>
        </Tooltip>
      </Tooltip.Provider>
    </>
  );
};
