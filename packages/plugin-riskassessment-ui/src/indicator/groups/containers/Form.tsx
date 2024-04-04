import { ButtonMutate } from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import React from 'react';
import { IIndicatorsGroups } from '../common/types';
import { refetchQueries } from '../common/utilss';
import FormComponent from '../components/Form';
import { mutations } from '../graphql';

type Props = {
  detail: IIndicatorsGroups;
  closeModal: () => void;
  queryParams: any;
};

type FinalProps = {} & Props;

class Form extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
    this.renderButton = this.renderButton.bind(this);
  }

  renderButton({
    values,
    text,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) {
    const { queryParams } = this.props;

    return (
      <ButtonMutate
        mutation={object ? mutations.updateGroups : mutations.addGroups}
        variables={values}
        callback={callback}
        refetchQueries={refetchQueries(queryParams || {})}
        isSubmitted={isSubmitted}
        type="submit"
        uppercase={false}
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${text}`}
      />
    );
  }

  render() {
    const updatedProps = {
      ...this.props,
      renderButton: this.renderButton
    };

    return <FormComponent {...updatedProps} />;
  }
}

export default withProps(compose()(Form));
