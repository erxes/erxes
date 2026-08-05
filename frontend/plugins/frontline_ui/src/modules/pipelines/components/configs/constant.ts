export enum TICKET_FORM_FIELDS_KEY {
  NAME = 'name',
  DESCRIPTION = 'description',
  ATTACHMENT = 'attachment',
  TAGS = 'tags',
}

export const TICKET_FORM_FIELDS = [
  {
    label: 'name',
    key: TICKET_FORM_FIELDS_KEY.NAME,
    path: 'formFields.name',
  },
  {
    label: 'description',
    key: TICKET_FORM_FIELDS_KEY.DESCRIPTION,
    path: 'formFields.description',
  },
  {
    label: 'attachment',
    key: TICKET_FORM_FIELDS_KEY.ATTACHMENT,
    path: 'formFields.attachment',
  },
  {
    label: 'tags',
    key: TICKET_FORM_FIELDS_KEY.TAGS,
    path: 'formFields.tags',
  },
];
