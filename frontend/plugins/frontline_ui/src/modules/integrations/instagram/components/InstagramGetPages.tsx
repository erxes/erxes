import { Button, cn, Command, Input, RadioGroup } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  InstagramIntegrationFormLayout,
  InstagramIntegrationFormSteps,
} from './InstagramIntegrationForm';
import { useAtom, useSetAtom } from 'jotai';
import {
  activeInstagramFormStepAtom,
  selectedInstagramPageAtom,
} from '../states/instagramStates';
import { useInstagramPages } from '../hooks/useInstagramPages';
import { useIgIntegrationContext } from '../context/IgIntegrationContext';

export const InstagramGetPages = () => {
  const { t } = useTranslation('frontline');
  const { isPost } = useIgIntegrationContext();
  const [selectedPage, setSelectedPage] = useAtom(selectedInstagramPageAtom);
  const { instagramGetPages } = useInstagramPages({
    kind: isPost ? 'instagram-post' : 'instagram-messenger',
  });
  const setActiveStep = useSetAtom(activeInstagramFormStepAtom);

  return (
    <InstagramIntegrationFormLayout
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
      <InstagramIntegrationFormSteps
        title={t('connect-pages')}
        step={2}
        description={t('ig-select-pages-description')}
      />
      <div className="flex-1 overflow-hidden p-4 pt-0">
        <Command>
          <div className="p-1">
            <Command.Primitive.Input asChild>
              <Input placeholder={t('search-for-a-page')} />
            </Command.Primitive.Input>
          </div>
          <div className="flex justify-between items-center px-1 py-2">
            <div className="text-sm text-muted-foreground">
              {t('pages-found', { count: instagramGetPages.length })}
            </div>
          </div>
          <RadioGroup
            value={selectedPage}
            onValueChange={(value) =>
              setSelectedPage(value === selectedPage ? undefined : value)
            }
          >
            <Command.List>
              {instagramGetPages.map((page) => (
                <Command.Item
                  disabled={page.isUsed}
                  key={page.id}
                  value={page.name}
                  onSelect={() =>
                    setSelectedPage(
                      selectedPage === page.id ? undefined : page.id,
                    )
                  }
                  className={cn(
                    'gap-3 border-t last-of-type:border-b rounded-none h-10 px-3',
                    selectedPage === page.id && 'text-primary',
                  )}
                >
                  <RadioGroup.Item
                    value={page.id}
                    checked={selectedPage === page.id}
                    className="bg-background"
                    onClick={() => setSelectedPage(page.id)}
                  />
                  <div className="font-semibold">{page.name}</div>
                </Command.Item>
              ))}
            </Command.List>
          </RadioGroup>
        </Command>
      </div>
    </InstagramIntegrationFormLayout>
  );
};
