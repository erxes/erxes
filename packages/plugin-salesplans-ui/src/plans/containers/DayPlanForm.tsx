import * as compose from 'lodash.flowright';
import From from '../components/DayPlanForm';
import React from 'react';
import { ButtonMutate } from '@erxes/ui/src/components';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { IDayPlan } from '../types';
import { mutations } from '../graphql';
import { withProps } from '@erxes/ui/src/utils';

type Props = {
  history: any;
  dayPlan?: IDayPlan;
  closeModal: () => void;
};

const DayPlanFormContainer = (props: Props) => {
  const renderButton = ({
    values,
    isSubmitted,
    callback,
    object,
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={mutations.dayPlansAdd}
        variables={values}
        callback={callback}
        refetchQueries={['dayPlans', 'dayPlansCount', 'dayPlansSum']}
        isSubmitted={isSubmitted}
        type="submit"
        uppercase={false}
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } year plan`}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton,
  };

  return <From {...updatedProps} />;
};

export default DayPlanFormContainer;
