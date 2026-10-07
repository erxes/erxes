import { IconSitemap } from '@tabler/icons-react';
import { Button } from 'erxes-ui';

export function StructureSettingsBreadcrumb() {
  return (
    <Button variant="ghost" className="font-semibold">
      <IconSitemap className="w-4 h-4 text-accent-foreground" />
      Structure
    </Button>
  );
}
