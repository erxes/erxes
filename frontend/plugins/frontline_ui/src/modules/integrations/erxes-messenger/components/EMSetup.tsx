import { useTranslation } from 'react-i18next';
import { EMAppearance } from '@/integrations/erxes-messenger/components/EMAppearance';
import { EMGreeting } from '@/integrations/erxes-messenger/components/EMGreeting';
import { EMIntro } from '@/integrations/erxes-messenger/components/EMIntro';
import { useAtomValue } from 'jotai';
import { useContext } from 'react';
import { SidePanelRecordPathContext, useSidePanel } from 'ui-modules';
import { EMHoursAvailability } from '@/integrations/erxes-messenger/components/EmHoursAvailability';
import { EMSettings } from '@/integrations/erxes-messenger/components/EMSettings';
import { EMConfig } from '@/integrations/erxes-messenger/components/EMConfig';
import { Preview, Resizable, Separator, Sheet, Spinner } from 'erxes-ui';
import { FrontlinePaths } from '@/types/FrontlinePaths';
import {
  erxesMessengerSetupEditSheetOpenAtom,
  erxesMessengerSetupStepAtom,
} from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';

/** Displays the messenger preview and its navigation toolbar. */
const EMSetupPreview = () => {
  const previewPath = `/frontline/settings/channels${FrontlinePaths.ErxesMessengerPreview}?inPreview=true`;

  return (
    <Preview>
      <div className="bg-background shrink-0 overflow-x-auto">
        <div className="w-max min-w-full">
          <Preview.Toolbar path={previewPath} />
        </div>
      </div>
      <Separator />
      <Preview.View iframeSrc={previewPath} />
    </Preview>
  );
};

export const EMSetup = ({
  loading,
}: {
  loading?: boolean;
}): JSX.Element | null => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const step = useAtomValue(erxesMessengerSetupStepAtom);
  const editId = useAtomValue(erxesMessengerSetupEditSheetOpenAtom);
  const sourcePath = useContext(SidePanelRecordPathContext);
  const { path } = useSidePanel();

  if (sourcePath && sourcePath !== path) return null;

  return (
    <Sheet.View
      className="gap-0 flex-col flex sm:max-w-none md:w-[calc(100vw-(--spacing(4)))]"
      aria-describedby=""
    >
      <Sheet.Header>
        <Sheet.Title>
          {t(editId ? 'edit-erxes-messenger' : 'add-erxes-messenger')}
        </Sheet.Title>
        <Sheet.Close />
      </Sheet.Header>
      {loading ? (
        <div className="flex flex-1 items-center justify-center w-full">
          <Spinner />
        </div>
      ) : (
        <Resizable.PanelGroup direction="horizontal">
          <Resizable.Panel className="flex flex-col" defaultSize={40}>
            {step === 1 && <EMAppearance />}
            {step === 2 && <EMGreeting />}
            {step === 3 && <EMIntro />}
            {step === 4 && <EMHoursAvailability />}
            {step === 5 && <EMSettings />}
            {step === 6 && <EMConfig />}
          </Resizable.Panel>
          <Resizable.Handle />
          <Resizable.Panel className="flex flex-col h-full" defaultSize={60}>
            <EMSetupPreview />
          </Resizable.Panel>
        </Resizable.PanelGroup>
      )}
    </Sheet.View>
  );
};
