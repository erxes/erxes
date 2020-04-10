import apolloClient from 'apolloClient';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import withCurrentUser from 'modules/auth/containers/withCurrentUser';
import { IUser } from 'modules/auth/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../common/utils';
import AssistantContent from '../components/AssistantContent';
import { FEATURE_DETAILS } from '../constants';
import { mutations, queries, subscriptions } from '../graphql';
import {
  ForceCompleteMutationResponse,
  GetAvailableFeaturesQueryResponse,
  IFeature
} from '../types';

type Props = {
  changeRoute: (route: string) => void;
  currentUser: IUser;
  currentRoute?: string;
  showContent: boolean;
  toggleContent: (isShow: boolean) => void;
};

type FinalProps = Props &
  ForceCompleteMutationResponse & {
    getAvailableFeaturesQuery?: GetAvailableFeaturesQueryResponse;
  };

class AssistantContentContainer extends React.Component<FinalProps> {
  changeStep = (route: string) => {
    const { getAvailableFeaturesQuery } = this.props;

    if (route === 'todoList' && getAvailableFeaturesQuery) {
      getAvailableFeaturesQuery.refetch();
    }

    this.props.changeRoute(route);
  };

  forceComplete = () => {
    this.props.forceCompleteMutation().then(() => {
      this.props.changeRoute('');
    });
  };

  componentDidMount() {
    if (window.location.href.includes('signedIn=true')) {
      setTimeout(() => {
        apolloClient.mutate({
          mutation: gql(mutations.checkStatus)
        });
      }, 400);
    }
  }

  componentWillMount() {
    const { getAvailableFeaturesQuery, currentUser } = this.props;

    if (!getAvailableFeaturesQuery) {
      return;
    }

    getAvailableFeaturesQuery.subscribeToMore({
      document: gql(subscriptions.onboardingChanged),
      variables: { userId: currentUser._id },
      updateQuery: (prev, { subscriptionData: { data } }) => {
        const { onboardingChanged } = data;

        if (onboardingChanged) {
          const { type } = onboardingChanged;

          console.log(type);
          if (['initial', 'inComplete'].includes(type)) {
            this.props.changeRoute(type);
            this.props.toggleContent(true);
          }
        }
      }
    });
  }

  render() {
    const { getAvailableFeaturesQuery } = this.props;

    const allFeatures: IFeature[] = getAvailableFeaturesQuery
      ? getAvailableFeaturesQuery.onboardingGetAvailableFeatures || []
      : [];

    // get feature categories
    const savedCategories = localStorage.getItem('erxesCustomizationTeams');
    let categorizedFeatures = allFeatures;

    if (savedCategories) {
      const chosenTeams = JSON.parse(savedCategories);

      categorizedFeatures = allFeatures.filter(feature =>
        chosenTeams.includes(feature.name)
      );
    }

    const features = categorizedFeatures.map(feature => {
      const details = FEATURE_DETAILS[feature.name] || {};

      return {
        ...feature,
        ...details
      };
    });

    return (
      <AssistantContent
        {...this.props}
        changeRoute={this.changeStep}
        forceComplete={this.forceComplete}
        availableFeatures={features}
      />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<{}>(gql(queries.getAvailableFeatures), {
      name: 'getAvailableFeaturesQuery'
    }),
    graphql<{}>(gql(mutations.forceComplete), {
      name: 'forceCompleteMutation'
    })
  )(withCurrentUser(AssistantContentContainer))
);
