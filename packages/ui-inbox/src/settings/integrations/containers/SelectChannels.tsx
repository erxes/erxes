import * as compose from 'lodash.flowright';

import { graphql, ChildProps } from '@apollo/client/react/hoc';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { mutations, queries } from '../../channels/graphql';

import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { ChannelsQueryResponse } from '../../channels/types';
import React from 'react';
import SelectChannels from '../components/SelectChannels';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';

type Props = {
  onChange: (values: string[]) => void;
  defaultValue: string[];
  isRequired?: boolean;
  formProps: IFormProps;
  description?: string;
};

type FinalProps = {
  channelsQuery: ChannelsQueryResponse;
} & Props;

const SelectChannelContainer = (props: ChildProps<FinalProps>) => {
  const { channelsQuery } = props;

  const channels = channelsQuery.channels || [];

  if (channelsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback
  }: IButtonMutateProps) => {
    const callBackResponse = () => {
      channelsQuery.refetch();

      if (callback) {
        callback();
      }
    };

    return (
      <ButtonMutate
        mutation={mutations.channelAdd}
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
    channels,
    renderButton
  };

  return <SelectChannels {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.channels),
      variables: {}
    }
  ];
};

export default compose(
  graphql<ChannelsQueryResponse>(gql(queries.channels), {
    name: 'channelsQuery',
    options: () => ({
      refetchQueries: getRefetchQueries
    })
  })
)(SelectChannelContainer);
