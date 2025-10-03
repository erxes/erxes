import React from 'react';
import { useTeamForm } from '@/team/hooks/useTeamForm';
import { ITeam, TTeamForm } from '@/team/types';
import { Form, Input, Textarea, IconPicker, Button } from 'erxes-ui';
import { useTeamUpdate } from '@/team/hooks/useTeamUpdate';
import { useToast } from 'erxes-ui';
import { SubmitHandler } from 'react-hook-form';

export const UpdateTeamForm = ({ team }: { team: ITeam }) => {
  const { toast } = useToast();
  const { updateTeam } = useTeamUpdate();

  const form = useTeamForm({
    defaultValues: {
      name: team.name,
      description: team.description,
      icon: team.icon,
    },
  });

  const submitHandler: SubmitHandler<TTeamForm> = React.useCallback(
    async (data) => {
      updateTeam({
        variables: {
          _id: team._id,
          ...data,
        },
        onCompleted: () => {
          toast({ title: 'Success!' });
        },
        onError: (error) =>
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          }),
      });
    },
    [updateTeam, toast, team._id],
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submitHandler)}
        className="flex flex-col gap-2 size-full"
      >
        <div className="flex w-full gap-4">
          <div className="flex-shrink-0">
            <Form.Field
              control={form.control}
              name="icon"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Icon</Form.Label>
                  <Form.Description className="sr-only">Icon</Form.Description>
                  <Form.Control>
                    <IconPicker
                      onValueChange={field.onChange}
                      value={field.value}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>

          <div className="flex-1">
            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Name</Form.Label>
                  <Form.Control>
                    <Input {...field} className="w-full" />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
        </div>
        <Form.Field
          control={form.control}
          name="description"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>description</Form.Label>
              <Form.Description className="sr-only">
                description
              </Form.Description>
              <Form.Control>
                <Textarea {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit">Update</Button>
        </div>
      </form>
    </Form>
  );
};
