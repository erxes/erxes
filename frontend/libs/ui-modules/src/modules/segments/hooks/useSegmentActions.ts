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
  const { form, contentType, segment } = useSegment();
  const [segmentId, setSegmentId] = useQueryState<string>('segmentId');

  const [segmentsAdd, { loading: adding }] = useMutation(SEGMENT_ADD);
  const [segmentsEdit, { loading: editing }] = useMutation(SEGMENT_EDIT);

  const handleSave = (data: TSegmentForm) => {
    const mutation = segment ? segmentsEdit : segmentsAdd;

    mutation({
      // The form already holds the shape the API stores, so the tree goes over
      // as it is - there is nothing to translate on the way out.
      variables: {
        _id: segment?._id,
        contentType,
        name: data.name,
        description: data.description,
        color: data.color,
        root: data.root,
      },
      // The list and the detail both show the definition, so both are refetched
      // rather than leaving a stale card behind.
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
