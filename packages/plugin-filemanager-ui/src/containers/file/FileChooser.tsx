import * as compose from 'lodash.flowright';

import {
  FilemanagerFilesQueryResponse,
  IFolder,
  IRelatedFiles,
  RelateFileContentTypeMutationResponse
} from '../../types';
import React, { useState } from 'react';
import { mutations, queries } from '../../graphql';

import { Alert } from '@erxes/ui/src/utils';
import Chooser from '@erxes/ui/src/components/Chooser';
import FileForm from './FileForm';
import FolderChooser from '../../components/file/FolderChooser';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';

type Props = {
  closeModal: () => void;
  folderId: string;
  folders: IFolder[];
  currentId: string;
  contentType: string;
  contentTypeId: string;
  chosenFiles: IRelatedFiles[];
  onChangeFolder: (folderId: string) => void;
};

type FinalProps = {
  filemanagerFilesQuery: FilemanagerFilesQueryResponse;
} & Props &
  RelateFileContentTypeMutationResponse;

const FileChooserContainer = (props: FinalProps) => {
  const [perPage, setPerPage] = useState(20);

  const {
    filemanagerFilesQuery,
    relateFileContentTypeMutation,
    closeModal,
    folderId,
    contentType,
    contentTypeId,
    chosenFiles
  } = props;

  if (!filemanagerFilesQuery || filemanagerFilesQuery.loading) {
    return null;
  }

  const files = filemanagerFilesQuery.filemanagerFiles || [];

  const relateFile = variables => {
    relateFileContentTypeMutation({
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

    // setTimeout(() => {
    //   filemanagerFilesQuery!.refetch({
    //     perPage,
    //     search: value,
    //   });
    // }, 500);
  };

  const onSelect = datas => {
    const fileIds = datas.map(data => data._id);

    relateFile({ contentType, contentTypeId, fileIds });
  };

  const renderFolderChooser = () => {
    const { folders, onChangeFolder, currentId } = props;

    return (
      <FolderChooser
        folders={folders}
        onChangeFolder={onChangeFolder}
        currentId={currentId}
      />
    );
  };

  return (
    <Chooser
      title="Files"
      datas={files}
      data={{
        name: (chosenFiles[0] || {}).contentType || '',
        datas: (chosenFiles[0] || {}).files || []
      }}
      search={search}
      clearState={() => search('', true)}
      onSelect={onSelect}
      closeModal={() => closeModal()}
      renderName={file => file.name}
      renderFilter={renderFolderChooser}
      renderForm={formProps => (
        <FileForm {...formProps} queryParams={{ _id: folderId }} />
      )}
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
  graphql<Props, RelateFileContentTypeMutationResponse, {}>(
    gql(mutations.filemanagerRelateFilesContentType),
    {
      name: 'relateFileContentTypeMutation',
      options: ({ contentType, contentTypeId }: Props) => {
        return {
          refetchQueries: [
            {
              query: gql(queries.filemanagerGetRelatedFilesContentType),
              variables: {
                contentType,
                contentTypeId
              }
            }
          ]
        };
      }
    }
  )
)(FileChooserContainer);
