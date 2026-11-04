import { IconNotes } from '@tabler/icons-react';
import { extensionComponent } from 'erxes-sdk/react';
import type { IExtensionUIConfig } from 'erxes-ui';

export const CONFIG: IExtensionUIConfig = {
  id: 'ext-template',
  label: 'Notes',
  icon: IconNotes,
  host: 'ext-template-host',
  pages: [
    {
      label: 'Notes',
      path: 'notes',
      icon: IconNotes,
      component: extensionComponent(() =>
        import('./Notes').then((m) => m.Notes),
      ),
    },
  ],
};
