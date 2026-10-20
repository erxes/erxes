import { useQuery } from '@apollo/client';
import { IPageInfo } from '../../types/PageInfo';
import {
  FILES_FOLDERS,
  FILES_LIST,
  FILES_SHARED_WITH_ME,
} from '../graphql/queries';
import { IFile, IFilesFolder, IFilesSharedWithMe, TFilesSpace } from '../types';
import { useFilesFolderPath } from './useFilesFolderPath';
import { useFilesPreviewPolling } from './useFilesPreviewPolling';
import { useFilesSpaces } from './useFilesSpaces';

const PAGE_SIZE = 50;

type TFilesListData = {
  filesList: { list: IFile[]; totalCount: number; pageInfo: IPageInfo };
};

export const useFilesBrowser = ({
  space = 'personal',
  folderId,
  searchValue,
  skip,
}: {
  space?: TFilesSpace;
  folderId?: string | null;
  searchValue?: string;
  skip?: boolean;
}) => {
  const search = searchValue?.trim() || undefined;
  const spaces = useFilesSpaces(skip);
  const rootId =
    space === 'org'
      ? spaces.orgRootId
      : space === 'personal'
      ? spaces.myRootId
      : undefined;
  const currentId = folderId || rootId;
  const isSharedList = space === 'shared' && !folderId && !search;

  const filesQuery = useQuery<TFilesListData>(FILES_LIST, {
    variables: { folderId: currentId, searchValue: search, limit: PAGE_SIZE },
    skip: skip || isSharedList || (!search && !currentId),
    notifyOnNetworkStatusChange: true,
  });

  const foldersQuery = useQuery<{ filesFolders: IFilesFolder[] }>(
    FILES_FOLDERS,
    {
      variables: { parentId: currentId },
      skip: skip || !!search || !currentId,
    },
  );

  const sharedQuery = useQuery<{ filesSharedWithMe: IFilesSharedWithMe }>(
    FILES_SHARED_WITH_ME,
    {
      skip: skip || !isSharedList,
    },
  );

  const path = useFilesFolderPath(isSharedList ? undefined : currentId, skip);

  const pageInfo = filesQuery.data?.filesList.pageInfo;
  const files = isSharedList
    ? sharedQuery.data?.filesSharedWithMe.files || []
    : filesQuery.data?.filesList.list || [];

  useFilesPreviewPolling(files);

  const loadMore = () => {
    if (!pageInfo?.hasNextPage) {
      return;
    }

    filesQuery.fetchMore({
      variables: { cursor: pageInfo.endCursor },
      updateQuery: (prev, { fetchMoreResult }) => ({
        filesList: {
          ...fetchMoreResult.filesList,
          list: [...prev.filesList.list, ...fetchMoreResult.filesList.list],
        },
      }),
    });
  };

  const folders = search
    ? []
    : isSharedList
    ? sharedQuery.data?.filesSharedWithMe.folders || []
    : foldersQuery.data?.filesFolders || [];

  return {
    files,
    totalCount: filesQuery.data?.filesList.totalCount || 0,
    folders,
    path,
    folderId: isSharedList ? undefined : currentId,
    currentFolder: path.find((folder) => folder._id === currentId),
    isSharedList,
    loading:
      spaces.loading ||
      filesQuery.loading ||
      foldersQuery.loading ||
      sharedQuery.loading,
    error:
      spaces.error ||
      filesQuery.error ||
      foldersQuery.error ||
      sharedQuery.error,
    hasMore: !isSharedList && !!pageInfo?.hasNextPage,
    loadMore,
  };
};
