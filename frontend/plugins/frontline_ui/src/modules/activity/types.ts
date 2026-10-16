import type {
  GetTicketActivitiesQuery,
  MailTicketReplyTargetQuery,
  TicketGetNoteQuery,
} from '~/gql/graphql';

export type IActivity = NonNullable<
  NonNullable<
    NonNullable<GetTicketActivitiesQuery['getTicketActivities']>['list']
  >[number]
>;

export type IActivityFormField = NonNullable<
  NonNullable<NonNullable<IActivity['metadata']>['submissions']>[number]
>;

export type INote = NonNullable<TicketGetNoteQuery['ticketGetNote']>;

export type ITicketNoteAttachment = NonNullable<
  NonNullable<INote['attachments']>[number]
>;

export type ITicketNoteUnsavedAttachment = NonNullable<
  NonNullable<INote['unsavedAttachments']>[number]
>;

export type ITicketNoteMailDelivery = NonNullable<INote['mailDelivery']>;

export type TNoteKind =
  | 'internal'
  | 'emailReceived'
  | 'portalReceived'
  | 'emailSent'
  | 'customerVisible';

export type ITicketReplyTarget = NonNullable<
  MailTicketReplyTargetQuery['mailTicketReplyTarget']
>;

export interface INoteTemplateSuggestion {
  _id: string;
  name: string;
  content: string;
  channelId?: string;
  updatedAt?: string;
  preview?: string;
}

export interface INoteAttachment {
  name: string;
  type: string;
  size: number;
  url?: string;
  data?: string;
}

export interface NoteInputToolbarProps {
  isInternalNote: boolean;
  onTemplateSelect: (templateContent: string) => void;
  onFilesSelected: (files: FileList) => void;
  onSend: () => void;
  isSending: boolean;
}

export type NoteInputProps = { contentId: string };
export type NoteTemplateSuggestionsOptions = {
  editor: ReturnType<typeof import('erxes-ui').useBlockEditor>;
  enabled: boolean;
};
