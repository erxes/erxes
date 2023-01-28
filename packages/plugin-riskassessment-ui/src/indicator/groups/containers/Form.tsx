import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IButtonMutateProps, IRouterProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import { IIndicatorsGroups } from '../common/types';
import FormComponent from '../components/Form';
import { ButtonMutate } from '@erxes/ui/src';
import { mutations } from '../graphql';
import { refetchQueries } from '../common/utilss';

type Props = {
  detail: IIndicatorsGroups;
  closeModal: () => void;
};

type FinalProps = {} & Props;

class Form extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  renderButton({
    values,
    text,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) {
    return (
      <ButtonMutate
        mutation={object ? mutations.updateGroups : mutations.addGroups}
        variables={values}
        callback={callback}
        refetchQueries={refetchQueries()}
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
