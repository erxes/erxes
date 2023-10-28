import * as compose from 'lodash.flowright';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import From from '../components/TimesForm';
import { gql } from '@apollo/client';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { graphql } from '@apollo/client/react/hoc';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { mutations } from '../graphql';
import { queries } from '../graphql';
import { TimeframeQueryResponse } from '../types';
import { withProps } from '@erxes/ui/src/utils';

type Props = {
  closeModal: () => void;
};

type FinalProps = {
  timeFrameQuery: TimeframeQueryResponse;
} & Props;

class ProductFormContainer extends React.Component<FinalProps> {
  render() {
    const { timeFrameQuery } = this.props;
    if (timeFrameQuery.loading) {
      return <Spinner />;
    }

    const renderButton = ({
      values,
      isSubmitted,
      callback,
      object
    }: IButtonMutateProps) => {
      return (
        <ButtonMutate
          mutation={mutations.timeProportionsAdd}
          variables={values}
          callback={callback}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          uppercase={false}
          successMessage={`You successfully created a day labels}`}
        />
      );
    };

    const timeframes = timeFrameQuery.timeframes || [];

    const updatedProps = {
      ...this.props,
      renderButton,
      timeframes
    };

    return <From {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['timeProportions', 'timeProportionsCount'];
};

export default withProps<Props>(
  compose(
    graphql<{}, TimeframeQueryResponse>(gql(queries.timeframes), {
      name: 'timeFrameQuery'
    })
  )(ProductFormContainer)
);
