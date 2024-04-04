import * as compose from 'lodash.flowright';

import { IFile, SaveFileMutationResponse } from '../../types';
import { mutations, queries } from '../../graphql';

import { Alert } from '@erxes/ui/src/utils';
import FileForm from '../../components/file/FileForm';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';

type Props = {
  file?: IFile;
  queryParams: any;
  closeModal: () => void;
};

type FinalProps = {
  documentsListQuery: any;
} & Props &
  SaveFileMutationResponse;

const FileFormContainer = (props: FinalProps) => {
  const { file, documentsListQuery, saveFileMutation } = props;

  const saveFile = variables => {
    saveFileMutation({
      variables
    })
      .then(() => {
        Alert.success('You successfully add a file');

        props.closeModal();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const documents = documentsListQuery.documents || [];

  const extendedProps = {
    ...props,
    saveFile,
    file,
    documents
  };

  return <FileForm {...extendedProps} />;
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
)(FileFormContainer);
