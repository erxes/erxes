import { IconCashBanknote } from '@tabler/icons-react';
import { Button, Separator } from 'erxes-ui';

export const MSDynamicBreadCrumb = () => {
  return (
    <>
      <Button variant="ghost" className="font-semibold">
        <IconCashBanknote className="w-4 h-4 text-accent-foreground" />
        Settings
      </Button>
      <Separator.Inline />
      <Button variant="ghost" className="hover:bg-transparent font-semibold">
        MSDynamic Configs
      </Button>
    </>
  );
};
