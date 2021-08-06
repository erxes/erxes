import * as compose from 'lodash.flowright';
import { withProps, Alert } from 'modules/common/utils';
import React from 'react';
import { IUser } from '../../../auth/types';
import AutomationForm from '../../components/forms/AutomationForm';
import { mutations } from '../../graphql';
import { graphql } from 'react-apollo';
import { AddMutationResponse, IAutomationDoc } from '../../types';
import gql from 'graphql-tag';

type Props = {
  mainType: string;
};

type FinalProps = {
  currentUser: IUser;
} & Props &
  AddMutationResponse;

const AutomationFormContainer = (props: FinalProps) => {
  const { currentUser, addAutomationMutation } = props;

  const save = (doc: IAutomationDoc) => {
    addAutomationMutation({
      variables: {
        ...doc
      }
    })
      .then(data => {
        window.location.href = `/automations/details/${data.data.automationsAdd._id}`;
        Alert.success(`You successfully created a ${doc.name}`);
      })

      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    loading: false,
    currentUser,
    save
  };

  return <AutomationForm {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<{}, AddMutationResponse, IAutomationDoc>(
      gql(mutations.automationsAdd),
      {
        name: 'addAutomationMutation',
        options: () => ({
          refetchQueries: ['automations', 'automationsMain', 'automationDetail']
        })
      }
    )
  )(AutomationFormContainer)
);
