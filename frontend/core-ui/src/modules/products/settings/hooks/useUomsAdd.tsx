import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { UOMS_ADD } from '../graphql/mutations/cudUoms';
import { IUom } from 'ui-modules';

export const useUomsAdd = () => {
  const [uomsAdd, { loading }] = useMutation(UOMS_ADD);

  const handleUomsAdd = (options?: MutationFunctionOptions) => {
    uomsAdd(options);
  };

  return { uomsAdd: handleUomsAdd, loading };
};
