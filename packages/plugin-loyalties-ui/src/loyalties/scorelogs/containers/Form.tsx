import { ButtonMutate } from '@erxes/ui/src';
import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import React from 'react';
import ScoreForm from '../components/Form';
import mutations from '../graphql/mutations';

type Props = {};

type FinalProps = {} & Props;

class ScoreFormContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const renderButton = ({ values, isSubmitted, callback }) => {
      return (
        <ButtonMutate
          mutation={mutations.changeScore}
          variables={values}
          callback={callback}
          refetchQueries={['scoreLogList']}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={`You successfully`}
        />
      );
    };

    const updatedProps = {
      ...this.props,
      renderBtn: renderButton
    };

    return <ScoreForm {...updatedProps} />;
  }
}

export default withProps<Props>(compose()(ScoreFormContainer));
