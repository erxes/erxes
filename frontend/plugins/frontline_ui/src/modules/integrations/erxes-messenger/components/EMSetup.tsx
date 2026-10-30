import { useTranslation } from 'react-i18next';
import { EMAppearance } from '@/integrations/erxes-messenger/components/EMAppearance';
import { EMGreeting } from '@/integrations/erxes-messenger/components/EMGreeting';
import { EMIntro } from '@/integrations/erxes-messenger/components/EMIntro';
import { useAtomValue } from 'jotai';
import { EMHoursAvailability } from '@/integrations/erxes-messenger/components/EmHoursAvailability';
import { EMSettings } from '@/integrations/erxes-messenger/components/EMSettings';
import { EMConfig } from '@/integrations/erxes-messenger/components/EMConfig';
import { Preview, Separator, Spinner, Tabs } from 'erxes-ui';
import { FrontlinePaths } from '@/types/FrontlinePaths';
import { erxesMessengerSetupStepAtom } from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';

export const EMSetup = ({ loading }: { loading?: boolean }) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const step = useAtomValue(erxesMessengerSetupStepAtom);
  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
      {loading ? (
        <div className="flex flex-1 items-center justify-center w-full">
          <Spinner />
        </div>
      ) : (
        <Tabs
          defaultValue="editor"
          className="flex flex-1 min-h-0 flex-col overflow-hidden"
        >
          <Tabs.List className="flex shrink-0 px-3 gap-x-2">
            <Tabs.Trigger value="editor">{t('edit')}</Tabs.Trigger>
            <Tabs.Trigger value="preview">{t('preview')}</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content
            value="editor"
            forceMount
            className="flex flex-1 min-h-0 flex-col overflow-hidden data-[state=inactive]:hidden"
          >
            {step === 1 && <EMAppearance />}
            {step === 2 && <EMGreeting />}
            {step === 3 && <EMIntro />}
            {step === 4 && <EMHoursAvailability />}
            {step === 5 && <EMSettings />}
            {step === 6 && <EMConfig />}
          </Tabs.Content>
          <Tabs.Content
            value="preview"
            className="flex flex-1 min-h-0 flex-col overflow-hidden"
          >
            <Preview>
              <div className="bg-background shrink-0 overflow-x-auto">
                <div className="w-max min-w-full">
                  <Preview.Toolbar
                    path={
                      '/frontline/settings/channels' +
                      FrontlinePaths.ErxesMessengerPreview +
                      '?inPreview=true'
                    }
                  />
                </div>
              </div>
              <Separator />
              <Preview.View
                iframeSrc={
                  '/frontline/settings/channels' +
                  FrontlinePaths.ErxesMessengerPreview +
                  '?inPreview=true'
                }
              />
            </Preview>
          </Tabs.Content>
        </Tabs>
      )}
    </div>
  );
};
