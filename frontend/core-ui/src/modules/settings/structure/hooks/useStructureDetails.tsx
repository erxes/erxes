import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@apollo/client';
import {
  ADD_STRUCTURE,
  EDIT_STRUCTURE,
  GET_STRUCTURE_DETAILS,
} from '../graphql';
import { useToast } from 'erxes-ui';
import { IStructureDetails, StructureDetailsFormT } from '../types/structure';

export const useStructureDetails = () => {
  const { data, loading, error } = useQuery<{
    structureDetail: IStructureDetails | null;
  }>(GET_STRUCTURE_DETAILS);

  return { structureDetail: data?.structureDetail, loading, error };
};

export const useEditStructureDetail = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { toast } = useToast();
  const [handleEdit, { loading, error }] = useMutation<
    { structuresEdit: { _id: string } },
    StructureDetailsFormT & { id: string }
  >(EDIT_STRUCTURE, {
    refetchQueries: [{ query: GET_STRUCTURE_DETAILS }],
    awaitRefetchQueries: true,
    onCompleted: () => toast({ title: t('updated'), variant: 'success' }),
    onError: (error) =>
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      }),
  });

  return { handleEdit, loading, error };
};

export const useAddStructureDetail = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { toast } = useToast();
  const [handleAdd, { loading, error }] = useMutation<
    { structuresAdd: { _id: string } },
    StructureDetailsFormT
  >(ADD_STRUCTURE, {
    refetchQueries: [{ query: GET_STRUCTURE_DETAILS }],
    awaitRefetchQueries: true,
    onCompleted: () =>
      toast({
        title: t('created-successfully'),
        variant: 'success',
      }),
    onError: (error) =>
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      }),
  });

  return { handleAdd, loading, error };
};
