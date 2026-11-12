import type { ContentType } from '@erxes/core-contract';
import { IconPlus, IconTags } from '@tabler/icons-react';
import {
  Button,
  Form,
  Input,
  PageContainer,
  PageHeader,
  PageSubHeader,
  RecordTable,
} from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { FormSheet } from '~/components/FormSheet';
import { messageOf } from '~/lib/api';
import { useCan } from '~/modules/auth/session';
import { CONTACT_SETTINGS } from '~/modules/contacts/settings/paths';
import { TAG_COLORS, useTagCreate, useTags } from '~/modules/tags/useTags';
import { ContentTypeSwitch, useContentTypeParam } from '../ContentTypeSwitch';
import { ColorSwatches, tagColumns } from './tagColumns';

const AddTag = ({ type, count }: { type: ContentType; count: number }) => {
  const [open, setOpen] = useState(false);
  const create = useTagCreate();

  const form = useForm<{ name: string; colorCode: string }>({
    defaultValues: { name: '', colorCode: TAG_COLORS[0] },
  });

  const submit = form.handleSubmit(({ name, colorCode }) => {
    if (!name.trim()) {
      form.setError('name', { message: 'Enter a name' });

      return;
    }

    create.mutate({ type, name: name.trim(), colorCode }, { onSuccess: () => setOpen(false) });
  });

  return (
    <>
      <Button
        onClick={() => {
          form.reset({ name: '', colorCode: TAG_COLORS[count % TAG_COLORS.length] });
          setOpen(true);
        }}
      >
        <IconPlus />
        Add tag
      </Button>
      <FormSheet
        open={open}
        onOpenChange={setOpen}
        title={`Add ${type} tag`}
        submitLabel="Create"
        submitting={create.isPending}
        onSubmit={() => void submit()}
      >
        <Form {...form}>
          <Form.Field
            name="name"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Name</Form.Label>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            name="colorCode"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Color</Form.Label>
                <ColorSwatches value={field.value} onChange={field.onChange} />
              </Form.Item>
            )}
          />
        </Form>
      </FormSheet>
    </>
  );
};

/** Settings › Tags: the tags for customers and for companies. */
export const TagsSettingsPage = () => {
  const [type] = useContentTypeParam();
  const { tags, loading, error } = useTags(type);
  const manager = useCan()('tags.delete');

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb items={[{ label: 'Tags', to: CONTACT_SETTINGS.tags, icon: IconTags }]} />
        </PageHeader.Start>
        <PageHeader.End>
          <AddTag type={type} count={tags.length} />
        </PageHeader.End>
      </PageHeader>
      <PageSubHeader className="items-center">
        <ContentTypeSwitch />
        <span className="text-sm font-medium text-muted-foreground">{tags.length} tags</span>
      </PageSubHeader>
      <RecordTable.Provider
        key={`${type}-${manager}`}
        columns={tagColumns(manager)}
        data={tags}
        className="m-3"
        tableId={`core_tags_${type}`}
      >
        <RecordTable.CursorProvider
          dataLength={tags.length}
          hasNextPage={false}
          hasPreviousPage={false}
        >
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              {loading ? <RecordTable.RowSkeleton rows={8} /> : <RecordTable.RowList />}
            </RecordTable.Body>
          </RecordTable>
          {error ? (
            <p className="py-10 text-center text-sm text-destructive">{messageOf(error)}</p>
          ) : (
            !loading &&
            !tags.length && (
              <p className="py-10 text-center text-sm text-muted-foreground">No {type} tags yet.</p>
            )
          )}
        </RecordTable.CursorProvider>
      </RecordTable.Provider>
    </PageContainer>
  );
};
