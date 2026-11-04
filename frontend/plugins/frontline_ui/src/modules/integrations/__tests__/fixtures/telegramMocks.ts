jest.mock('erxes-ui', () => {
  const { createProviderUi } =
    jest.requireActual<typeof import('./providerUi')>('./providerUi');
  return createProviderUi();
});
jest.mock('ui-modules', () => {
  const { createTelegramSidePanel, BrandInput } =
    jest.requireActual<typeof import('./providerUi')>('./providerUi');
  return { ...createTelegramSidePanel(), SelectBrand: BrandInput };
});
jest.mock('react-router', () => ({ useParams: () => ({}) }));
jest.mock('react-router-dom', () => ({ useParams: () => ({ id: 'channel' }) }));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('@/integrations/telegram/translations', () => ({
  useTelegramTranslation: () => ({ t: (key: string) => key }),
}));

export {};
