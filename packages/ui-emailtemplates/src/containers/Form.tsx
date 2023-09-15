import React from 'react';
import { IEmailTemplate } from '../types';
import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { mutations, queries } from '../graphql';
import { ButtonMutate } from '@erxes/ui/src/';
import FormComponent from '../components/Form';
import { gql } from '@apollo/client';

type Props = {
  object?: IEmailTemplate;
  params?: any;
  contentType?: string;
} & ICommonFormProps;

class Form extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback,
      confirmationUpdate,
      object
    }: IButtonMutateProps) => {
      const afterMutate = () => {
        if (callback) {
          callback();
        }
      };

      let mutation = mutations.emailTemplatesAdd;
      let successAction = 'added';

      if (object) {
        mutation = mutations.emailTemplatesEdit;
        successAction = 'updated';
      }

      return (
        <ButtonMutate
          mutation={mutation}
          variables={values}
          callback={afterMutate}
          isSubmitted={isSubmitted}
          refetchQueries={[
            {
              query: gql(queries.emailTemplates),
              variables: { ...this.props.params }
            },
            {
              query: gql(queries.totalCount),
              variables: { ...this.props.params }
            }
          ]}
          type="submit"
          confirmationUpdate={confirmationUpdate}
          successMessage={`You successfully ${successAction} a ${name}`}
        />
      );
    };

    const updatedProps = {
      ...this.props,
      renderButton
    };

    return <FormComponent {...updatedProps} />;
  }
}

export default Form;
