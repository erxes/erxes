import { Form } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { BroadcastEditor } from '../BroadcastEditor';

export const BroadcastEmailPreview = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const hasError = !!errors?.email;

  return (
    <div className="h-full p-10">
      <div
        className={`
          bg-white rounded-xl h-full py-8 border border-gray-200 transition-all duration-300
          ${hasError 
            ? 'shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
            : 'shadow-sm hover:shadow-md'}
        `}
      >
        <Form.Field
          name="email.content"
          control={control}
          rules={{ required: 'Content is required' }}
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <BroadcastEditor attribute document {...field} />
              </Form.Control>
            </Form.Item>
          )}
        />
      </div>
    </div>
  );
};
