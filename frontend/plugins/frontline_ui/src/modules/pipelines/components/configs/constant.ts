import { TPipelineConfig } from '@/pipelines/types';
import { UseFieldArrayAppend } from 'react-hook-form';

export enum TICKET_FORM_FIELDS_KEY {
  NAME = 'isShowName',
  DESCRIPTION = 'isShowDescription',
  ATTACHMENT = 'isShowAttachment',
  TAGS = 'isShowTags',

  FIRST_NAME = 'isShowFirstName',
  LAST_NAME = 'isShowLastName',
  PHONE = 'isShowPhoneNumber',
  EMAIL = 'isShowEmail',

  COMPANY_NAME = 'isShowCompanyName',
  COMPANY_REGISTRATION_NUMBER = 'isShowCompanyRegistrationNumber',
  COMPANY_ADDRESS = 'isShowCompanyAddress',
  COMPANY_PHONE = 'isShowCompanyPhone',
  COMPANY_EMAIL = 'isShowCompanyEmail',
}

export const TICKET_FORM_FIELDS = [
  {
    label: 'Name',
    key: TICKET_FORM_FIELDS_KEY.NAME,
    path: 'ticketBasicFields',
    onAppend: (append: UseFieldArrayAppend<TPipelineConfig>) => {
      append({
        key: TICKET_FORM_FIELDS_KEY.NAME,
        label: 'Ticket Name',
        order: undefined,
        placeholder: '',
      });
    },
  },
  {
    label: 'Description',
    key: TICKET_FORM_FIELDS_KEY.DESCRIPTION,
    path: 'ticketBasicFields',
    onAppend: (append: UseFieldArrayAppend<TPipelineConfig>) => {
      append({
        key: TICKET_FORM_FIELDS_KEY.DESCRIPTION,
        label: 'Ticket Description',
        order: undefined,
        placeholder: '',
      });
    },
  },
  {
    label: 'Attachment',
    key: TICKET_FORM_FIELDS_KEY.ATTACHMENT,
    path: 'ticketBasicFields',
    onAppend: (append: UseFieldArrayAppend<TPipelineConfig>) => {
      append({
        key: TICKET_FORM_FIELDS_KEY.ATTACHMENT,
        label: 'Ticket Attachment',
        order: undefined,
        placeholder: '',
      });
    },
  },
  {
    label: 'Tags',
    key: TICKET_FORM_FIELDS_KEY.TAGS,
    path: 'ticketBasicFields',
    onAppend: (append: UseFieldArrayAppend<TPipelineConfig>) => {
      append({
        key: TICKET_FORM_FIELDS_KEY.TAGS,
        label: 'Ticket Tags',
        order: undefined,
        placeholder: '',
      });
    },
  },
  {
    label: 'First Name',
    key: TICKET_FORM_FIELDS_KEY.FIRST_NAME,
    path: 'customer',
    onAppend: (append: UseFieldArrayAppend<TPipelineConfig>) => {
      append({
        key: TICKET_FORM_FIELDS_KEY.FIRST_NAME,
        label: 'Customer First Name',
        order: undefined,
        placeholder: '',
      });
    },
  },
  {
    label: 'Last Name',
    key: TICKET_FORM_FIELDS_KEY.LAST_NAME,
    path: 'customer',
    onAppend: (append: UseFieldArrayAppend<TPipelineConfig>) => {
      append({
        key: TICKET_FORM_FIELDS_KEY.LAST_NAME,
        label: 'Customer Last Name',
        order: undefined,
        placeholder: '',
      });
    },
  },
  {
    label: 'Phone',
    key: TICKET_FORM_FIELDS_KEY.PHONE,
    path: 'customer',
    onAppend: (append: UseFieldArrayAppend<TPipelineConfig>) => {
      append({
        key: TICKET_FORM_FIELDS_KEY.PHONE,
        label: 'Customer Phone',
        order: undefined,
        placeholder: '',
      });
    },
  },
  {
    label: 'Email',
    key: TICKET_FORM_FIELDS_KEY.EMAIL,
    path: 'customer',
    onAppend: (append: UseFieldArrayAppend<TPipelineConfig>) => {
      append({
        key: TICKET_FORM_FIELDS_KEY.EMAIL,
        label: 'Customer Email',
        order: undefined,
        placeholder: '',
      });
    },
  },
  {
    label: 'Company Name',
    key: TICKET_FORM_FIELDS_KEY.COMPANY_NAME,
    path: 'company',
    onAppend: (append: UseFieldArrayAppend<TPipelineConfig>) => {
      append({
        key: TICKET_FORM_FIELDS_KEY.COMPANY_NAME,
        label: 'Company Name',
        order: undefined,
        placeholder: '',
      });
    },
  },
  {
    label: 'Company Registration Number',
    key: TICKET_FORM_FIELDS_KEY.COMPANY_REGISTRATION_NUMBER,
    path: 'company',
    onAppend: (append: UseFieldArrayAppend<TPipelineConfig>) => {
      append({
        key: TICKET_FORM_FIELDS_KEY.COMPANY_REGISTRATION_NUMBER,
        label: 'Company Registration Number',
        order: undefined,
        placeholder: '',
      });
    },
  },
  {
    label: 'Company Address',
    key: TICKET_FORM_FIELDS_KEY.COMPANY_ADDRESS,
    path: 'company',
    onAppend: (append: UseFieldArrayAppend<TPipelineConfig>) => {
      append({
        key: TICKET_FORM_FIELDS_KEY.COMPANY_ADDRESS,
        label: 'Company Address',
        order: undefined,
        placeholder: '',
      });
    },
  },
  {
    label: 'Company Phone',
    key: TICKET_FORM_FIELDS_KEY.COMPANY_PHONE,
    path: 'company',
    onAppend: (append: UseFieldArrayAppend<TPipelineConfig>) => {
      append({
        key: TICKET_FORM_FIELDS_KEY.COMPANY_PHONE,
        label: 'Company Phone',
        order: undefined,
        placeholder: '',
      });
    },
  },
  {
    label: 'Company Email',
    key: TICKET_FORM_FIELDS_KEY.COMPANY_EMAIL,
    path: 'company',
    onAppend: (append: UseFieldArrayAppend<TPipelineConfig>) => {
      append({
        key: TICKET_FORM_FIELDS_KEY.COMPANY_EMAIL,
        label: 'Company Email',
        order: undefined,
        placeholder: '',
      });
    },
  },
];
