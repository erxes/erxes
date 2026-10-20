import { useQuery } from '@apollo/client';
import { FILES_FOLDER_PATH } from '../graphql/queries';
import { IFilesFolder } from '../types';

/** Root-first chain of folders down to `folderId`, for breadcrumbs. */
export const useFilesFolderPath = (
  folderId?: string | null,
  skip?: boolean,
) => {
  const { data } = useQuery<{ filesFolderPath: IFilesFolder[] }>(
    FILES_FOLDER_PATH,
    {
      variables: { _id: folderId },
      skip: skip || !folderId,
    },
  );

  return folderId ? data?.filesFolderPath || [] : [];
};
