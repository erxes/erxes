import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';
import { Spinner } from '@erxes/ui/src';
import { IButtonMutateProps, IRouterProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { RiskIndicatortDetailQueryResponse } from '../common/types';
import FormCompnent from '../components/Form';
import { queries } from '../graphql';

type Props = {
  asssessmentId?: string;
  indicatorDetail?: RiskIndicatortDetailQueryResponse;
  fieldsSkip?: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

type FinalProps = {
  object;
} & ICommonFormProps &
  IRouterProps &
  Props;

class FormContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { indicatorDetail } = this.props;

    const updatedProps = {
      ...this.props,
      indicatorDetail: indicatorDetail?.riskIndicatorDetail,
      detailLoading: indicatorDetail?.loading
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
