import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps } from 'modules/common/types';
import React from 'react';
import DashbaordForm from '../components/DashboardForm';
import { mutations } from '../graphql';
import { IDashboard } from '../types';

type Props = {
  dashboard?: IDashboard;
  trigger?: React.ReactNode;
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
