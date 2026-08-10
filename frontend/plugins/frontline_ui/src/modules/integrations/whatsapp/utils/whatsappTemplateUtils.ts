import {
  IWhatsappTemplate,
  IWhatsappTemplateButton,
  IWhatsappTemplateComponent,
  IWhatsappTemplateDispatch,
  IWhatsappTemplateSendComponent,
} from '../types/WhatsappTemplate';

/** Matches the positional placeholders Meta approves, e.g. `{{1}}`. */
const PLACEHOLDER_PATTERN = /\{\{\s*(\d+)\s*\}\}/g;

export const findTemplateComponent = (
  template: IWhatsappTemplate | undefined,
  type: IWhatsappTemplateComponent['type'],
): IWhatsappTemplateComponent | undefined =>
  template?.components?.find((component) => component.type === type);

/**
 * The distinct `{{n}}` indexes in a piece of approved copy, ascending.
 *
 * Returns the indexes rather than a count because a template may repeat a
 * placeholder (`{{1}} ... {{1}}`) or, rarely, skip one; the number of VALUES
 * Meta expects is the number of distinct indexes, and sending a different
 * count is rejected outright (the 132000 error family).
 */
export const getTemplatePlaceholders = (text?: string): number[] => {
  if (!text) {
    return [];
  }

  const indexes = new Set<number>();

  for (const match of text.matchAll(PLACEHOLDER_PATTERN)) {
    indexes.add(Number(match[1]));
  }

  return [...indexes].sort((a, b) => a - b);
};

/**
 * Only a TEXT header can take parameters we collect as plain fields; a media
 * header needs an uploaded asset, which the composer does not gather, so those
 * templates are offered without header variables.
 */
export const getHeaderPlaceholders = (
  template: IWhatsappTemplate | undefined,
): number[] => {
  const header = findTemplateComponent(template, 'HEADER');

  if (!header || (header.format && header.format !== 'TEXT')) {
    return [];
  }

  return getTemplatePlaceholders(header.text);
};

export const getBodyPlaceholders = (
  template: IWhatsappTemplate | undefined,
): number[] =>
  getTemplatePlaceholders(findTemplateComponent(template, 'BODY')?.text);

/**
 * One button that needs a value at send time — its position among the
 * template's buttons (`index`, matching what Meta's own button-component
 * example calls it) and the approved URL the value gets appended to.
 *
 * Only a URL button (OTP is a specialised URL button and shares the same
 * shape) whose approved `url` itself contains `{{1}}` needs anything here.
 * Meta documents this as the ONLY button type accepting a runtime variable
 * besides OTP; QUICK_REPLY, PHONE_NUMBER and COPY_CODE buttons, and a URL
 * button with no placeholder in its approved URL, need nothing.
 * https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/components/
 */
export interface IWhatsappTemplateDynamicButton {
  index: number;
  button: IWhatsappTemplateButton;
}

export const getDynamicButtons = (
  template: IWhatsappTemplate | undefined,
): IWhatsappTemplateDynamicButton[] => {
  const buttons = findTemplateComponent(template, 'BUTTONS')?.buttons;

  if (!buttons?.length) {
    return [];
  }

  return buttons
    .map((button, index) => ({ index, button }))
    .filter(
      ({ button }) =>
        // A fresh RegExp per call, deliberately — PLACEHOLDER_PATTERN carries
        // the `g` flag for its .matchAll() uses elsewhere, and .test() on a
        // shared global regex advances its own lastIndex as a side effect.
        // Reusing it here would make every other dynamic button in a
        // multi-button template silently test false depending on call order.
        button.type === 'URL' &&
        /\{\{\s*\d+\s*\}\}/.test(button.url || ''),
    );
};

/** Substitutes collected values into approved copy for the preview. */
export const renderTemplateText = (
  text: string | undefined,
  placeholders: number[],
  values: string[],
): string => {
  if (!text) {
    return '';
  }

  return text.replace(PLACEHOLDER_PATTERN, (match, rawIndex) => {
    const position = placeholders.indexOf(Number(rawIndex));
    const value = position === -1 ? '' : values[position];

    return value?.trim() ? value : match;
  });
};

/**
 * A dynamic button's approved URL with its variable filled in, for the
 * preview — the same treatment `renderTemplateText` gives header/body copy,
 * kept separate because a button has no surrounding sentence to substitute
 * into, only the one `{{1}}` in its `url`.
 */
const renderButtonUrl = (button: IWhatsappTemplateButton, value: string) =>
  (button.url || '').replace(
    PLACEHOLDER_PATTERN,
    value.trim() ? value : '$&',
  );

/**
 * The full resolved message, used both for the preview and as the `content`
 * stored on the thread so the bubble shows what the customer received.
 *
 * Button URLs are appended after the footer, one per line, so an agent can
 * see exactly what link the customer is about to get — the button itself
 * renders nowhere else in this flow, unlike WhatsApp's own client which
 * shows it as a tappable chip.
 */
export const buildTemplatePreview = (
  template: IWhatsappTemplate,
  headerValues: string[],
  bodyValues: string[],
  buttonValues: string[] = [],
): string => {
  const header = findTemplateComponent(template, 'HEADER');
  const body = findTemplateComponent(template, 'BODY');
  const footer = findTemplateComponent(template, 'FOOTER');

  const headerText =
    header && (!header.format || header.format === 'TEXT')
      ? renderTemplateText(
          header.text,
          getHeaderPlaceholders(template),
          headerValues,
        )
      : '';

  const bodyText = renderTemplateText(
    body?.text,
    getBodyPlaceholders(template),
    bodyValues,
  );

  const buttonLines = getDynamicButtons(template).map(({ button }, index) =>
    renderButtonUrl(button, buttonValues[index] ?? ''),
  );

  return [headerText, bodyText, footer?.text, ...buttonLines]
    .filter((part) => !!part?.trim())
    .join('\n\n');
};

/**
 * Builds the `template` payload sent on `extraInfo.whatsappTemplate`.
 *
 * Components are emitted in the order Meta documents (header, body, button)
 * and each `parameters[]` follows the ascending placeholder order, because
 * positional `{{n}}` are resolved by ARRAY ORDER, not by index number. A
 * component with no parameters is omitted entirely — except a dynamic
 * button, which Meta requires even when the agent left it blank: leaving it
 * out entirely would send an approved template whose live link still reads
 * literal `{{1}}`, which is worse than a rejected send telling the agent
 * why.
 */
export const buildTemplateDispatch = (
  template: IWhatsappTemplate,
  headerValues: string[],
  bodyValues: string[],
  buttonValues: string[] = [],
): IWhatsappTemplateDispatch => {
  const components: IWhatsappTemplateSendComponent[] = [];

  const headerPlaceholders = getHeaderPlaceholders(template);
  const bodyPlaceholders = getBodyPlaceholders(template);
  const dynamicButtons = getDynamicButtons(template);

  if (headerPlaceholders.length) {
    components.push({
      type: 'header',
      parameters: headerPlaceholders.map((_placeholder, index) => ({
        type: 'text',
        text: headerValues[index] ?? '',
      })),
    });
  }

  if (bodyPlaceholders.length) {
    components.push({
      type: 'body',
      parameters: bodyPlaceholders.map((_placeholder, index) => ({
        type: 'text',
        text: bodyValues[index] ?? '',
      })),
    });
  }

  dynamicButtons.forEach(({ index: buttonIndex }, position) => {
    components.push({
      type: 'button',
      sub_type: 'url',
      // Meta's own button-component example shows this as a STRING, not a
      // number — sent as written, not coerced.
      index: String(buttonIndex),
      parameters: [{ type: 'text', text: buttonValues[position] ?? '' }],
    });
  });

  return {
    name: template.name,
    languageCode: template.language,
    ...(components.length ? { components } : {}),
  };
};
