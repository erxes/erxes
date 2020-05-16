import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps } from 'modules/common/types';
import React from 'react';
import { mutations } from '../graphql';
import DashbaordForm from '../components/DashboardForm';
import { IDashboard } from '../types';

type Props = {
  show: boolean;
  dashboard?: IDashboard;
  closeModal: () => void;
};

class DashboardFormContainer extends React.Component<Props> {
  render() {
    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback,
      object
    }: IButtonMutateProps) => {
      const afterSave = () => {
        if (callback) {
          callback();
        }
      };

      return (
        <ButtonMutate
          mutation={object ? mutations.dashboardEdit : mutations.dashboardAdd}
          variables={values}
          callback={afterSave}
          refetchQueries={['dashboards', 'dashboardDetails']}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        />
      );
    };

    return <DashbaordForm renderButton={renderButton} {...this.props} />;
  }
}

export default DashboardFormContainer;
