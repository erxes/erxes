import type { IContactWidgetProps } from 'ui-modules';
import { ConversationsContactSection } from './ConversationsContactSection';
import { TicketsContactSection } from './TicketsContactSection';

// Frontline's sections on a customer or company overview
// (`widgets.contactWidgets`).
export const ContactWidgets = ({ module, ...props }: IContactWidgetProps) => {
  if (module === 'ticket') {
    return <TicketsContactSection {...props} />;
  }

  if (module === 'conversation') {
    return <ConversationsContactSection {...props} />;
  }

  return null;
};

export default ContactWidgets;
