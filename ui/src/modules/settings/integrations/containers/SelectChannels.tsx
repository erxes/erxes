import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import Spinner from 'modules/common/components/Spinner';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { mutations, queries } from 'modules/settings/channels/graphql';
import { ChannelsQueryResponse } from 'modules/settings/channels/types';
import React from 'react';
import { ChildProps, graphql } from 'react-apollo';
import SelectChannels from '../components/SelectChannels';

type Props = {
  onChange: (values: string[]) => void;
  defaultValue: string[];
  isRequired?: boolean;
  formProps: IFormProps;
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
