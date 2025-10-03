import { I18nextProvider } from 'react-i18next';

import { i18nInstance } from '../../i18n';

export const AppI18nWrapper = ({ children }: React.PropsWithChildren) => {
  return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>;
};
