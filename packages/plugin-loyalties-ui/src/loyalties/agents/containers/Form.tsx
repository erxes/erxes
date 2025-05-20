import * as compose from 'lodash.flowright';
import React from 'react';

import Form from '../components/Form';
import { ButtonMutate } from '@erxes/ui/src/components';
import { withProps } from '@erxes/ui/src/utils';
import { IButtonMutateProps, IQueryParams } from '@erxes/ui/src/types';
import { IAgent } from '../types';
import { mutations } from '../graphql';

type Props = {
  agent: IAgent;
  closeModal: () => void;
};

type FinalProps = {
  queryParams: IQueryParams;
} & Props;

class AgentFormContainer extends React.Component<FinalProps> {
  render() {
    const renderButton = ({
      name,
      values,
      isSubmitted,
      object
    }: IButtonMutateProps) => {
      const { closeModal } = this.props;

      const afterSave = () => {
        closeModal();
      };

      return (
        <ButtonMutate
          mutation={object && object._id ? mutations.agentsEdit : mutations.agentsAdd}
          variables={values}
          callback={afterSave}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={`You successfully ${object ? 'updated' : 'added'
            } an ${name}`}
        />
      );
    };

    const updatedProps = {
      ...this.props,
      renderButton
    };

    return <Form {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return [
    'agentsMain'
  ];
};

export default withProps<Props>(compose()(AgentFormContainer));
