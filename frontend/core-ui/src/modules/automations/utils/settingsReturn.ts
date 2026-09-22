const RETURN_TO_KEY = 'automations:settingsReturnTo';

const AUTOMATIONS_LIST_PATH = '/automations';

/**
 * Remember which page the user opened automation settings from, so the
 * settings breadcrumb can send them back there. Called from every entry point
 * that links into `/settings/automations/*`.
 */
export const setAutomationSettingsReturnPath = (path: string) => {
  sessionStorage.setItem(RETURN_TO_KEY, path);
};

/**
 * Where the automation settings breadcrumb should navigate back to. Falls back
 * to the automations list when no origin was recorded (e.g. opened directly).
 */
export const getAutomationSettingsReturnPath = (): string => {
  return sessionStorage.getItem(RETURN_TO_KEY) || AUTOMATIONS_LIST_PATH;
};
