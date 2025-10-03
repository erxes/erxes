import { Form } from 'erxes-ui';
import FormField from '@/settings/profile/components/fields/FormField';
import { FormType } from '@/settings/profile/hooks/useProfileForm';

const DefaultFields = () => {
  return (
    <div className="grid grid-cols-2 gap-6 mt-0.5">
      <div className="flex flex-col gap-2">
        <Form.Label className="text-xs">First Name</Form.Label>
        <FormField
          name={'details.firstName' as keyof FormType}
          element="input"
          attributes={{
            type: 'text',
            placeholder: 'Enter First Name',
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Form.Label className="text-xs">Last Name</Form.Label>
        <FormField
          name={'details.lastName' as keyof FormType}
          element="input"
          attributes={{
            type: 'text',
            placeholder: 'Enter Last Name',
          }}
        />
      </div>
    </div>
  );
};

export default DefaultFields;
