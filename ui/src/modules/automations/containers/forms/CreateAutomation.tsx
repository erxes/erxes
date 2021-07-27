import * as compose from 'lodash.flowright';
import { withProps, Alert } from 'modules/common/utils';
import React from 'react';
import { IUser } from '../../../auth/types';
import AutomationForm from '../../components/forms/AutomationForm';
import { mutations } from '../../graphql';
import { graphql } from 'react-apollo';
import { AddMutationResponse, IAutomationDoc } from '../../types';
import gql from 'graphql-tag';

type Props = {};

type FinalProps = {
  currentUser: IUser;
} & Props &
  AddMutationResponse;

const AutomationFormContainer = (props: FinalProps) => {
  const { currentUser, addAutomationMutation } = props;

  const save = (doc: IAutomationDoc) => {
    console.log(doc);
    addAutomationMutation({
      variables: {
        ...doc
      }
    })
      .then(() => {
        Alert.success(`You successfully created a ${doc.name}`);
      })

      .catch(error => {
        Alert.error(error.message);
      });
  };

  // const renderButton = ({
  //   name,
  //   values,
  //   isSubmitted,
  //   callback
  // }: IButtonMutateProps) => {
  //   const afterAdd = data => {
  //     if (!data.automationsAdd || !data.automationsAdd._id) {
  //       return;
  //     }

  //     window.location.href = `/automations/details/${data.automationsAdd._id}`;
  //   };

  //   return (
  //     <ButtonMutate
  //       mutation={mutations.automationsAdd}
  //       variables={values}
  //       callback={afterAdd}
  //       refetchQueries={['automations', 'automationsMain', 'automationDetail']}
  //       isSubmitted={isSubmitted}
  //       btnSize="small"
  //       type="submit"
  //       successMessage={`You successfully created a ${name}`}
  //     />
  //   );
  // };

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
        name: 'addAutomationMutation'
      }
    )
  )(AutomationFormContainer)
);
