import * as compose from 'lodash.flowright';
import From from '../components/YearPlanForm';
import React from 'react';
import { ButtonMutate } from '@erxes/ui/src/components';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { IYearPlan } from '../types';
import { mutations } from '../graphql';
import { withProps } from '@erxes/ui/src/utils';

type Props = {
  yearPlan?: IYearPlan;
  closeModal: () => void;
};

const YearPlanFormContainer = (props: Props) => {
  const renderButton = ({
    values,
    isSubmitted,
    callback,
    object,
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={mutations.yearPlansAdd}
        variables={values}
        callback={callback}
        refetchQueries={['yearPlans', 'yearPlansCount', 'yearPlansSum']}
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

export default YearPlanFormContainer;
