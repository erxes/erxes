import { Form } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { BroadcastEmailEditor } from '../BroadcastEmailEditor';

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
          bg-white overflow-y-auto rounded-xl h-full py-8 border border-gray-200 transition-all duration-300
          ${
            hasError
              ? 'shadow-[0_0_15px_rgba(239,68,68,0.5)]'
              : 'shadow-sm hover:shadow-md'
          }
        `}
      >
        <Form.Field
          name="email.contentJson"
          control={control}
          rules={{ required: 'Content is required' }}
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <BroadcastEmailEditor
                  contentJson={field.value}
                  onChange={field.onChange}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
      </div>
    </div>
  );
};
