import { useAtom, useSetAtom } from "jotai"
import { selectedInstagramPageAtom, activeInstagramFormStepAtom } from "../states/instagramStates"
import { useInstagramPages } from "../hooks/useInstagramPages";
import { InstagramIntegrationFormLayout, InstagramIntegrationFormSteps } from "./InstagramIntegrationForm";
import { Button, RadioGroup, Command, Input, cn } from "erxes-ui";




export const InstagramGetPages = () => {
    const [selectedPage, setSelectedPage] = useAtom(selectedInstagramPageAtom);
    const { instagramGetPages } = useInstagramPages();
    const setActiveStep = useSetAtom(activeInstagramFormStepAtom);

    return(
        <InstagramIntegrationFormLayout
          actions = {
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
            <InstagramIntegrationFormSteps
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
                {instagramGetPages.length} pages found
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