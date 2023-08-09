import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { Alert, ButtonMutate, Spinner } from '@erxes/ui/src';
import { IButtonMutateProps, IRouterProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { refetchQueries } from '../common/utils';
import FormCompnent from '../components/Form';
import { mutations, queries } from '../graphql';

type Props = {
  _id?: string;
  queryParams: any;
};

type FinalProps = {
  indicatorDetail: any;
  duplicateMutation: any;
} & IRouterProps &
  Props;

class FormContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      indicatorDetail,
      queryParams,
      history,
      duplicateMutation
    } = this.props;
    if (indicatorDetail?.loading) {
      return <Spinner />;
    }

    const renderButton = ({
      name,
      values,
      isSubmitted,
      confirmationUpdate,
      object,
      callback
    }: IButtonMutateProps) => {
      let mutation = mutations.riskIndicatorAdd;
      let successAction = 'added';

      if (object) {
        mutation = mutations.riskIndicatorUpdate;
        successAction = 'updated';
      }

      const afterMutate = ({ addRiskIndicator }) => {
        if (callback) {
          callback();
        }
        if (!object) {
          const newIndicator = addRiskIndicator || {};
          newIndicator &&
            history.push(
              `/settings/risk-indicators/detail/${newIndicator._id}`
            );
        }
      };

      return (
        <ButtonMutate
          mutation={mutation}
          variables={values}
          callback={afterMutate}
          isSubmitted={isSubmitted}
          refetchQueries={refetchQueries(queryParams)}
          type="submit"
          confirmationUpdate={confirmationUpdate}
          successMessage={`You successfully ${successAction} a ${name}`}
        />
      );
    };

    const duplicatIndicator = _id => {
      duplicateMutation({ variables: { _id } })
        .then(({ data }) => {
          const duplicatedIndicator = data?.duplicateRiskIndicator || {};
          duplicatedIndicator &&
            history.push(
              `/settings/risk-indicators/detail/${duplicatedIndicator._id}`
            );
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };
    const updatedProps = {
      ...this.props,
      detail: indicatorDetail?.riskIndicatorDetail,
      renderButton,
      duplicatIndicator
    };

    return <FormCompnent {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.indicatorDetail), {
      name: 'indicatorDetail',
      skip: ({ _id }) => !_id,
      options: ({ _id }) => ({
        variables: { id: _id }
      })
    }),
    graphql<Props>(gql(mutations.duplicate), {
      name: 'duplicateMutation'
    })
  )(withRouter<IRouterProps>(FormContainer))
);
