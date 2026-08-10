export enum TICKET_FORM_FIELDS_KEY {
  NAME = 'name',
  DESCRIPTION = 'description',
  ATTACHMENT = 'attachment',
  TAGS = 'tags',
}

export const TICKET_FORM_FIELDS = [
  {
    label: 'name',
    showLabel: 'show-name-field',
    key: TICKET_FORM_FIELDS_KEY.NAME,
    path: 'formFields.name',
  },
  {
    label: 'description',
    showLabel: 'show-description-field',
    key: TICKET_FORM_FIELDS_KEY.DESCRIPTION,
    path: 'formFields.description',
  },
  {
    label: 'attachment',
    showLabel: 'show-attachment-field',
    key: TICKET_FORM_FIELDS_KEY.ATTACHMENT,
    path: 'formFields.attachment',
  },
  {
    label: 'tags',
    showLabel: 'show-tags-field',
    key: TICKET_FORM_FIELDS_KEY.TAGS,
    path: 'formFields.tags',
  },
];
