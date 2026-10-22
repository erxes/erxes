import { Button, cn, Command, Input, RadioGroup } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  FacebookIntegrationFormLayout,
  FacebookIntegrationFormSteps,
} from '@/integrations/facebook/components/FacebookIntegrationForm';
import { useAtom, useSetAtom } from 'jotai';
import {
  activeFacebookFormStepAtom,
  selectedFacebookPageAtom,
} from '@/integrations/facebook/states/facebookStates';
import { useFacebookPages } from '@/integrations/facebook/hooks/useFacebookPages';
import { FacebookPageUsage } from '@/integrations/facebook/components/FacebookPageUsage';

export const FacebookGetPages = () => {
  const { t } = useTranslation('frontline');
  const [selectedPage, setSelectedPage] = useAtom(selectedFacebookPageAtom);
  const { facebookGetPages } = useFacebookPages();
  const setActiveStep = useSetAtom(activeFacebookFormStepAtom);

  return (
    <FacebookIntegrationFormLayout
      actions={
        <>
          <Button
            variant="secondary"
            className="bg-border"
            onClick={() => {
              setActiveStep(1);
              setSelectedPage(undefined);
            }}
          >
            {t('previous-step')}
          </Button>
          <Button disabled={!selectedPage} onClick={() => setActiveStep(3)}>
            {t('next-step')}
          </Button>
        </>
      }
    >
      <FacebookIntegrationFormSteps title={t('connect-pages')} step={2} />
      <div className="flex-1 overflow-hidden p-4 pt-0">
        <Command>
          <div className="p-1">
            <Command.Primitive.Input asChild>
              <Input placeholder={t('search-for-a-page')} />
            </Command.Primitive.Input>
          </div>
          <div className="flex justify-between items-center px-1 py-2">
            <div className="text-sm text-muted-foreground">
              {t('pages-found', { count: facebookGetPages.length })}
            </div>
          </div>
          <RadioGroup
            value={selectedPage}
            onValueChange={(value) =>
              setSelectedPage(value === selectedPage ? undefined : value)
            }
          >
            <Command.List>
              {facebookGetPages.map((page) => {
                // A used page stays enabled so its usage trigger is clickable
                // and search still filters it; it just cannot be picked.
                const isUsed = Boolean(page.isUsed);

                return (
                  <Command.Item
                    key={page.id}
                    value={page.name ?? ''}
                    onSelect={() => {
                      if (isUsed) return;
                      setSelectedPage(
                        selectedPage === page.id
                          ? undefined
                          : page.id ?? undefined,
                      );
                    }}
                    className={cn(
                      'gap-3 border-t last-of-type:border-b rounded-none h-10 pl-3 pr-0',
                      selectedPage === page.id && 'text-primary',
                      isUsed && 'cursor-default',
                    )}
                  >
                    <RadioGroup.Item
                      value={page.id ?? ''}
                      checked={selectedPage === page.id}
                      disabled={isUsed}
                      className="bg-background"
                      onClick={() =>
                        !isUsed && setSelectedPage(page.id ?? undefined)
                      }
                    />
                    <div
                      className={cn(
                        'min-w-0 flex-1 truncate font-semibold',
                        isUsed && 'text-muted-foreground',
                      )}
                    >
                      {page.name}
                    </div>
                    <FacebookPageUsage page={page} />
                  </Command.Item>
                );
              })}
            </Command.List>
          </RadioGroup>
        </Command>
      </div>
    </FacebookIntegrationFormLayout>
  );
};
