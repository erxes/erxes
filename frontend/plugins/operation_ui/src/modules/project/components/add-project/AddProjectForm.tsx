import { SelectPriority } from '@/operation/components/SelectPriority';
import { SelectStatus } from '@/operation/components/SelectStatus';
import { DateSelect, SelectLead } from '@/project/components/select';
import { useCreateProject } from '@/project/hooks/useCreateProject';
import { TAddProject, addProjectSchema } from '@/project/types';
import { ITask } from '@/task/types';
import { SelectTeam } from '@/team/components/SelectTeam';
import { useGetCurrentUsersTeams } from '@/team/hooks/useGetCurrentUsersTeams';
import { Block } from '@blocknote/core';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconChevronRight } from '@tabler/icons-react';
import {
  BlockEditor,
  Button,
  Form,
  IconPicker,
  Input,
  Separator,
  Sheet,
  useBlockEditor,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  OperationMembersChip,
  OperationTagsChip,
} from '@/operation/components/OperationChips';

export const AddProjectForm = ({
  onClose,
  onComplete,
  task,
  contacts,
}: {
  onClose: () => void;
  onComplete?: (projectId: string) => void;
  task?: ITask;
  // Customers / companies the project is created for; linked on the server.
  contacts?: { customerId?: string; companyId?: string };
}) => {
  const { t } = useTranslation('operation');
  const navigate = useNavigate();
  const { teamId } = useParams();
  const { createProject } = useCreateProject();
  const editor = useBlockEditor();
  const [descriptionContent, setDescriptionContent] = useState<Block[]>();
  const form = useForm<TAddProject>({
    resolver: zodResolver(addProjectSchema),
    defaultValues: {
      teamIds: teamId ? [teamId] : [],
      icon: 'IconBox',
      name: task?.name || '',
      status: 2,
      priority: task?.priority || 0,
      leadId: task?.assigneeId || undefined,
      memberIds: [] as string[],
      targetDate: task?.targetDate ? new Date(task?.targetDate) : undefined,
      convertedFromId: task?._id,
      tagIds: [] as string[],
    },
  });
  useEffect(() => {
    form.setFocus('name');
  }, []);

  const { teams } = useGetCurrentUsersTeams({
    skip: !!teamId,
  });

  useEffect(() => {
    if (!teamId && teams && teams?.length > 0) {
      form.setValue('teamIds', [teams[0]._id]);
    }
  }, [form, teams, teamId]);

  const handleDescriptionChange = async () => {
    const content = await editor?.document;
    if (content) {
      content.pop();
      setDescriptionContent(content as Block[]);
    }
  };

  const onSubmit = async (data: TAddProject) => {
    const project = await createProject({
      variables: {
        ...data,
        ...contacts,
        description: JSON.stringify(descriptionContent),
      },
      // The project keeps its contacts itself; project lists (contacts'
      // included) are read again.
      update: (cache) =>
        cache.evict({ id: 'ROOT_QUERY', fieldName: 'getProjects' }),
    });

    if (project?.data?.createProject?.convertedFromId) {
      navigate(
        `/operation/projects/${project?.data?.createProject._id}/overview`,
      );
    }

    const projectId = project?.data?.createProject?._id;
    if (projectId) onComplete?.(projectId);
    onClose();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="h-full flex flex-col"
      >
        <Sheet.Header className="flex items-center gap-2 ">
          <Form.Field
            name="teamIds"
            control={form.control}
            render={({ field }) => (
              <Form.Item className="space-y-0">
                <Form.Label className="sr-only">{t('team')}</Form.Label>
                <SelectTeam.FormItem
                  value={field.value}
                  onValueChange={field.onChange}
                />
              </Form.Item>
            )}
          />
          <IconChevronRight className="size-4" />
          <Sheet.Title className="">{t('new-project')}</Sheet.Title>
        </Sheet.Header>
        <Sheet.Content className="px-7 py-4 gap-2 flex flex-col min-h-0">
          <Form.Field
            control={form.control}
            name="icon"
            render={({ field }) => (
              <Form.Item>
                <Form.Label className="sr-only">{t('icon')}</Form.Label>
                <Form.Control>
                  <IconPicker
                    onValueChange={field.onChange}
                    value={field.value}
                    variant="secondary"
                    size="icon"
                    className="w-min p-2"
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
          <Form.Field
            name="name"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label className="sr-only">{t('name')}</Form.Label>
                <Form.Control>
                  <Input
                    {...field}
                    className="shadow-none focus-visible:shadow-none h-8 text-xl p-0"
                    placeholder={t('project-name')}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
          <div className="gap-2 flex flex-wrap w-full">
            <Form.Field
              name="status"
              control={form.control}
              render={({ field }) => (
                <Form.Item className="shrink-0">
                  <Form.Label className="sr-only">{t('status')}</Form.Label>
                  <SelectStatus.FormItem
                    value={field.value}
                    onValueChange={field.onChange}
                    label={t('status')}
                  />
                </Form.Item>
              )}
            />
            <Form.Field
              name="priority"
              control={form.control}
              render={({ field }) => (
                <Form.Item className="shrink-0">
                  <Form.Label className="sr-only">{t('priority')}</Form.Label>
                  <SelectPriority.FormItem
                    value={field.value}
                    onValueChange={field.onChange}
                    label={t('priority')}
                  />
                </Form.Item>
              )}
            />
            <Form.Field
              name="leadId"
              control={form.control}
              render={({ field }) => (
                <Form.Item className="shrink-0">
                  <Form.Label className="sr-only">{t('lead')}</Form.Label>
                  <SelectLead.FormItem
                    {...field}
                    value={field.value}
                    onValueChange={(value: string | string[] | null) => {
                      field.onChange(value || undefined);
                    }}
                    teamIds={form.getValues('teamIds')}
                    label={t('lead')}
                  />
                </Form.Item>
              )}
            />
            <Form.Field
              name="memberIds"
              control={form.control}
              render={({ field }) => (
                <Form.Item className="shrink-0">
                  <Form.Label className="sr-only">{t('members')}</Form.Label>
                  <OperationMembersChip
                    value={field.value || []}
                    onValueChange={field.onChange}
                    label={t('members')}
                  />
                </Form.Item>
              )}
            />
            <Form.Field
              name="startDate"
              control={form.control}
              render={({ field }) => (
                <Form.Item className="shrink-0">
                  <Form.Label className="sr-only">{t('start-date')}</Form.Label>
                  <DateSelect.FormItem
                    {...field}
                    type="start"
                    label={t('start-date')}
                  />
                </Form.Item>
              )}
            />
            <Form.Field
              name="targetDate"
              control={form.control}
              render={({ field }) => (
                <Form.Item className="shrink-0">
                  <Form.Label className="sr-only">
                    {t('target-date')}
                  </Form.Label>
                  <DateSelect.FormItem
                    {...field}
                    type="target"
                    label={t('target-date')}
                  />
                </Form.Item>
              )}
            />
            <Form.Field
              name="tagIds"
              control={form.control}
              render={({ field }) => (
                <Form.Item className="shrink-0">
                  <Form.Label className="sr-only">{t('tags')}</Form.Label>
                  <OperationTagsChip
                    type="operation:project"
                    value={field.value || []}
                    onValueChange={field.onChange}
                    label={t('tags')}
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
          <Button
            type="button"
            variant="ghost"
            className="bg-background hover:bg-background/90"
            onClick={() => {
              onClose();
              form.reset();
              editor?.removeBlocks(editor?.document);
              setDescriptionContent(undefined);
            }}
          >
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {t('save')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
