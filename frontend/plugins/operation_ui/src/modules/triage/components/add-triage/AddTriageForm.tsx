import { SelectTeam } from '@/team/components/SelectTeam';
import { useGetCurrentUsersTeams } from '@/team/hooks/useGetCurrentUsersTeams';
import { Block } from '@blocknote/core';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconChevronRight } from '@tabler/icons-react';

import {
  BlockEditor,
  Button,
  Form,
  Input,
  Separator,
  Sheet,
  useBlockEditor,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { currentUserState } from 'ui-modules';
import { addTriageSchema, IAddTriage } from '@/triage/types/triage';
import { useCreateTriage } from '@/triage/hooks/useCreateTriage';
import { SelectPriority } from '@/operation/components/SelectPriority';
import { SelectStatus } from '@/operation/components/SelectStatus';
import { toast } from 'erxes-ui';
import { STATUS_TYPES } from '@/operation/components/StatusInline';

export const AddTriageForm = ({
  onComplete,
}: {
  onComplete: (triageId: string) => void;
}) => {
  const { teamId } = useParams<{
    teamId?: string;
  }>();

  const { teams } = useGetCurrentUsersTeams();
  const currentUser = useAtomValue(currentUserState);
  const { createTriage, loading: createTriageLoading } = useCreateTriage();
  const [descriptionContent, setDescriptionContent] = useState<Block[]>();
  const editor = useBlockEditor();

  const [_teamId, _setTeamId] = useState<string | undefined>(teamId);

  const defaultValues = {
    teamId: _teamId || undefined,
    name: '',
    priority: 0,
    status: STATUS_TYPES.TRIAGE,
  };

  const form = useForm<IAddTriage>({
    resolver: zodResolver(addTriageSchema),
    defaultValues,
  });

  useEffect(() => {
    form.setFocus('name');
  }, [form]);

  useEffect(() => {
    if (teams && teams.length > 0 && !form.getValues('teamId') && !teamId) {
      form.setValue('teamId', teams[0]._id);
      _setTeamId(teams[0]._id);
    }
  }, [teams, form, teamId, currentUser]);

  const handleDescriptionChange = async () => {
    const content = await editor?.document;
    if (content) {
      content.pop();
      setDescriptionContent(content as Block[]);
    }
  };

  const onSubmit = async (data: IAddTriage) => {
    createTriage({
      variables: {
        input: {
          ...data,
          description: JSON.stringify(descriptionContent),
          priority: data.priority || 0,
          status: data.status || STATUS_TYPES.TRIAGE,
        },
      },
      onCompleted: ({ operationAddTriage }) => {
        toast({
          title: 'Success',
          description: 'Triage created successfully',
          variant: 'default',
        });

        onComplete(operationAddTriage._id);
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="h-full flex flex-col"
      >
        <Sheet.Header className="flex items-center gap-2 ">
          <Form.Field
            name="teamId"
            control={form.control}
            render={({ field }) => (
              <Form.Item className="space-y-0">
                <Form.Label className="sr-only">Team</Form.Label>
                <SelectTeam.FormItem
                  value={field.value || ''}
                  onValueChange={(value) => {
                    field.onChange(value);
                  }}
                  isTriageEnabled={true}
                  mode="single"
                />
              </Form.Item>
            )}
          />
          <IconChevronRight className="size-4" />
          <Sheet.Title className="">New triage</Sheet.Title>
        </Sheet.Header>
        <Sheet.Content className="px-7 py-4 gap-2 flex flex-col min-h-0">
          <Form.Field
            name="name"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label className="sr-only">Name</Form.Label>
                <Form.Control>
                  <Input
                    {...field}
                    className="shadow-none focus-visible:shadow-none h-8 text-xl p-0"
                    placeholder="Triage Name"
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
          <div className="flex gap-2 w-full">
            <Form.Field
              name="priority"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="sr-only">Priority</Form.Label>
                  <SelectPriority.FormItem
                    value={field.value || 0}
                    onValueChange={(value) => field.onChange(value)}
                  />
                </Form.Item>
              )}
            />
            <Form.Field
              name="status"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="sr-only">Status</Form.Label>
                  <SelectStatus.FormItem
                    value={field.value || STATUS_TYPES.TRIAGE}
                    onValueChange={(value) => field.onChange(value)}
                    useExtendedLabels={true}
                  />
                </Form.Item>
              )}
            />
          </div>
          <Separator className="my-4" />
          <div className="flex-1 overflow-y-auto">
            <BlockEditor
              editor={editor}
              onChange={handleDescriptionChange}
              className="read-only min-h-full"
            />
          </div>
        </Sheet.Content>
        <Sheet.Footer className="flex justify-end shrink-0 gap-1 px-5">
          <Sheet.Close asChild>
            <Button
              type="button"
              variant="ghost"
              className="bg-background hover:bg-background/90"
              onClick={async () => {
                form.reset();
                const doc = await editor?.document;
                if (doc?.length) {
                  editor?.removeBlocks(doc);
                }
                setDescriptionContent(undefined);
              }}
            >
              Cancel
            </Button>
          </Sheet.Close>
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={createTriageLoading}
          >
            Save
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
