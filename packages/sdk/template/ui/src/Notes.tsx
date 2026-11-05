import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Empty, Form, Input, Spinner, toast } from 'erxes-ui';
import { permissionAction, useMutation, useQuery } from 'erxes-sdk/react';
import { useForm } from 'react-hook-form';
import { Can } from 'ui-modules';
import type * as z from 'zod';
import type { extension } from '../../server';
import { NoteInput } from '../../server/db/definitions/notes';
import { NOTE_ADD, NOTE_LIST } from './graphql';

const can = permissionAction<typeof extension>;

const AddNote = () => {
  const [add, { loading }] = useMutation(NOTE_ADD, {
    refetchQueries: ['extTemplateNoteList'],
  });
  const form = useForm<z.input<typeof NoteInput>>({
    resolver: zodResolver(NoteInput),
    defaultValues: { text: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await add({ variables: values });
      form.reset();
      toast({ title: 'Note added', variant: 'success' });
    } catch (e) {
      toast({
        title: 'Could not add the note',
        description: e instanceof Error ? e.message : undefined,
        variant: 'destructive',
      });
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex items-start gap-2">
        <Form.Field
          control={form.control}
          name="text"
          render={({ field }) => (
            <Form.Item className="grow">
              <Form.Control>
                <Input placeholder="Write a note" {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Button type="submit" disabled={loading}>
          Add
        </Button>
      </form>
    </Form>
  );
};

export const Notes = () => {
  const { data, loading, error, refetch } = useQuery(NOTE_LIST);
  const notes = data?.extTemplateNotes;

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-5">
      <h1 className="text-lg font-semibold">Notes</h1>
      <Can action={can('notes.add')}>
        <AddNote />
      </Can>
      {loading && !notes && <Spinner />}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          {error.message}
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}
      {notes?.length === 0 && (
        <Empty>
          <Empty.Header>
            <Empty.Title>No notes yet</Empty.Title>
          </Empty.Header>
        </Empty>
      )}
      <ul className="flex flex-col gap-2">
        {notes?.map((note) => (
          <li key={note._id} className="rounded border p-3 text-sm">
            {note.text}
          </li>
        ))}
      </ul>
    </div>
  );
};
