import { Button, cn, Command, Input, RadioGroup, Spinner } from 'erxes-ui';
import { useAtom, useSetAtom } from 'jotai';
import {
  activeWhatsappFormStepAtom,
  selectedWhatsappPageAtom,
} from '../states/whatsappStates';
import { useWhatsappPages } from '../hooks/useWhatsappPages';
import {
  WhatsappIntegrationFormLayout,
  WhatsappIntegrationFormSteps,
} from './WhatsappIntegrationForm';

export const WhatsappGetPages = () => {
  const [selectedPage, setSelectedPage] = useAtom(selectedWhatsappPageAtom);
  const { whatsappGetPages, loading, error } = useWhatsappPages();
  const setActiveStep = useSetAtom(activeWhatsappFormStepAtom);

  return (
    <WhatsappIntegrationFormLayout
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
            Previous step
          </Button>
          <Button disabled={!selectedPage} onClick={() => setActiveStep(3)}>
            Next step
          </Button>
        </>
      }
    >
      <WhatsappIntegrationFormSteps
        title="Connect pages"
        step={2}
        description="Select the Facebook Page to use for the WhatsApp integration."
      />
      <div className="flex-1 overflow-hidden p-4 pt-0">
        <Command>
          <div className="p-1">
            <Command.Primitive.Input asChild>
              <Input placeholder="Search for a page" />
            </Command.Primitive.Input>
          </div>
          <div className="flex justify-between items-center px-1 py-2">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              {loading ? (
                <>
                  <Spinner className="w-3 h-3" />
                  Loading pages...
                </>
              ) : (
                `${whatsappGetPages.length} pages found`
              )}
            </div>
          </div>
          {error ? (
            <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
              <div className="text-sm font-medium text-destructive">
                Failed to load Facebook Pages
              </div>
              <div className="text-sm text-muted-foreground">
                {error.message}
              </div>
            </div>
          ) : (
            <RadioGroup
              value={selectedPage}
              onValueChange={(value) =>
                setSelectedPage(value === selectedPage ? undefined : value)
              }
            >
              <Command.List>
                {!loading && whatsappGetPages.length === 0 && (
                  <div className="p-6 text-sm text-muted-foreground text-center">
                    No Facebook Pages found for the selected account.
                  </div>
                )}
                {whatsappGetPages.map((page) => (
                  <Command.Item
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
          )}
        </Command>
      </div>
    </WhatsappIntegrationFormLayout>
  );
};
