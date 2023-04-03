import {
  FilemanagerFoldersQueryResponse,
  IFolder,
  RemoveFilemanagerFolderMutationResponse
} from '../../types';
import { IButtonMutateProps, IRouterProps } from '@erxes/ui/src/types';
import { mutations, queries } from '../../graphql';

import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import FolderForm from '../../components/folder/FolderForm';
import React from 'react';
import gql from 'graphql-tag';

type Props = {
  folder?: IFolder;
  root?: boolean;
  queryParams: any;
  closeModal: () => void;
};

type FinalProps = {
  filemanagerFoldersQuery: FilemanagerFoldersQueryResponse;
} & Props &
  IRouterProps &
  RemoveFilemanagerFolderMutationResponse;

const FolderFormContainer = (props: FinalProps) => {
  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={mutations.filemanagerFolderSave}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries(values.parentId)}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton
  };

  return <FolderForm {...updatedProps} />;
};

const getRefetchQueries = (parentId?: string) => {
  return [
    {
      query: gql(queries.filemanagerFolders),
      variables: {
        parentId: parentId ? parentId : ''
      }
    }
  ];
};

export default FolderFormContainer;
