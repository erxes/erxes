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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('frontline');
  const { whatsappGetBusinessAccounts, loading, error, refetch } =
    useWhatsappBusinessAccounts();
  const [selectedWaba, setSelectedWaba] = useAtom(
    selectedWhatsappBusinessAccountAtom,
  );
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useAtom(
    selectedWhatsappPhoneNumberAtom,
  );
  const setActiveStep = useSetAtom(activeWhatsappFormStepAtom);

  const waba = whatsappGetBusinessAccounts.find(({ id }) => id === selectedWaba);
  const phoneNumbers = waba?.phoneNumbers;

  useEffect(() => {
    if (!phoneNumbers) {
      setSelectedPhoneNumber(undefined);
      return;
    }

    if (phoneNumbers.length === 1) {
      setSelectedPhoneNumber(phoneNumbers[0].id);
      return;
    }

    setSelectedPhoneNumber((previous) =>
      previous && phoneNumbers.some(({ id }) => id === previous)
        ? previous
        : undefined,
    );
  }, [phoneNumbers, setSelectedPhoneNumber]);

  const canContinue = !!selectedWaba && !!selectedPhoneNumber;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground px-1 py-2">
          <Spinner className="w-3 h-3" />
          {t(
            'loading-whatsapp-business-accounts',
            'Loading WhatsApp Business Accounts...',
          )}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
          <div className="text-sm font-medium text-destructive">
            {t(
              'failed-to-load-whatsapp-business-accounts',
              'Failed to load WhatsApp Business Accounts',
            )}
          </div>
          <div className="text-sm text-muted-foreground">{error.message}</div>
          <Button type="button" variant="secondary" onClick={() => refetch()}>
            {t('retry', 'Retry')}
          </Button>
        </div>
      );
    }

    if (whatsappGetBusinessAccounts.length === 0) {
      return (
        <div className="p-6 text-sm text-muted-foreground text-center">
          {t(
            'no-whatsapp-business-accounts',
            'No WhatsApp Business Account is available for the selected Facebook Page.',
          )}
        </div>
      );
    }

    return (
      <RadioGroup
        value={selectedWaba}
        onValueChange={(value) => setSelectedWaba(value)}
      >
        <Command>
          <Command.List>
            {whatsappGetBusinessAccounts.map((businessAccount) => (
              <Command.Item
                key={businessAccount.id}
                value={businessAccount.name}
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
                  {t('phone-number-count', {
                    count: businessAccount.phoneNumbers?.length ?? 0,
                    defaultValue:
                      (businessAccount.phoneNumbers?.length ?? 0) === 1
                        ? '1 phone number'
                        : '{{count}} phone numbers',
                  })}
                </div>
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </RadioGroup>
    );
  };

  return (
    <WhatsappIntegrationFormLayout
      actions={
        <>
          <Button
            type="button"
            variant="secondary"
            className="bg-border"
            onClick={() => {
              setActiveStep(2);
              setSelectedWaba(undefined);
              setSelectedPhoneNumber(undefined);
            }}
          >
            {t('previous-step')}
          </Button>
          <Button
            type="button"
            disabled={!canContinue}
            onClick={() => setActiveStep(4)}
          >
            {t('next-step')}
          </Button>
        </>
      }
    >
      <WhatsappIntegrationFormSteps
        title={t(
          'select-whatsapp-business-account',
          'Select WhatsApp Business Account',
        )}
        step={3}
        description={t(
          'whatsapp-business-account-description',
          'Select the WhatsApp Business Account available through your Facebook Page.',
        )}
      />
      <div className="flex-1 overflow-hidden p-4 pt-0 flex flex-col gap-4">
        {renderContent()}

        {waba && (phoneNumbers?.length ?? 0) === 0 && (
          <div className="text-sm text-muted-foreground px-1">
            {t(
              'whatsapp-account-no-phone-numbers',
              'The selected WhatsApp Business Account has no phone numbers.',
            )}
          </div>
        )}

        {waba && (phoneNumbers?.length ?? 0) > 1 && (
          <div className="flex flex-col gap-2 px-1">
            <Label>{t('phone-number')}</Label>
            <Select
              value={selectedPhoneNumber}
              onValueChange={setSelectedPhoneNumber}
            >
              <Select.Trigger className="w-full">
                <Select.Value placeholder={t('select-a-phone')} />
              </Select.Trigger>
              <Select.Content>
                {(phoneNumbers ?? []).map((phoneNumber) => (
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
