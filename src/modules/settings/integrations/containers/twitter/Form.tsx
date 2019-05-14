import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Alert, withProps } from 'modules/common/utils';
import { queries as brandQueries } from 'modules/settings/brands/graphql';
import Twitter from 'modules/settings/integrations/components/twitter/Form';
import { mutations } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import {
  LinkTwitterMutationResponse,
  SaveTwitterMutationResponse
} from '../../types';

type Props = {} & LinkTwitterMutationResponse;

type FinalProps = {} & Props & SaveTwitterMutationResponse;

class TwitterContainer extends React.Component<FinalProps> {
  save = ({ brandId, accountId }: { brandId: string; accountId: string }) => {
    const { saveMutation } = this.props;

    saveMutation({
      variables: {
        brandId,
        accountId
      }
    })
      .then(() => {
        Alert.success('You successfully added a twitter');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  render() {
    const updatedProps = {
      ...this.props,
      save: this.save
    };

    return <Twitter {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<
      Props,
      SaveTwitterMutationResponse,
      { brandId: string; accountId: string }
    >(gql(mutations.integrationsCreateTwitter), {
      name: 'saveMutation'
    })
  )(TwitterContainer)
);
