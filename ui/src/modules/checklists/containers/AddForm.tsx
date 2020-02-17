import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps } from 'modules/common/types';
import * as React from 'react';
import AddForm from '../components/AddForm';
import { mutations } from '../graphql';

type Props = {
  itemId: string;
  type: string;
  afterSave: () => void;
};

class AddFormContainer extends React.Component<Props> {
  render() {
    const renderButton = ({
      values,
      isSubmitted,
      callback
    }: IButtonMutateProps) => {
      return (
        <ButtonMutate
          mutation={mutations.checklistsAdd}
          variables={values}
          callback={callback}
          refetchQueries={['checklists']}
          isSubmitted={isSubmitted}
          btnSize="small"
          type="submit"
        />
      );
    };

    const updatedProps = {
      ...this.props,
      renderButton
    };

    return <AddForm {...updatedProps} />;
  }
}

export default AddFormContainer;
