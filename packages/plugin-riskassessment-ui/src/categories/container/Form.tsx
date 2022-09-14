import { Alert } from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { commonRefetchType, RiskAssessmentsCategoriesQueryResponse } from '../../common/types';
import Form from '../components/Form';
import { mutations, queries } from '../graphql';

type Props = {
  trigger?: JSX.Element;
  categoryId?: string;
  formId?: string;
  refetch?: (prop?: commonRefetchType) => void;
  closeModal: () => void;
};

type FinalProps = {
  categories: RiskAssessmentsCategoriesQueryResponse;
  categoryDetail: any;
  addCategory: any;
  editCategory: any;
} & Props &
  IRouterProps;

type State = {
  loading: boolean;
};

class FormContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.addCategory = this.addCategory.bind(this);
    this.updateCategory = this.updateCategory.bind(this);
  }

  addCategory(variables) {
    this.props
      .addCategory({ variables })
      .then(() => {
        Alert.success('Category added successfully');
        this.props.refetch && this.props.refetch();
        this.props.closeModal();
      })
      .catch(e => Alert.error(e.message));
  }

  updateCategory(variables) {
    this.props
      .editCategory({ variables })
      .then(() => {
        Alert.success('Category edited successfully');
        setTimeout(() => {
          this.props.refetch && this.props.refetch();
          this.props.closeModal();
        }, 300);
      })
      .catch(e => Alert.error(e.message));
  }

  render() {
    const { categories, categoryDetail } = this.props;

    const updatedProps = {
      ...this.props,
      categories: categories.riskAssesmentCategories,
      detail: categoryDetail?.riskAssesmentCategory,
      loading: categoryDetail?.loading,
      addCategory: this.addCategory,
      updateCategory: this.updateCategory
    };

    return <Form {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.listAssessmentCategories), {
      name: 'categories'
    }),
    graphql<Props>(gql(queries.riskAssessmentDetail), {
      name: 'categoryDetail',
      options: ({ categoryId }) => ({
        variables: { id: categoryId }
      }),
      skip: ({ categoryId }) => !categoryId
    }),
    graphql<Props>(gql(mutations.addAssessmentCategory), {
      name: 'addCategory'
    }),
    graphql<Props>(gql(mutations.editAssessmentCategory), {
      name: 'editCategory'
    })
  )(withRouter<IRouterProps>(FormContainer))
);
