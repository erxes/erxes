import { ApolloError, useMutation } from '@apollo/client';
import { toast, useQueryState } from 'erxes-ui';
import { useSegment } from '../context/SegmentProvider';
import { SEGMENT_ADD, SEGMENT_EDIT } from '../graphql/mutations';
import { SEGMENT_DETAIL, SEGMENTS } from '../graphql/queries';
import { TSegmentForm } from '../types';

export const useSegmentActions = ({
  callback,
  onCreateSuccess,
}: {
  callback?: (id: string) => void;
  onCreateSuccess?: (id: string) => void;
} = {}) => {
  const { form, contentType, ownedBy, segment } = useSegment();
  const [segmentId, setSegmentId] = useQueryState<string>('segmentId');

  const [segmentsAdd, { loading: adding }] = useMutation(SEGMENT_ADD);
  const [segmentsEdit, { loading: editing }] = useMutation(SEGMENT_EDIT);

  const handleSave = (data: TSegmentForm) => {
    const mutation = segment ? segmentsEdit : segmentsAdd;

    mutation({
      variables: {
        _id: segment?._id,
        contentType,
        ...(!segment && ownedBy && !data.name?.trim() ? { ownedBy } : {}),
        name: data.name,
        description: data.description,
        color: data.color,
        visibility: data.visibility,
        root: data.root,
      },
      refetchQueries: [SEGMENTS, ...(segment ? [SEGMENT_DETAIL] : [])],
      onError: (error: ApolloError) =>
        toast({
          title: 'Could not save the segment',
          description: error.message,
          variant: 'destructive',
        }),
      onCompleted: (result) => {
        const saved = result?.segmentsAdd || result?.segmentsEdit;

        toast({ title: segment ? 'Segment updated' : 'Segment created' });

        form.reset(form.getValues());
        callback?.(saved._id);

        if (!segmentId) {
          if (onCreateSuccess) {
            onCreateSuccess(saved._id);
          } else {
            setSegmentId(saved._id);
          }
        }
      },
    });
  };

  return { handleSave, saving: adding || editing };
};
