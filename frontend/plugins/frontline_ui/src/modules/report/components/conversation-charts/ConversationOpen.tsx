import {
  ConversationDateCount,
  ConversationDateCountProps,
} from './ConversationDateCount';

export const ConversationOpen = (
  props: Readonly<ConversationDateCountProps>,
) => <ConversationDateCount {...props} kind="open" />;
