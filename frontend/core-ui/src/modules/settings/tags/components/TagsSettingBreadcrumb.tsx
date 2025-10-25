import { IconTagsFilled } from '@tabler/icons-react';
import { Button, Skeleton, useMultiQueryState } from 'erxes-ui';

export const TagsSettingBreadcrumb = () => {

  return (
    <>
      <Button variant="ghost" className="font-semibold">
        <IconTagsFilled className="size-4 text-accent-foreground" />
        Tags
      </Button>
    </>
  );
};
