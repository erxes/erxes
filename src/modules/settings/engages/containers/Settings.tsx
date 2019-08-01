import gql from 'graphql-tag';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import Spinner from 'modules/common/components/Spinner';
import { IButtonMutateProps } from 'modules/common/types';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import Settings from '../components/Settings';
import { mutations, queries } from '../graphql';
import {
  EngageConfigQueryResponse,
  EngagesConfigSaveMutationResponse,
  IEngageConfig
} from '../types';

type FinalProps = {
  engagesConfigDetailQuery: EngageConfigQueryResponse;
} & EngagesConfigSaveMutationResponse;

class SettingsContainer extends React.Component<FinalProps> {
  render() {
    const { engagesConfigDetailQuery } = this.props;

    if (engagesConfigDetailQuery.loading) {
      return <Spinner />;
    }

    const renderButton = ({
      values,
      isSubmitted,
      callback
    }: IButtonMutateProps) => {
      return (
        <ButtonMutate
          mutation={mutations.engagesConfigSave}
          variables={values}
          callback={callback}
          refetchQueries={'engagesConfigDetail'}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={`You successfully updated engages config`}
        />
      );
    };

    const updatedProps = {
      renderButton,
      engagesConfigDetail: engagesConfigDetailQuery.engagesConfigDetail || {}
    };

    return <Settings {...updatedProps} />;
  }
}

export default withProps<{}>(
  compose(
    graphql<{}, EngageConfigQueryResponse, {}>(
      gql(queries.engagesConfigDetail),
      {
        name: 'engagesConfigDetailQuery'
      }
    ),
    graphql<IEngageConfig, EngagesConfigSaveMutationResponse, IEngageConfig>(
      gql(mutations.engagesConfigSave),
      {
        name: 'engagesConfigSave'
      }
    )
  )(SettingsContainer)
);
