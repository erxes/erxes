import { useSetAtom, useAtomValue, useAtom } from "jotai";
import { activeInstagramFormStepAtom, instagramFormSheetAtom, resetInstagramAddStateAtom } from "../states/instagramStates";
import { IgIntegrationProvider, useIgIntegrationContext } from "../context/IgIntegrationContext";
import { Button, Sheet } from "erxes-ui";
import { IconPlus } from "@tabler/icons-react";
import { InstagramGetAccounts } from "./InstagramGetAccounts";
import { IntegrationSteps } from "@/integrations/components/IntegrationSteps";
import { InstagramGetPages } from "./InstagramGetPages";
import { InstagramIntegrationSetup } from "./InstagramIntegrationSetup";


export const InstagramIntegrationFormSheet = ({
    isPost,
} : {
    isPost? : boolean; 
}) => {
    const [instagramFormSheet, setInstagramFormSheet] = useAtom(
        instagramFormSheetAtom,
    );

    return (
        <IgIntegrationProvider isPost={isPost}>
            <div>
                <Sheet open={instagramFormSheet} onOpenChange={setInstagramFormSheet}>
                    <Sheet.Trigger asChild>
                        <Button>
                            <IconPlus />
                            Add Instagram{' '}
                            {isPost ? 'Post Integration' : 'Messenger Integration'}
                        </Button>
                    </Sheet.Trigger>
                    <Sheet.View>
                        <InstagramIntegrationForm />
                    </Sheet.View>
                </Sheet>
            </div>
        </IgIntegrationProvider>
    )
};

export const InstagramIntegrationForm = () => {
    const activeStep = useAtomValue(activeInstagramFormStepAtom);

    return (
        <>
            {activeStep === 1 && <InstagramGetAccounts />}
            {activeStep === 2 && <InstagramGetPages />}
            {activeStep === 3 && <InstagramIntegrationSetup />}
        </>
    )
};

export const InstagramIntegrationFormLayout = ({
    children,
    actions,
} : {
    children: React.ReactNode;
    actions: React.ReactNode;
}) => {
    const resetForm = useSetAtom(resetInstagramAddStateAtom);
    const { isPost } = useIgIntegrationContext();

    return (
        <>
            <Sheet.Header>
                <Sheet.Title>
                    Add Facebook {isPost ? 'Post' : 'Messenger'}
                </Sheet.Title>
                <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="flex flex-col overflow-hidden">
                {children}
            </Sheet.Content>
            <Sheet.Footer>
                <Sheet.Close asChild>
                    <Button 
                    className="mr-auto text-muted-foreground" 
                    variant="ghost" 
                    onClick={resetForm}
                    >
                        Cancel
                    </Button>
                </Sheet.Close>
                {actions}
            </Sheet.Footer>
        </>
    );
}

export const InstagramIntegrationFormSteps = ({
    step,
    description,
} : {
    title : string;
    step : number;
    description : string;
}) => {
    return(
        <IntegrationSteps
            step={step}
            title="Connect accounts"
            stepsLength={3}
            description={description}
        />
    );
}


