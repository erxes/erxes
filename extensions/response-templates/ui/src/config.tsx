import { IconMessageReply } from '@tabler/icons-react';
import { extensionComponent } from 'erxes-sdk/react';
import type { IExtensionUIConfig } from 'erxes-ui';

export const CONFIG: IExtensionUIConfig = {
  id: 'response-templates',
  label: 'Response templates',
  icon: IconMessageReply,
  host: 'frontline',
  pages: [
    {
      label: 'Response templates',
      path: 'response-templates',
      icon: IconMessageReply,
      component: extensionComponent(() =>
        import('./ResponseTemplates').then((m) => m.ResponseTemplates),
      ),
    },
  ],
  composerActions: [
    {
      id: 'insert',
      label: 'Insert a response template',
      icon: IconMessageReply,
      component: extensionComponent(() =>
        import('./ResponseTemplatePicker').then(
          (m) => m.ResponseTemplatePicker,
        ),
      ),
    },
  ],
};
