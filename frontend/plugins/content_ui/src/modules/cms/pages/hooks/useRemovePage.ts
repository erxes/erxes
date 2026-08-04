import { OperationVariables, useMutation } from '@apollo/client';
import { PAGES_REMOVE } from '../graphql/mutations/pagesMutations';
import { PAGE_LIST } from '../graphql/queries/pagesListQueries';
import { IPage } from '../types/pageTypes';

interface PageListData {
  cmsPageList: {
    pages: IPage[];
    totalCount: number;
  };
}

export const useRemovePage = () => {
  const [_removePage, { loading }] = useMutation(PAGES_REMOVE);

  const removePage = async (pageId: string, options?: OperationVariables) => {
    await _removePage({
      ...options,
      variables: { id: pageId, ...options?.variables },
      update: (cache) => {
        try {
          const existingData = cache.readQuery<PageListData>({
            query: PAGE_LIST,
            variables: options?.variables,
          });

          if (!existingData?.cmsPageList) {
            return;
          }

          const updatedPages = existingData.cmsPageList.pages.filter(
            (page) => page._id !== pageId,
          );

          cache.writeQuery<PageListData>({
            query: PAGE_LIST,
            variables: options?.variables,
            data: {
              cmsPageList: {
                ...existingData.cmsPageList,
                pages: updatedPages,
                totalCount: existingData.cmsPageList.totalCount - 1,
              },
            },
          });
        } catch (error) {
          console.error('Cache update error:', error);
        }
      },
    });
  };

  return { removePage, loading };
};
