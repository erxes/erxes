import { Sheet } from 'erxes-ui';
import { PropertyGroupForm } from './PropertyGroupForm';
import { useFieldGroupEdit } from '../hooks/useFieldGroupEdit';
import { activePropertyState } from '../states/activePropertyState';
import { useAtom } from 'jotai';
import { IPropertyGroupForm } from '../types/Properties';

export const PropertyGroupEditSheet = () => {
  const [activePropertyGroup, setActivePropertyGroup] =
    useAtom(activePropertyState);
  const { editFieldGroup, loading } = useFieldGroupEdit();

  const submitHandler = (data: IPropertyGroupForm) => {
    editFieldGroup({
      variables: { id: activePropertyGroup?._id, ...data },
      onCompleted: () => {
        setActivePropertyGroup(null);
      },
      refetchQueries: ['FieldGroups'],
    });
  };

  return (
    <Sheet
      onOpenChange={() => setActivePropertyGroup(null)}
      open={!!activePropertyGroup}
    >
      <Sheet.View
        className="p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        {activePropertyGroup && (
          <PropertyGroupForm
            onSubmit={submitHandler}
            loading={loading}
            defaultValues={{
              name: activePropertyGroup.name,
              code: activePropertyGroup.code,
            }}
            onCancel={() => setActivePropertyGroup(null)}
          />
        )}
      </Sheet.View>
    </Sheet>
  );
};
