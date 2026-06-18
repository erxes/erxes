import { Button, Separator } from 'erxes-ui';
import { IconSandbox } from '@tabler/icons-react';
import { useLocation } from 'react-router-dom';
import { MSDYNAMIC_ROUTES } from './MSDynamicRoutes';

export const MSDynamicBreadCrumb = () => {
  const { pathname } = useLocation();
  return (
    <>
      <Button variant="ghost" className="font-semibold">
        <IconSandbox className="w-4 h-4 mr-1.5" />
        MSDynamic
      </Button>
      <Separator.Inline />
      <Button variant="ghost" className="hover:bg-transparent font-semibold">
        {MSDYNAMIC_ROUTES.find((r) => pathname.includes(r.value))?.label}
      </Button>
    </>
  );
};
