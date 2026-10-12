import { BroadcastEditor } from '../BroadcastEditor';
import { Form } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { IBroadcastFormData } from '../../hooks/useBroadcastForm';

export const BroadcastMessengerPreview = () => {
  const { control } = useFormContext<IBroadcastFormData>();
  return (
    <div className="h-full p-10">
      <div className="bg-white rounded-md h-full py-8">
        <Form.Field
          control={control}
          name="messenger.content"
          render={({ field }) => (
            <BroadcastEditor
              value={field.value}
              onChange={field.onChange}
              attribute
            />
          )}
        />
      </div>
    </div>
  );
};
