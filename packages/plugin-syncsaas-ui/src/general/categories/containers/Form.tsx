import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { router, withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import queries from '../../graphql/queries';
import { IButtonMutateProps, QueryResponse } from '@erxes/ui/src/types';
import { Alert, ButtonMutate, Spinner, confirm } from '@erxes/ui/src/';
import FormComponent from '../components/Form';
import mutations from '../graphql/mutations';
import { refetchQueries } from './List';

type Props = {
  queryParams: any;
  history: any;
  closeModal: () => void;
  category?: any;
};

type FinalProps = {
  removeCategoryMutations: any;
} & Props;

class Categories extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { closeModal, category, removeCategoryMutations } = this.props;

    const renderButton = ({
      text,
      values,
      isSubmitted,
      callback,
      confirmationUpdate,
      object
    }: IButtonMutateProps) => {
      let mutation = mutations.addCategory;
      let sucessAction = 'added';

      if (object) {
        mutation = mutations.editCategory;
        sucessAction = 'updated';
      }

      const afterMutate = () => {
        callback && callback();
        closeModal();
      };

      return (
        <ButtonMutate
          mutation={mutation}
          variables={values}
          callback={afterMutate}
          refetchQueries={refetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          confirmationUpdate={confirmationUpdate}
          successMessage={`You successfully ${sucessAction} a ${text}`}
        />
      );
    };

    const remove = id => {
      confirm().then(() => {
        removeCategoryMutations({ variables: { id } })
          .then(() => {
            Alert.success('Removed category successfully');
          })
          .catch(err => {
            Alert.error(err.message);
          });
      });
    };

    const updatedProps = {
      ...this.props,
      renderButton,
      category,
      remove
    };

    return <FormComponent {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(mutations.removeCategory), {
      name: 'removeCategoryMutations',
      options: () => ({
        refetchQueries: refetchQueries()
      })
    })
  )(Categories)
);
