import { ApolloError, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useSegment } from 'ui-modules/modules/segments/context/SegmentProvider';
import {
  SEGMENT_ADD,
  SEGMENT_EDIT,
} from 'ui-modules/modules/segments/graphql/mutations';
import { TSegmentForm } from 'ui-modules/modules/segments/types';

export const useSegmentActions = ({
  callback,
}: {
  callback?: (id: string) => void;
}) => {
  const { form, contentType, segment } = useSegment();

  const [segmentAdd] = useMutation(SEGMENT_ADD);
  const [segmentsEdit] = useMutation(SEGMENT_EDIT);

  const onAddSegmentGroup = () => {
    if (!contentType) {
      return toast({
        title: 'Content type is not selected',
        color: 'bg-red-500/50 text-red-500',
      });
    }

    const conditions = form.getValues('conditions');
    const subSegments = form.getValues('conditionSegments');
    const hasSubSegments = (subSegments || [])?.length > 0;

    if (!hasSubSegments) {
      form.setValue('conditionSegments', [
        {
          contentType: contentType,
          conditionsConjunction: 'and',
          conditions,
        },
        {
          contentType: contentType,
          conditionsConjunction: 'and',
          conditions: [
            {
              propertyType: contentType,
              propertyName: '',
              propertyOperator: '',
            },
          ],
        },
      ]);
      form.setValue('conditions', []);
      return;
    }
    form.setValue('conditionSegments', [
      ...(subSegments || []),
      {
        contentType: contentType,
        conditionsConjunction: 'and',
        conditions: [
          {
            propertyType: contentType,
            propertyName: '',
            propertyOperator: '',
          },
        ],
      },
    ]);
  };

  const handleSave = (data: TSegmentForm) => {
    const mutation = segment ? segmentsEdit : segmentAdd;

    let variables: any = {
      contentType: contentType,
      shouldWriteActivityLog: false,
      _id: segment ? segment?._id : undefined,
      name: data.name,
      subOf: data.subOf,
      description: data.description,
      config: data.config || {},
      conditionsConjunction: data.conditionsConjunction,
    };

    if (data?.conditionSegments?.length) {
      variables.conditionSegments = data?.conditionSegments;
    } else {
      variables.conditions = data?.conditions;
    }
    mutation({
      variables,
      onError: (e: ApolloError) => {
        toast({
          title: 'Error',
          variant: 'destructive',
          description: e.message,
        });
      },
      onCompleted: (data) => {
        const { segmentsAdd, segmentsEdit } = data || {};
        const { _id } = segmentsAdd || segmentsEdit || {};
        form.reset();

        toast({
          title: `${segment ? 'Edited' : 'Created'} successfully`,
        });
        if (callback) {
          console.log({ _id });
          callback(_id);
        }
      },
    });
  };

  return {
    handleSave,
    onAddSegmentGroup,
  };
};
