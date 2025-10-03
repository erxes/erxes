import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { UOMS_ADD } from '../graphql/mutations/cudUoms';
import { IUom } from 'ui-modules';

export const useUomsAdd = () => {
  const [uomsAdd, { loading }] = useMutation<{ _id: string }, IUom>(UOMS_ADD);

  const handleUomsAdd = (
    options: MutationFunctionOptions<{ _id: string }, IUom>,
  ) => {
    uomsAdd(options);
  };

  return { uomsAdd: handleUomsAdd, loading };
};
