import { Form } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { SelectBrand, SelectMember } from 'ui-modules';
import { BroadcastRules } from '../BroadcastRules';
import { BroadcastSelectMessengerMessageSentAs } from '../select/BroadcastSelectMessengerMessageSentAs';
import { BroadcastSelectMessengerMessageType } from '../select/BroadcastSelectMessengerMessageType';

export const BroadcastMessengerMethod = () => {
  const { control } = useFormContext();

  return (
    <form className="flex flex-col h-full gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Form.Field
          name="fromUserId"
          control={control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>From User</Form.Label>
              <Form.Control>
                <SelectMember.FormItem
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select team members"
                />
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          name="messenger.brandId"
          control={control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Brand</Form.Label>
              <Form.Control>
                <SelectBrand.FormItem
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select brand"
                />
              </Form.Control>
            </Form.Item>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Form.Field
          name="messenger.kind"
          control={control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Message type</Form.Label>
              <Form.Control>
                <BroadcastSelectMessengerMessageType
                  value={field.value}
                  onValueChange={field.onChange}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          name="messanger.sentAs"
          control={control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Sent as</Form.Label>
              <Form.Control>
                <BroadcastSelectMessengerMessageSentAs
                  value={field.value}
                  onValueChange={field.onChange}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
      </div>

      <BroadcastRules />
    </form>
  );
};
