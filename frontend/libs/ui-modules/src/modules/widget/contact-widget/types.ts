/**
 * What a plugin's `./contactWidget` remote is asked to draw: its section for
 * one module (`module`, as listed in `widgets.contactWidgets`) on a customer
 * or company's overview.
 */
export interface IContactWidgetProps {
  module: string;
  contentType: 'core:customer' | 'core:company';
  contentId: string;
}
