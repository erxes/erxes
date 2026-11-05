import type { IContactWidgetProps } from 'ui-modules';
import { DealsContactSection } from './DealsContactSection';

// Sales' sections on a customer or company overview
// (`widgets.contactWidgets`).
export const ContactWidgets = ({ module, ...props }: IContactWidgetProps) => {
  if (module === 'deals') {
    return <DealsContactSection {...props} />;
  }

  return null;
};

export default ContactWidgets;
