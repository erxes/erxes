import { TPipelineConfig } from '@/pipelines/types';
import { UseFieldArrayAppend } from 'react-hook-form';

export enum TICKET_FORM_FIELDS_KEY {
  NAME = 'name',
  DESCRIPTION = 'description',
  ATTACHMENT = 'attachment',
  TAGS = 'tags',
}

export const TICKET_FORM_FIELDS = [
  {
    label: 'Name',
    key: TICKET_FORM_FIELDS_KEY.NAME,
    path: 'formFields.name',
  },
  {
    label: 'Description',
    key: TICKET_FORM_FIELDS_KEY.DESCRIPTION,
    path: 'formFields.description',
  },
  {
    label: 'Attachment',
    key: TICKET_FORM_FIELDS_KEY.ATTACHMENT,
    path: 'formFields.attachment',
  },
  {
    label: 'Tags',
    key: TICKET_FORM_FIELDS_KEY.TAGS,
    path: 'formFields.tags',
  },
];
