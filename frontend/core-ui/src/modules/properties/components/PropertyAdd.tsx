import { PropertyForm } from './PropertyForm';
import { IPropertyForm } from '../types/Properties';
import { useAddProperty } from '../hooks/useAddProperty';
import { toast } from 'erxes-ui';
import { useParams } from 'react-router';

export const AddProperty = () => {
  const { groupId, type } = useParams<{
    groupId: string;
    type: string;
  }>();
  const { addProperty, loading } = useAddProperty();

  const onSubmit = (data: IPropertyForm) => {
    // console.log(data);
    addProperty({
      variables: {
        ...data,
        groupId,
        contentType: type,
      },
      onCompleted: () => {
        toast({ title: 'Property added', variant: 'success' });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          variant: 'destructive',
          description: error.message,
        });
      },
    });
  };

  return (
    <div className="mx-auto max-w-lg w-full px-4 py-8">
      <PropertyForm
        onSubmit={onSubmit}
        loading={loading}
        defaultValues={{
          icon: '',
          name: '',
          type: type || '',
          isSearchable: false,
          description: '',
          code: '',
          validation: '',
          options: [],
        }}
      />
    </div>
  );
};
