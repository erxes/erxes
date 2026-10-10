import { IconArrowBackUp } from '@tabler/icons-react';
import { Button, Separator, Tooltip } from 'erxes-ui';
import { Link, useSearchParams } from 'react-router';
import { parseAutomationReturnLink } from 'ui-modules';

/** Back to the page that opened this automation from a seed link. */
export const AutomationReturnLink = () => {
  const [searchParams] = useSearchParams();
  const returnTo = parseAutomationReturnLink(searchParams);

  if (!returnTo) {
    return null;
  }

  const label = returnTo.label || 'Back';

  return (
    <>
      <Separator.Inline />
      <Tooltip.Provider>
        <Tooltip>
          <Tooltip.Trigger asChild>
            <Button variant="ghost" size="sm" className="shrink-0" asChild>
              <Link to={returnTo.path}>
                <IconArrowBackUp className="shrink-0" />
                <span className="max-w-40 truncate">{label}</span>
              </Link>
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>Back to “{label}”</Tooltip.Content>
        </Tooltip>
      </Tooltip.Provider>
    </>
  );
};
