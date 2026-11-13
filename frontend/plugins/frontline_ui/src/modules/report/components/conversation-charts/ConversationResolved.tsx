import {
  ConversationDateCount,
  ConversationDateCountProps,
} from './ConversationDateCount';

export const ConversationResolved = (
  props: Readonly<ConversationDateCountProps>,
) => <ConversationDateCount {...props} kind="resolved" />;
