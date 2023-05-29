import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';
import { ButtonMutate, Spinner } from '@erxes/ui/src';
import { IButtonMutateProps, IRouterProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { RiskIndicatortDetailQueryResponse } from '../common/types';
import { refetchQueries } from '../common/utils';
import FormCompnent from '../components/Form';
import { mutations, queries } from '../graphql';

type Props = {
  asssessmentId?: string;
  fieldsSkip?: any;
  closeModal: () => void;
  queryParams: any;
};

type FinalProps = {
  indicatorDetail: any;
} & ICommonFormProps &
  IRouterProps &
  Props;

class FormContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { indicatorDetail, closeModal, queryParams } = this.props;
    const renderButton = ({
      name,
      values,
      isSubmitted,
      confirmationUpdate,
      object
    }: IButtonMutateProps) => {
      let mutation = mutations.riskIndicatorAdd;
      let successAction = 'added';
      if (object) {
        mutation = mutations.riskIndicatorUpdate;
        successAction = 'updated';
      }
      return (
        <ButtonMutate
          mutation={mutation}
          variables={values}
          callback={closeModal}
          isSubmitted={isSubmitted}
          refetchQueries={refetchQueries(queryParams)}
          type="submit"
          confirmationUpdate={confirmationUpdate}
          successMessage={`You successfully ${successAction} a ${name}`}
        />
      );
    };

    const updatedProps = {
      ...this.props,
      indicatorDetail: indicatorDetail?.riskIndicatorDetail,
      detailLoading: indicatorDetail?.loading,
      renderButton
    };

    if (indicatorDetail?.loading) {
      return <Spinner />;
    }

    return <FormCompnent {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.indicatorDetail), {
      name: 'indicatorDetail',
      skip: ({ asssessmentId }) => !asssessmentId,
      options: ({ asssessmentId, fieldsSkip }) => ({
        variables: { id: asssessmentId, fieldsSkip }
      })
    })
  )(withRouter<IRouterProps>(FormContainer))
);
