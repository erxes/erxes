import { useQuery } from '@apollo/client';
import { FILES_SPACES } from '../graphql/queries';

type TFilesSpacesData = {
  filesSpaces: { myRootId: string; orgRootId: string };
};

export const useFilesSpaces = (skip?: boolean) => {
  const { data, loading, error } = useQuery<TFilesSpacesData>(FILES_SPACES, {
    skip,
  });

  return {
    myRootId: data?.filesSpaces.myRootId,
    orgRootId: data?.filesSpaces.orgRootId,
    loading,
    error,
  };
};
