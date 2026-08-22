import { useEffect } from 'react';
import {
  Button,
  cn,
  Command,
  Label,
  RadioGroup,
  Select,
  Spinner,
} from 'erxes-ui';
import { useAtom, useSetAtom } from 'jotai';
import { useWhatsappBusinessAccounts } from '../hooks/useWhatsappBusinessAccounts';
import {
  activeWhatsappFormStepAtom,
  selectedWhatsappBusinessAccountAtom,
  selectedWhatsappPhoneNumberAtom,
} from '../states/whatsappStates';
import {
  WhatsappIntegrationFormLayout,
  WhatsappIntegrationFormSteps,
} from './WhatsappIntegrationForm';

export const WhatsappGetBusinessAccounts = () => {
  const { whatsappGetBusinessAccounts, loading, error } =
    useWhatsappBusinessAccounts();
  const [selectedWaba, setSelectedWaba] = useAtom(
    selectedWhatsappBusinessAccountAtom,
  );
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useAtom(
    selectedWhatsappPhoneNumberAtom,
  );
  const setActiveStep = useSetAtom(activeWhatsappFormStepAtom);

  const waba = whatsappGetBusinessAccounts.find(({ id }) => id === selectedWaba);
  const phoneNumbers = waba?.phoneNumbers || [];

  useEffect(() => {
    if (!waba) {
      return;
    }

    const numbers = waba.phoneNumbers || [];

    if (numbers.length === 1) {
      setSelectedPhoneNumber(numbers[0].id);
    } else {
      setSelectedPhoneNumber(undefined);
    }
  }, [waba, setSelectedPhoneNumber]);

  const canContinue = !!selectedWaba && !!selectedPhoneNumber;

  return (
    <WhatsappIntegrationFormLayout
      actions={
        <>
          <Button
            variant="secondary"
            className="bg-border"
            onClick={() => {
              setActiveStep(2);
              setSelectedWaba(undefined);
              setSelectedPhoneNumber(undefined);
            }}
          >
            Previous step
          </Button>
          <Button disabled={!canContinue} onClick={() => setActiveStep(4)}>
            Next step
          </Button>
        </>
      }
    >
      <WhatsappIntegrationFormSteps
        title="Select WhatsApp Business Account"
        step={3}
        description="Select the WhatsApp Business Account available through your Facebook Page."
      />
      <div className="flex-1 overflow-hidden p-4 pt-0 flex flex-col gap-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground px-1 py-2">
            <Spinner className="w-3 h-3" />
            Loading WhatsApp Business Accounts...
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
            <div className="text-sm font-medium text-destructive">
              Failed to load WhatsApp Business Accounts
            </div>
            <div className="text-sm text-muted-foreground">{error.message}</div>
          </div>
        ) : whatsappGetBusinessAccounts.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground text-center">
            No WhatsApp Business Account is available for the selected Facebook
            Page.
          </div>
        ) : (
          <RadioGroup
            value={selectedWaba}
            onValueChange={(value) => setSelectedWaba(value)}
          >
            <Command>
              <Command.List>
                {whatsappGetBusinessAccounts.map((businessAccount) => (
                  <Command.Item
                    key={businessAccount.id}
                    value={businessAccount.id}
                    onSelect={() => setSelectedWaba(businessAccount.id)}
                    className={cn(
                      'gap-3 border-t last-of-type:border-b rounded-none h-10 px-3',
                      selectedWaba === businessAccount.id && 'text-primary',
                    )}
                  >
                    <RadioGroup.Item
                      value={businessAccount.id}
                      checked={selectedWaba === businessAccount.id}
                      className="bg-background"
                      onClick={() => setSelectedWaba(businessAccount.id)}
                    />
                    <div className="font-semibold">{businessAccount.name}</div>
                    <div className="text-sm text-muted-foreground font-mono ml-auto">
                      {businessAccount.phoneNumbers.length} phone number
                      {businessAccount.phoneNumbers.length === 1 ? '' : 's'}
                    </div>
                  </Command.Item>
                ))}
              </Command.List>
            </Command>
          </RadioGroup>
        )}

        {waba && phoneNumbers.length === 0 && (
          <div className="text-sm text-muted-foreground px-1">
            The selected WhatsApp Business Account has no phone numbers.
          </div>
        )}

        {waba && phoneNumbers.length > 1 && (
          <div className="flex flex-col gap-2 px-1">
            <Label>Phone number</Label>
            <Select
              value={selectedPhoneNumber}
              onValueChange={setSelectedPhoneNumber}
            >
              <Select.Trigger className="w-full">
                <Select.Value placeholder="Select a phone number" />
              </Select.Trigger>
              <Select.Content>
                {phoneNumbers.map((phoneNumber) => (
                  <Select.Item key={phoneNumber.id} value={phoneNumber.id}>
                    {phoneNumber.displayPhoneNumber || phoneNumber.id}
                    {phoneNumber.verifiedName
                      ? ` (${phoneNumber.verifiedName})`
                      : ''}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        )}
      </div>
    </WhatsappIntegrationFormLayout>
  );
};
