import { Button, cn, Command, Input, RadioGroup } from 'erxes-ui';
import {
  FacebookIntegrationFormLayout,
  FacebookIntegrationFormSteps,
} from './FacebookIntegrationForm';
import { useAtom, useSetAtom } from 'jotai';
import {
  activeFacebookFormStepAtom,
  selectedFacebookPageAtom,
} from '../states/facebookStates';
import { useFacebookPages } from '../hooks/useFacebookPages';

export const FacebookGetPages = () => {
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
            Previous step
          </Button>
          <Button disabled={!selectedPage} onClick={() => setActiveStep(3)}>
            Next step
          </Button>
        </>
      }
    >
      <FacebookIntegrationFormSteps
        title="Connect pages"
        step={2}
        description="Select the pages where you want to integrate its pages with."
      />
      <div className="flex-1 overflow-hidden p-4 pt-0">
        <Command>
          <div className="p-1">
            <Command.Primitive.Input asChild>
              <Input placeholder="Search for a page" />
            </Command.Primitive.Input>
          </div>
          <div className="flex justify-between items-center px-1 py-2">
            <div className="text-sm text-muted-foreground">
              {facebookGetPages.length} pages found
            </div>
          </div>
          <RadioGroup
            value={selectedPage}
            onValueChange={(value) =>
              setSelectedPage(value === selectedPage ? undefined : value)
            }
          >
            <Command.List>
              {facebookGetPages.map((page) => (
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
                  <RadioGroup.Item value={page.id} className="bg-background" />
                  <div className="font-semibold">{page.name}</div>
                </Command.Item>
              ))}
            </Command.List>
          </RadioGroup>
        </Command>
      </div>
    </FacebookIntegrationFormLayout>
  );
};
