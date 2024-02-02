import * as compose from 'lodash.flowright';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import From from '../../components/time/TimesEditForm';
import { gql, useQuery } from '@apollo/client';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { graphql } from '@apollo/client/react/hoc';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { mutations } from '../../graphql';
import { queries } from '../../graphql';
import { ITimeProportion, TimeframeQueryResponse } from '../../types';
import { withProps } from '@erxes/ui/src/utils';

type Props = {
  timeProportion: ITimeProportion;
  closeModal: () => void;
};

const TimesFormEditContainer = (props: Props) => {
  const timeFrameQuery = useQuery<TimeframeQueryResponse>(
    gql(queries.timeframes),
  );

  if (timeFrameQuery.loading) {
    return <Spinner />;
  }

  const renderButton = ({
    values,
    isSubmitted,
    callback,
    object,
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={mutations.timeProportionEdit}
        variables={values}
        callback={callback}
        refetchQueries={['timeProportions', 'timeProportionsCount']}
        isSubmitted={isSubmitted}
        type="submit"
        uppercase={false}
        successMessage={`You successfully updated a day labels`}
      />
    );
  };

  const timeframes = timeFrameQuery?.data?.timeframes || [];

  const updatedProps = {
    ...props,
    timeframes,
    renderButton,
  };

  return <From {...updatedProps} />;
};

export default TimesFormEditContainer;
