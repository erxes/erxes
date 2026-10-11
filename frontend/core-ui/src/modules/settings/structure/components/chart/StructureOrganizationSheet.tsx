import { ReactNode } from 'react';
import { IconBuilding } from '@tabler/icons-react';
import {
  Button,
  Form,
  Input,
  PhoneInput,
  Sheet,
  Spinner,
} from 'erxes-ui';
import { Can, SelectMember } from 'ui-modules';
import {
  useAddStructureDetail,
  useEditStructureDetail,
  useStructureDetails,
} from '../../hooks/useStructureDetails';
import { useStructureDetailsForm } from '../../hooks/useStructureDetailsForm';
import { StructureDetailsFormT } from '../../types/structure';

const OrganizationForm = () => {
  const {
    structureDetail,
    loading: detailsLoading,
    error,
  } = useStructureDetails();
  const {
    methods,
    methods: { control, handleSubmit },
  } = useStructureDetailsForm(structureDetail);
  const { handleEdit, loading: editing } = useEditStructureDetail();
  const { handleAdd, loading: adding } = useAddStructureDetail();

  const onSubmit = (data: StructureDetailsFormT) => {
    if (!structureDetail?._id) {
      return handleAdd({ variables: data });
    }
    return handleEdit({ variables: { ...data, id: structureDetail._id } });
  };

  if (detailsLoading) {
    return (
      <div className="grid place-items-center py-16">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="px-4 py-8 text-sm text-destructive">
        Error loading structure: {error.message}
      </div>
    );
  }

  return (
    <Form {...methods}>
      <form
        className="flex h-full min-h-0 flex-col"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Sheet.Content className="styled-scroll grow overflow-auto px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <Form.Field
              control={control}
              name="title"
              render={({ field }) => (
                <Form.Item className="col-span-2">
                  <Form.Label>Name</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={control}
              name="description"
              render={({ field }) => (
                <Form.Item className="col-span-2">
                  <Form.Label>Description</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={control}
              name="supervisorId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Supervisor</Form.Label>
                  <SelectMember.FormItem
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select supervisor"
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={control}
              name="code"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Code</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={control}
              name="phoneNumber"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Phone number</Form.Label>
                  <Form.Control>
                    <PhoneInput
                      {...field}
                      value={structureDetail?.phoneNumber ?? ''}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={control}
              name="email"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Email</Form.Label>
                  <Form.Control>
                    <Input {...field} type="email" />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
        </Sheet.Content>
        <Sheet.Footer>
          <Can action="structuresManage">
            <Button type="submit" disabled={editing || adding}>
              {(editing || adding) && <Spinner size="sm" />}
              Save
            </Button>
          </Can>
        </Sheet.Footer>
      </form>
    </Form>
  );
};

export const StructureOrganizationSheet = ({
  trigger,
}: {
  trigger: ReactNode;
}) => (
  <Sheet>
    <Sheet.Trigger asChild>{trigger}</Sheet.Trigger>
    <Sheet.View className="flex flex-col p-0">
      <Sheet.Header>
        <Sheet.Title className="flex items-center gap-2 text-lg">
          <IconBuilding size={16} /> Organization
        </Sheet.Title>
        <Sheet.Close />
      </Sheet.Header>
      <OrganizationForm />
    </Sheet.View>
  </Sheet>
);
