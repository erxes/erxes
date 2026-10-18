import type { AttachmentInput, DealDetailQuery } from '~/gql/graphql';

export type IAttachment = NonNullable<
  NonNullable<NonNullable<DealDetailQuery['dealDetail']>['attachments']>[number]
>;

export const toAttachmentInput = ({
  url,
  name,
  size,
  type,
  duration,
}: IAttachment): AttachmentInput => ({
  url,
  name: name ?? '',
  size,
  type,
  duration,
});

export type AttachmentContextType = {
  dealId: string;
  attachments: IAttachment[];
  addAttachment: (attachment: IAttachment) => void;
  handleRemoveImage: (e: React.MouseEvent, attachment: IAttachment) => void;
  resetAttachments: () => void;
  removingUrl: string | null;
};
