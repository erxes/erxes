import { Button, Separator } from 'erxes-ui';
import { IconChevronLeft, IconLoader2 } from '@tabler/icons-react';
import { useEffect, useRef } from 'react';

import { Combobox } from 'erxes-ui';
import { Form } from 'erxes-ui';
import { Input } from 'erxes-ui';
import { useBoardAdd } from '@/deals/boards/hooks/useBoards';
import { useForm } from 'react-hook-form';
import { useSelectBoardsContext } from '@/deals/context/DealContext';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  title: z.string().min(1),
});

export const CreateBoardForm = () => {
  const { newBoardName, setNewBoardName } = useSelectBoardsContext();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: newBoardName,
    },
  });
  const { addBoard, loading } = useBoardAdd();

  const selectParentRef =
    useRef<React.ElementRef<typeof Combobox.Trigger>>(null);

  useEffect(() => {
    if (selectParentRef.current) {
      selectParentRef.current.focus();
    }
  }, [selectParentRef]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addBoard({
      variables: {
        ...values,
      },
      onCompleted({ addBoard }) {
        setNewBoardName && setNewBoardName('');
        // onSelect({
        //   _id: addBoard._id,
        //   ...values,
        // });
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-3 p-3 pb-10">
          <Form.Field
            control={form.control}
            name="title"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Title</Form.Label>
                <Input {...field} />
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
        <Separator />
        <div className="p-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <IconLoader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Create'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export function SelectBoardsCreateContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setNewBoardName } = useSelectBoardsContext();
  return (
    <div className="overflow-auto">
      <div className="flex items-center font-medium p-1">
        <Button
          variant="ghost"
          onClick={() => {
            setNewBoardName && setNewBoardName('');
          }}
          className="pl-1 gap-1"
        >
          <IconChevronLeft />
          <h6>Create new board</h6>
        </Button>
      </div>
      <Separator />
      {children}
    </div>
  );
}
