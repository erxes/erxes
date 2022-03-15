import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import DashbaordForm from '../components/DashboardForm';
import { mutations } from '../graphql';
import { IDashboard } from '../types';

type Props = {
  dashboard?: IDashboard;
  dashboards: IDashboard[];
  trigger?: React.ReactNode;
  loading: boolean;
};

class DashboardFormContainer extends React.Component<Props> {
  renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.dashboardEdit : mutations.dashboardAdd}
        variables={values}
        callback={callback}
        refetchQueries={['dashboards', 'dashboardDetails']}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  render() {
    const updatedProps = {
      ...this.props,
      renderButton: this.renderButton
    };

    return <DashbaordForm {...updatedProps} />;
  }
}

export default DashboardFormContainer;
