import { ButtonMutate } from '@erxes/ui/src';
import { IButtonMutateProps, IRouterProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import React from 'react';
import { refetchQueries } from '../common';
import FormComponent from '../components/Form';
import { mutations } from '../graphql';

type Props = {
  queryParams: any;
  history: any;
  closeModal: () => void;
  config?: any;
} & IRouterProps;

class Form extends React.Component<Props> {
  constructor(props) {
    super(props);
  }
  render() {
    const renderButton = ({
      text,
      values,
      isSubmitted,
      callback,
      object
    }: IButtonMutateProps) => {
      return (
        <ButtonMutate
          mutation={object ? mutations.updateConfig : mutations.addConfig}
          variables={values}
          callback={callback}
          refetchQueries={refetchQueries(this.props.queryParams)}
          isSubmitted={isSubmitted}
          type="submit"
          uppercase={false}
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${text}`}
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

export default withProps<Props>(compose()(Form));
