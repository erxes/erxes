import React from 'react';

import * as compose from 'lodash.flowright';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { Alert, router } from 'modules/common/utils';
import Messenger from 'modules/onBoarding/components/messenger/Messenger';
import {
  AddIntegrationMutationResponse,
  AddIntegrationMutationVariables,
  EditIntegrationMutationResponse,
  EditIntegrationMutationVariables,
} from 'modules/onBoarding/types';
import { mutations } from 'modules/onBoarding/graphql';
import { IIntegration } from '@erxes/ui-inbox/src/settings/integrations/types';

type Props = {
  history: any;
  brandName: string;
  setBrandName: (name: string) => void;
  color: string;
  setColor: (color: string) => void;
  integration: IIntegration;
};

type FinalProps = {} & Props &
  AddIntegrationMutationResponse &
  EditIntegrationMutationResponse;

function MessengerContainer(props: FinalProps) {
  const {
    addIntegrationMutation,
    editIntegrationMutation,
    integration,
    history,
  } = props;

  const integrationSave = (doc: any, _id?: string) => {
    if (!doc.brandName) {
      Alert.error('BrandName can not be empty');
    }

    if (_id) {
      editIntegrationMutation({
        variables: { _id, ...doc },
      })
        .then(() => {
          router.setParams(history, { steps: 3 });
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    }

    if (!_id) {
      addIntegrationMutation({
        variables: {
          languageCode: 'en',
          ...doc,
        },
      })
        .then(() => {
          router.setParams(history, { steps: 3 });
        })

        .catch((error) => {
          Alert.error(error.message);
        });
    }
  };

  const updatedProps = {
    ...props,
    integrationSave,
    integration,
  };

  return <Messenger {...updatedProps} />;
}

export default compose(
  graphql<
    Props,
    AddIntegrationMutationResponse,
    AddIntegrationMutationVariables
  >(gql(mutations.addMessengerOnboarding), {
    name: 'addIntegrationMutation',
    options: { refetchQueries: ['integrations'] },
  }),
  graphql<
    Props,
    EditIntegrationMutationResponse,
    EditIntegrationMutationVariables
  >(gql(mutations.editMessengerOnboarding), {
    name: 'editIntegrationMutation',
  }),
)(MessengerContainer);
