import * as compose from 'lodash.flowright';

import { IFile, SaveFileMutationResponse } from '../../types';
import { mutations, queries } from '../../graphql';

import { Alert } from '@erxes/ui/src/utils';
import FileForm from '../../components/file/FileForm';
import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

type Props = {
  file?: IFile;
  queryParams: any;
  closeModal: () => void;
};

type FinalProps = {} & Props & SaveFileMutationResponse;

const FileFormContainer = (props: FinalProps) => {
  const { file, saveFileMutation } = props;

  const saveSimpleFile = variables => {
    saveFileMutation({
      variables
    })
      .then(() => {
        Alert.success('You successfully add an file');

        props.closeModal();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const extendedProps = {
    ...props,
    saveSimpleFile,
    file
    // currentCategoryId,
    // topics: topicsQuery.knowledgeBaseTopics || [],
  };

  return <FileForm {...extendedProps} />;
};

export default compose(
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
