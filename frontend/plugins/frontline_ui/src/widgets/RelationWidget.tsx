import { IRelationWidgetProps } from 'ui-modules';
import { ConversationRelationWidget } from './relations/modules/conversation/Conversation';
import { TicketRelationWidget } from './relations/modules/ticket/Tickets';

const RelationWidget = (props: IRelationWidgetProps) => {
  const { module } = props;

  switch (module) {
    case 'conversation':
      return <ConversationRelationWidget {...props} />;
    case 'ticket':
      return <TicketRelationWidget {...props} />;
    default:
      return null;
  }
};

export default RelationWidget;
