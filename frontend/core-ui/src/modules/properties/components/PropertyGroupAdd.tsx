import { IPropertyGroupForm } from '@/properties/types/Properties';
import { Button, Sheet } from 'erxes-ui';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useAddPropertyGroup } from '../hooks/useAddPropertyGroup';
import { zodResolver } from '@hookform/resolvers/zod';
import { propertyGroupSchema } from '../propertySchema';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { PropertyGroupForm } from './PropertyGroupForm';

export const AddPropertyGroup = () => {
  const { type } = useParams<{ type: string }>();
  const location = useLocation();

  const { addPropertyGroup, loading } = useAddPropertyGroup();
  const form = useForm<IPropertyGroupForm>({
    resolver: zodResolver(propertyGroupSchema),
    defaultValues: {
      name: '',
      code: '',
    },
  });
  const [open, setOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const submitHandler: SubmitHandler<IPropertyGroupForm> = (data) => {
    addPropertyGroup({
      variables: {
        name: data.name,
        code: data.code,
        contentType: type,
      },
      onCompleted: () => {
        form.reset();
        setOpen(false);
        navigate(`/settings/properties/type`);
      },
    });
  };

  if (
    location.pathname.includes('add') ||
    location.pathname.split(type || '')[1]?.length > 2
  ) {
    return null;
  }

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <Sheet.Trigger asChild>
        <Button variant="outline">Add Group</Button>
      </Sheet.Trigger>
      <Sheet.View
        className="p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <PropertyGroupForm
          onSubmit={submitHandler}
          loading={loading}
          defaultValues={form.getValues()}
          onCancel={() => setOpen(false)}
        />
      </Sheet.View>
    </Sheet>
  );
};
