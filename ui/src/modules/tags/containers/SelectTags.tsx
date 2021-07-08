import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import Spinner from 'modules/common/components/Spinner';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { mutations, queries } from '../graphql';
import React from 'react';
import { ChildProps, graphql } from 'react-apollo';
import SelectTags from '../components/SelectTags';
import { TagsQueryResponse } from '../types';

type Props = {
  onChange: (values: string[]) => void;
  defaultValue: string[];
  isRequired?: boolean;
  formProps: IFormProps;
  description?: string;
  type: string;
};

type FinalProps = {
  tagsQuery: TagsQueryResponse;
} & Props;

const SelectChannelContainer = (props: ChildProps<FinalProps>) => {
  const { tagsQuery } = props;

  const tags = tagsQuery.tags || [];

  if (tagsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback
  }: IButtonMutateProps) => {
    const callBackResponse = () => {
      tagsQuery.refetch();

      if (callback) {
        callback();
      }
    };

    return (
      <ButtonMutate
        mutation={mutations.add}
        variables={values}
        callback={callBackResponse}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully added a ${name}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    tags,
    renderButton
  };

  return <SelectTags {...updatedProps} />;
};

const getRefetchQueries = (type: string) => {
  return [
    {
      query: gql(queries.tags),
      variables: { type }
    }
  ];
};

export default compose(
  graphql<Props, TagsQueryResponse, { type: string }>(gql(queries.tags), {
    name: 'tagsQuery',
    options: ({ type }) => ({
      variables: { type },
      fetchPolicy: 'network-only',
      refetchQueries: getRefetchQueries
    })
  })
)(SelectChannelContainer);
