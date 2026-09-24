import { cn, Command, Input, RadioGroup, Spinner } from 'erxes-ui';
import { useAtom, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  activeWhatsappFormStepAtom,
  selectedWhatsappBusinessAccountAtom,
  selectedWhatsappPageAtom,
  selectedWhatsappPhoneNumberAtom,
} from '../states/whatsappStates';
import { useWhatsappPages } from '../hooks/useWhatsappPages';
import {
  WhatsappIntegrationFormLayout,
  WhatsappIntegrationFormSteps,
} from './WhatsappIntegrationForm';
import { WhatsappListError } from './WhatsappListError';
import { WhatsappStepNav } from './WhatsappStepNav';

export const WhatsappGetPages = () => {
  const { t } = useTranslation('frontline');
  const [selectedPage, setSelectedPage] = useAtom(selectedWhatsappPageAtom);
  const setSelectedBusinessAccount = useSetAtom(
    selectedWhatsappBusinessAccountAtom,
  );
  const setSelectedPhoneNumber = useSetAtom(selectedWhatsappPhoneNumberAtom);
  const { whatsappGetPages, loading, error, refetch } = useWhatsappPages();
  const setActiveStep = useSetAtom(activeWhatsappFormStepAtom);

  const selectPage = (pageId: string) => {
    const targetPage = whatsappGetPages.find((page) => page.id === pageId);

    if (targetPage?.isUsed) {
      return;
    }

    const nextPage = selectedPage === pageId ? undefined : pageId;
    if (nextPage !== selectedPage) {
      setSelectedBusinessAccount(undefined);
      setSelectedPhoneNumber(undefined);
    }
    setSelectedPage(nextPage);
  };

  return (
    <WhatsappIntegrationFormLayout
      actions={
        <WhatsappStepNav
          onPrevious={() => {
            setActiveStep(1);
            setSelectedPage(undefined);
          }}
          onNext={() => setActiveStep(3)}
          nextDisabled={!selectedPage}
        />
      }
    >
      <WhatsappIntegrationFormSteps
        title={t('connect-pages')}
        step={2}
        description={t('fb-select-pages-description')}
      />
      <div className="flex-1 overflow-hidden p-4 pt-0">
        <Command>
          <div className="p-1">
            <Command.Primitive.Input asChild>
              <Input placeholder={t('search-for-a-page')} />
            </Command.Primitive.Input>
          </div>
          <div className="flex justify-between items-center px-1 py-2">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              {loading ? (
                <>
                  <Spinner className="w-3 h-3" />
                  {t('loading-pages', 'Loading pages...')}
                </>
              ) : (
                t('pages-found', { count: whatsappGetPages.length })
              )}
            </div>
          </div>
          {error ? (
            <WhatsappListError
              title={t(
                'failed-to-load-facebook-pages',
                'Failed to load Facebook Pages',
              )}
              error={error}
              onRetry={() => refetch()}
            />
          ) : (
            <RadioGroup
              value={selectedPage}
              onValueChange={(value) => selectPage(value)}
            >
              <Command.List>
                {!loading && whatsappGetPages.length === 0 && (
                  <div className="p-6 text-sm text-muted-foreground text-center">
                    {t(
                      'no-facebook-pages-for-account',
                      'No Facebook Pages found for the selected account.',
                    )}
                  </div>
                )}
                {whatsappGetPages.map((page) => (
                  <Command.Item
                    key={page.id}
                    value={page.name}
                    disabled={page.isUsed}
                    onSelect={() => selectPage(page.id)}
                    className={cn(
                      'gap-3 border-t last-of-type:border-b rounded-none h-10 px-3',
                      selectedPage === page.id && 'text-primary',
                    )}
                  >
                    <RadioGroup.Item
                      value={page.id}
                      checked={selectedPage === page.id}
                      disabled={page.isUsed}
                      className="bg-background"
                      onClick={() => selectPage(page.id)}
                    />
                    <div className="font-semibold">{page.name}</div>
                  </Command.Item>
                ))}
              </Command.List>
            </RadioGroup>
          )}
        </Command>
      </div>
    </WhatsappIntegrationFormLayout>
  );
};
