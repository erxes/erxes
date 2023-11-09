import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import { mutations } from '../graphql';
import { ButtonMutate } from '@erxes/ui/src';
import FormCompnent from '../components/Form';

type Props = {
  bot?: any;
  closeModal: () => void;
};

class Form extends React.Component<Props> {
  render() {
    const renderButton = ({
      name,
      values,
      isSubmitted,
      confirmationUpdate,
      object,
      callback
    }: IButtonMutateProps) => {
      let mutation = mutations.addBot;
      let successAction = 'added';

      if (object) {
        mutation = mutations.updateBot;
        successAction = 'updated';
      }

      const afterMutate = () => {
        if (callback) {
          callback();
        }
      };

      return (
        <ButtonMutate
          mutation={mutation}
          variables={values}
          callback={afterMutate}
          isSubmitted={isSubmitted}
          //   refetchQueries={refetchQueries(queryParams)}
          type="submit"
          confirmationUpdate={confirmationUpdate}
          successMessage={`You successfully ${successAction} a ${name}`}
        />
      );
    };

    const updatedProps = {
      renderButton,
      ...this.props
    };

    return <FormCompnent {...updatedProps} />;
  }
}
export default Form;
