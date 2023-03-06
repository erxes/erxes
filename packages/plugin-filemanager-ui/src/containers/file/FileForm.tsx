import * as compose from 'lodash.flowright';

import { FilemanagerFilesQueryResponse, IFile } from '../../types';
import { mutations, queries } from '../../graphql';

import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import FileForm from '../../components/file/FileForm';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

type Props = {
  file?: IFile;
  // currentCategoryId: string;
  queryParams: any;
  // topicIds: string[];
  closeModal: () => void;
};

type FinalProps = {
  // topicsQuery: TopicsQueryResponse;
} & Props;

const FileFormContainer = (props: FinalProps) => {
  const {
    file,
    queryParams
    // topicIds,
    // currentCategoryId,
    // topicsQuery,
  } = props;

  const renderButton = ({
    passedName: name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={mutations.filemanagerFileCreate}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries()}
        type="submit"
        isSubmitted={isSubmitted}
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } an ${name}`}
      />
    );
  };

  const extendedProps = {
    ...props,
    renderButton,
    file
    // currentCategoryId,
    // topics: topicsQuery.knowledgeBaseTopics || [],
  };

  return <FileForm {...extendedProps} />;
};

const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.filemanagerFiles)
    }
  ];
};

export default FileFormContainer;
