import { EmailAddressesRecordTable } from '@/settings/email-addresses/components/EmailAddressesRecordTable';
import { EmailDeliveriesRecordTable } from '@/settings/email-deliveries/components/EmailDeliveriesRecordTable';
import { Sheet, Tabs, useQueryState } from 'erxes-ui';

export const TeamMemberActivityLogSheet = ({
  email,
  open,
  onOpenChange,
}: {
  email: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}): JSX.Element => {
  const [, setDeliveryId] = useQueryState<string>('deliveryId');

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setDeliveryId(null);
        onOpenChange(nextOpen);
      }}
    >
      <Sheet.View className="flex flex-col gap-0 sm:max-w-6xl">
        <Sheet.Header>
          <Sheet.Title>Activity log</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="min-h-0 flex-1 overflow-auto">
          {open &&
            (email.trim() ? (
              <Tabs key={email} defaultValue="messages">
                <p className="px-4 pt-4 text-sm text-muted-foreground">
                  {email}
                </p>
                <Tabs.List
                  className="w-full justify-start px-4"
                  aria-label="Email activity"
                >
                  <Tabs.Trigger value="messages">Messages</Tabs.Trigger>
                  <Tabs.Trigger value="addresses">Addresses</Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="messages">
                  <EmailDeliveriesRecordTable
                    email={email.trim().toLowerCase()}
                  />
                </Tabs.Content>
                <Tabs.Content value="addresses">
                  <EmailAddressesRecordTable
                    email={email.trim().toLowerCase()}
                  />
                </Tabs.Content>
              </Tabs>
            ) : (
              <p className="p-4 text-muted-foreground">
                This member has no email address.
              </p>
            ))}
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
