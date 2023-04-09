import * as compose from 'lodash.flowright';

import {
  FilemanagerFilesQueryResponse,
  RelateFileMutationResponse
} from '../../types';
import React, { useState } from 'react';
import { mutations, queries } from '../../graphql';

import { Alert } from '@erxes/ui/src/utils';
import Chooser from '@erxes/ui/src/components/Chooser';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

type Props = {
  item: any;
  closeModal: () => void;
  folderId: string;
};

type FinalProps = {
  filemanagerFilesQuery: FilemanagerFilesQueryResponse;
} & Props &
  RelateFileMutationResponse;

const RelatedFormContainer = (props: FinalProps) => {
  const [perPage, setPerPage] = useState(20);

  const { filemanagerFilesQuery, relateFileMutation, item, closeModal } = props;

  if (!filemanagerFilesQuery || filemanagerFilesQuery.loading) {
    return null;
  }

  const files = filemanagerFilesQuery.filemanagerFiles || [];
  const relatedFiles = files.filter(file => file._id !== item._id);

  const relateFile = variables => {
    relateFileMutation({
      variables
    })
      .then(() => {
        Alert.success('You successfully related a file');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const search = (value: string, reload?: boolean) => {
    if (!reload) {
      setPerPage(0);
    }

    setPerPage(perPage + 5);

    setTimeout(() => {
      filemanagerFilesQuery!.refetch({
        perPage,
        search: value
      });
    }, 500);
  };

  const onSelect = datas => {
    const targetIds = datas.map(data => data._id);
    relateFile({ sourceId: item._id, targetIds });
  };

  return (
    <Chooser
      title="Related files"
      datas={relatedFiles}
      data={{
        name: item.name,
        datas: item.relatedFiles ? item.relatedFiles : []
      }}
      search={search}
      clearState={() => search('', true)}
      onSelect={onSelect}
      closeModal={() => closeModal()}
      renderName={file => file.name}
      perPage={5}
      limit={100}
    />
  );
};

export default compose(
  graphql<Props, FilemanagerFilesQueryResponse, {}>(
    gql(queries.filemanagerFiles),
    {
      name: 'filemanagerFilesQuery',
      options: ({ folderId }: { folderId: string }) => ({
        variables: {
          folderId: folderId || ''
        }
      })
    }
  ),
  graphql<Props, RelateFileMutationResponse, {}>(
    gql(mutations.filemanagerRelateFiles),
    {
      name: 'relateFileMutation',
      options: ({ folderId }: { folderId: string }) => {
        return {
          refetchQueries: [
            {
              query: gql(queries.filemanagerFiles),
              variables: {
                folderId: folderId || ''
              }
            }
          ]
        };
      }
    }
  )
)(RelatedFormContainer);
