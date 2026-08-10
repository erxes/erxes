/**
 * Approved template shapes, mirroring what `whatsappTemplates` returns.
 * https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates
 */
export type WhatsappTemplateComponentType =
  | 'HEADER'
  | 'BODY'
  | 'FOOTER'
  | 'BUTTONS';

/**
 * One button on a BUTTONS component.
 *
 * Only URL (including OTP, a specialised URL button) buttons ever need a
 * runtime value, and only when their approved `url` itself contains a
 * `{{1}}` placeholder — a static URL, and every QUICK_REPLY/PHONE_NUMBER/
 * COPY_CODE button, needs nothing at send time.
 * https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/components/
 */
export interface IWhatsappTemplateButton {
  type: string;
  text?: string;
  url?: string;
  phone_number?: string;
}

export interface IWhatsappTemplateComponent {
  type: WhatsappTemplateComponentType;
  format?: string;
  text?: string;
  buttons?: IWhatsappTemplateButton[];
}

export interface IWhatsappTemplate {
  id: string;
  name: string;
  language: string;
  status: string;
  category: string;
  components: IWhatsappTemplateComponent[];
}

/** A connected number a new conversation can be started from. */
export interface IWhatsappSenderIntegration {
  _id: string;
  name: string;
  displayPhoneNumber?: string | null;
}

/**
 * Send-time parameters. Positional `{{n}}` are filled by array order for
 * header/body; a button component is keyed by `index` (its position among
 * the template's buttons, as a STRING per Meta's own example) and
 * `sub_type` instead, since a template can have more than one button but
 * each needs its own component entry.
 * https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/components/
 */
export type IWhatsappTemplateSendComponent =
  | { type: 'header' | 'body'; parameters: Array<{ type: 'text'; text: string }> }
  | {
      type: 'button';
      sub_type: 'url';
      index: string;
      parameters: Array<{ type: 'text'; text: string }>;
    };

export interface IWhatsappTemplateDispatch {
  name: string;
  languageCode: string;
  components?: IWhatsappTemplateSendComponent[];
}
