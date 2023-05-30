import apolloClient from 'apolloClient';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import withCurrentUser from 'modules/auth/containers/withCurrentUser';
import { IUser } from 'modules/auth/types';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '../../common/utils';
import AssistantContent from '../components/AssistantContent';
import { ROLE_SETUP_DETAILS } from '../constants';
import { mutations, queries } from '../graphql';
import {
  ForceCompleteMutationResponse,
  GetAvailableFeaturesQueryResponse,
  IFeature
} from '../types';
import { orderArray } from '../utils';

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

    if (route === 'setupList' && getAvailableFeaturesQuery) {
      getAvailableFeaturesQuery.refetch();
    }

    this.props.changeRoute(route);
  };

  forceComplete = () => {
    this.props.forceCompleteMutation().then(() => {
      this.props.toggleContent(false);
    });
  };

  componentDidMount() {
    if (window.location.href.includes('signedIn=true')) {
      setTimeout(() => {
        apolloClient
          .mutate({
            mutation: gql(mutations.checkStatus)
          })
          .then(({ data }) => {
            const onboardStatus = data.onboardingCheckStatus;
            if (onboardStatus === 'completed') {
              return this.props.toggleContent(false);
            }

            if (onboardStatus === 'inComplete' || onboardStatus === 'initial') {
              this.props.toggleContent(true);
              this.props.changeRoute(onboardStatus);
            }

            if (
              onboardStatus === 'initial' &&
              localStorage.getItem('erxes_customization_features')
            ) {
              this.props.changeRoute('setupList');
            }
          });
      }, 3000);
    }
  }

  render() {
    const { getAvailableFeaturesQuery } = this.props;

    const allFeatures: IFeature[] = getAvailableFeaturesQuery
      ? getAvailableFeaturesQuery.onboardingGetAvailableFeatures || []
      : [];

    // get feature categories
    const savedFeatures = localStorage.getItem(
      'erxes_customization_onboarding'
    );
    let sortedFeatures = allFeatures;

    if (savedFeatures && savedFeatures.length > 2) {
      const chosenFeatures = JSON.parse(savedFeatures);

      // order by selected order
      sortedFeatures = orderArray(
        allFeatures.filter(feature => chosenFeatures.includes(feature.name)),
        chosenFeatures
      );
    }

    const features = sortedFeatures.map(feature => {
      const details = ROLE_SETUP_DETAILS[feature.name] || {};

      return {
        ...feature,
        ...details
      };
    });

    return (
      <AssistantContent
        {...this.props}
        savedFeatures={savedFeatures}
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
