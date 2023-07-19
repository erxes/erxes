import { ButtonMutate } from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import React from 'react';
import FormComponent from '../components/Form';
import { mutations } from '../graphql';
import { refetchQueries } from './List';

type Props = {
  queryParams: any;
  sync: any;
  closeModal: () => void;
};

type FinalProps = {} & Props;

class Form extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { closeModal, sync } = this.props;

    const renderButton = ({
      text,
      values,
      isSubmitted,
      callback,
      object
    }: IButtonMutateProps) => {
      return (
        <ButtonMutate
          mutation={object ? mutations.edit : mutations.add}
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

    const updateProps = {
      renderButton,
      detail: sync,
      closeModal
    };

    return <FormComponent {...updateProps} />;
  }
}

export default withProps<Props>(compose()(Form));
