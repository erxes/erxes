// Pure validators/upload helpers accept the same translator as the components.
// The English fallback keeps non-UI callers independent of React/i18n setup.
export type ViberTranslate = (
  key: string,
  options: { defaultValue: string; [name: string]: string | number },
) => string;

export const defaultViberTranslate: ViberTranslate = (_key, options) =>
  options.defaultValue;
