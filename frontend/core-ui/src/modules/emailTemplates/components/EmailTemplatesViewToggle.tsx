import {
  emailTemplatesViewAtom,
  TEmailTemplatesView,
} from '@/emailTemplates/states/emailTemplatesViewState';
import { IconLayoutGrid, IconList } from '@tabler/icons-react';
import { Button, ToggleGroup } from 'erxes-ui';
import { useAtom } from 'jotai';

export const EmailTemplatesViewToggle = () => {
  const [view, setView] = useAtom(emailTemplatesViewAtom);

  return (
    <ToggleGroup
      type="single"
      value={view}
      onValueChange={(value) => value && setView(value as TEmailTemplatesView)}
      className="gap-1"
    >
      <ToggleGroup.Item value="grid" asChild>
        <Button variant="ghost" size="icon" aria-label="Grid view">
          <IconLayoutGrid className="size-4" />
        </Button>
      </ToggleGroup.Item>
      <ToggleGroup.Item value="table" asChild>
        <Button variant="ghost" size="icon" aria-label="Table view">
          <IconList className="size-4" />
        </Button>
      </ToggleGroup.Item>
    </ToggleGroup>
  );
};
