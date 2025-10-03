import {
  Button,
  Dialog,
  Form,
  Spinner,
  useQueryState,
  useToast,
} from 'erxes-ui';
import { TTagsForm, useTagsForm } from '../hooks/useTagsForm';
import { TagsForm } from './TagsForm';
import { useTagsEdit } from '../hooks/useTagsEdit';
import { useSearchParams } from 'react-router-dom';
import { useTagDetail } from '../hooks/useTagDetail';
import { useEffect } from 'react';

export const TagsEditDialog = () => {
  const [tagId] = useQueryState('tagId');
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const {
    methods,
    methods: { reset, handleSubmit },
  } = useTagsForm();
  const { tagsEdit, loading } = useTagsEdit();
  const { tagDetail } = useTagDetail({
    variables: {
      id: tagId,
    },
  });

  const setOpen = (newTagId: string | null) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (newTagId) {
      newSearchParams.set('tagId', newTagId);
    } else {
      newSearchParams.delete('tagId');
    }
    setSearchParams(newSearchParams);
  };

  const submitHandler = (data: TTagsForm) => {
    tagsEdit({
      variables: { id: tagId, ...data },
      onCompleted: () => {
        toast({ title: 'Tag updated successfully.' });
        reset();
        setOpen(null);
      },
      onError: (error) =>
        toast({
          title: 'Failed to update tag',
          description: error.message,
          variant: 'destructive',
        }),
    });
  };

  useEffect(() => {
    if (tagDetail?._id) {
      reset({
        name: tagDetail?.name,
        type: tagDetail?.type,
        colorCode: tagDetail?.colorCode || undefined,
        parentId: tagDetail?.parentId,
      });
    }
  }, [tagDetail]);

  return (
    <Dialog
      open={!!tagId}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          reset();
          setOpen(null);
        }
      }}
    >
      <Dialog.Content>
        <Dialog.HeaderCombined
          title="Edit Tag"
          description="Add a new tag to the system."
        />
        <Form {...methods}>
          <form
            onSubmit={handleSubmit(submitHandler)}
            className="flex flex-col size-full gap-5"
          >
            <TagsForm />
            <div className="w-full flex items-center justify-end gap-3">
              <Button
                variant={'secondary'}
                onClick={() => {
                  reset();
                  setOpen(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner /> : 'Update'}
              </Button>
            </div>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
};
