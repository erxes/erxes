import type { EmailTemplate } from 'ui-modules';

export interface DirectMailTemplateSelectorState {
  disabled: boolean;
  selectTemplate: (template: EmailTemplate) => Promise<void>;
}
