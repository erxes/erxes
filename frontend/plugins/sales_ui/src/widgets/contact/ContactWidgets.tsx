import type { IContactWidgetProps } from 'ui-modules';
import { DealsContactSection } from './DealsContactSection';
import { PosOrdersContactSection } from '~/widgets/contact/PosOrdersContactSection';

// Sales' sections on a customer or company overview
// (`widgets.contactWidgets`).
export const ContactWidgets = ({ module, ...props }: IContactWidgetProps) => {
  if (module === 'deals') {
    return <DealsContactSection {...props} />;
  }

  if (module === 'posOrders') {
    return <PosOrdersContactSection {...props} />;
  }

  return null;
};

export default ContactWidgets;
