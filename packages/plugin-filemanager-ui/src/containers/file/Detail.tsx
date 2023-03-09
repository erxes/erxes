import * as compose from 'lodash.flowright';

import { IFile, SaveFileMutationResponse } from '../../types';
import { mutations, queries } from '../../graphql';

import { Alert } from '@erxes/ui/src/utils';
import FileDetail from '../../components/file/Detail';
import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

type Props = {
  file?: IFile;
  queryParams: any;
  closeModal: () => void;
};

type FinalProps = {
  documentsListQuery: any;
} & Props &
  SaveFileMutationResponse;

const FileDetailContainer = (props: FinalProps) => {
  return <FileDetail />;
};

export default compose(
  graphql<Props>(gql(queries.documents), {
    name: 'documentsListQuery'
  }),
  graphql<Props, SaveFileMutationResponse, {}>(
    gql(mutations.filemanagerFileCreate),
    {
      name: 'saveFileMutation',
      options: ({ queryParams }: { queryParams: any }) => {
        return {
          refetchQueries: [
            {
              query: gql(queries.filemanagerFiles),
              variables: {
                folderId: queryParams && queryParams._id ? queryParams._id : ''
              }
            }
          ]
        };
      }
    }
  )
)(FileDetailContainer);
