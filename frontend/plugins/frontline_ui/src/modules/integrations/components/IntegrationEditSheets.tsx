import { lazy, Suspense } from 'react';

const EditErxesMessengerSheet = lazy(() =>
  import('../erxes-messenger/components/EditErxesMessengerSheet').then(
    (module) => ({ default: module.EditErxesMessengerSheet }),
  ),
);

const CallIntegrationSheetEdit = lazy(() =>
  import('../call/components/CallIntegrationEdit').then((module) => ({
    default: module.CallIntegrationSheetEdit,
  })),
);

const CallProIntegrationSheetEdit = lazy(() =>
  import('../callpro/components/CallProIntegrationEdit').then((module) => ({
    default: module.CallProIntegrationSheetEdit,
  })),
);

const TelegramIntegrationDetail = lazy(() =>
  import('../telegram/TelegramIntegrationDetail').then((module) => ({
    default: module.TelegramIntegrationDetail,
  })),
);

/**
 * The atom-driven edit sheets, for pages that list integrations of every kind.
 * Mount once per page: each sheet opens from a global atom.
 */
export const IntegrationEditSheets = () => (
  <Suspense fallback={null}>
    <EditErxesMessengerSheet />
    <CallIntegrationSheetEdit />
    <CallProIntegrationSheetEdit />
    <TelegramIntegrationDetail showTrigger={false} />
  </Suspense>
);
