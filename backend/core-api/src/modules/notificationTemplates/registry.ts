import { ExpectedError } from 'erxes-api-shared/utils';
import { set } from 'lodash';

export type TTemplateVariable = {
  name: string;
  label: string;
  sample: string;
  required?: boolean;
  // emitted as written, not escaped: html the sender already rendered
  html?: boolean;
};

// the Handlebars data the senders already pass to the built-in files
export type TSenderData = {
  domain?: string;
  content?: string;
  action?: string;
  userName?: string;
  date?: string;
  notification?: { title?: string; content?: string; link?: string };
};

export type TSystemEmailTemplate = {
  title: string;
  description: string;
  // the built-in file sent while nothing is published
  file: string;
  defaultSubject: string;
  // whether the footer links to the recipient's notification settings
  manageLink: boolean;
  variables: TTemplateVariable[];
  // the sender's data as the paths the editor offers
  toValues: (data: TSenderData) => Record<string, unknown>;
  // the maily document a first draft starts from
  starterJson: Record<string, unknown>;
};

const variable = (id: string) => ({
  type: 'variable',
  attrs: { id, label: null, fallback: null, required: false },
});

const paragraph = (...content: Record<string, unknown>[]) => ({
  type: 'paragraph',
  attrs: { textAlign: 'left' },
  content,
});

const text = (value: string) => ({ type: 'text', text: value });

const button = (label: string, url: string) => ({
  type: 'button',
  attrs: {
    text: label,
    isTextVariable: false,
    url,
    isUrlVariable: true,
    alignment: 'left',
    variant: 'filled',
    borderRadius: 'smooth',
    buttonColor: '#4f46e5',
    textColor: '#ffffff',
  },
});

const LINK_VARIABLE: TTemplateVariable = {
  name: 'link',
  label: 'Link',
  sample: 'https://example.com/confirmation?token=sample',
  required: true,
};

export const SYSTEM_EMAIL_TEMPLATES: Record<string, TSystemEmailTemplate> = {
  'notification:default': {
    title: 'Notification',
    description: 'Every notification email, whichever plugin sent it',
    file: 'notification',
    defaultSubject: '{{ notification.title }}',
    manageLink: true,
    variables: [
      { name: 'notification.title', label: 'Title', sample: 'Task assigned' },
      {
        name: 'notification.message',
        label: 'Message',
        sample: 'You have been assigned to task',
      },
      {
        name: 'notification.content',
        label: 'Content',
        sample: '<p>Fix the login page</p>',
        html: true,
      },
      {
        name: 'notification.link',
        label: 'Link',
        sample: 'https://example.com/my-inbox',
        required: true,
      },
      { name: 'actor.name', label: 'Sent by', sample: 'Bat Dorj' },
      { name: 'date', label: 'Date', sample: '10/24/2026, 10:00:00 AM' },
    ],
    toValues: ({ notification, action, userName, date }) => ({
      notification: { ...notification, message: action },
      actor: { name: userName },
      date,
    }),
    starterJson: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2, textAlign: 'left' },
          content: [variable('notification.title')],
        },
        paragraph(
          variable('actor.name'),
          text(' '),
          variable('notification.message'),
        ),
        paragraph(variable('notification.content')),
        button('Open notification', 'notification.link'),
      ],
    },
  },
  'transactional:resetPassword': {
    title: 'Reset password',
    description: 'Sent when a team member asks to reset their password',
    file: 'resetPassword',
    defaultSubject: 'Reset password',
    manageLink: false,
    variables: [{ ...LINK_VARIABLE, label: 'Reset link' }],
    toValues: ({ content }) => ({ link: content }),
    starterJson: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2, textAlign: 'left' },
          content: [text('Reset your password')],
        },
        paragraph(
          text(
            'Someone asked to reset the password of your account. If it was not you, ignore this email.',
          ),
        ),
        button('Reset password', 'link'),
      ],
    },
  },
  'transactional:userInvitation': {
    title: 'Team member invitation',
    description: 'Sent when someone is invited to the workspace',
    file: 'userInvitation',
    defaultSubject: 'Team member invitation',
    manageLink: false,
    variables: [{ ...LINK_VARIABLE, label: 'Invitation link' }],
    toValues: ({ content }) => ({ link: content }),
    starterJson: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2, textAlign: 'left' },
          content: [text('You have been invited')],
        },
        paragraph(text('Accept the invitation to join your team.')),
        button('Accept invitation', 'link'),
      ],
    },
  },
};

// Filled by the server on every send and never offered in the editor: the
// saved body sits between the brand's header and footer.
export const SYSTEM_VARIABLES: TTemplateVariable[] = [
  { name: 'brand.header', label: 'Brand header', sample: '', html: true },
  { name: 'brand.footer', label: 'Brand footer', sample: '', html: true },
  { name: 'brand.name', label: 'Brand name', sample: 'Acme' },
  { name: 'year', label: 'Year', sample: '2026' },
];

export const BRAND_FRAME_VARIABLES = ['brand.header', 'brand.footer'];

export const getSystemEmailTemplate = (key: string) => {
  const definition = SYSTEM_EMAIL_TEMPLATES[key];

  // sender confirmation and magic login stay built-in: they prove who owns
  // an address or an account, so a workspace never rewrites them
  if (!definition) {
    throw new ExpectedError(`Email template cannot be edited: ${key}`);
  }

  return definition;
};

export const findTemplateKeyByFile = (file: string) =>
  Object.keys(SYSTEM_EMAIL_TEMPLATES).find(
    (key) => SYSTEM_EMAIL_TEMPLATES[key].file === file,
  );

export const templateFields = (definition: TSystemEmailTemplate) =>
  new Map(
    [...definition.variables, ...SYSTEM_VARIABLES].map((field) => [
      field.name,
      field,
    ]),
  );

export const templateSampleValues = (definition: TSystemEmailTemplate) => {
  const values: Record<string, unknown> = {};

  for (const { name, sample } of definition.variables) {
    set(values, name, sample);
  }

  return values;
};
