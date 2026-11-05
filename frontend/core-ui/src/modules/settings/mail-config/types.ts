import { z } from 'zod';
import {
  MAIL_SENDING_SCHEMA,
  MAIL_TEMPLATE_SCHEMA,
} from '@/settings/mail-config/schema';

type TMailSendingForm = z.infer<typeof MAIL_SENDING_SCHEMA>;

type TMailTemplateForm = z.infer<typeof MAIL_TEMPLATE_SCHEMA>;

interface TInput {
  name: string;
  inputType: 'input' | 'select' | 'editor';
  type?: string;
  label?: string;
  description?: string;
  options?: string[];
  className?: string;
}

type TFormData = {
  [key: string]: TInput[];
};

export { TMailSendingForm, TMailTemplateForm, TInput, TFormData };
