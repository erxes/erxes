import * as compose from 'lodash.flowright';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps } from 'modules/common/types';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { IUser } from '../../auth/types';
import Detail from '../components/Detail';
import { mutations } from '../graphql';

type Props = {};

type FinalProps = {
  currentUser: IUser;
} & Props;

const BlankContainer = (props: FinalProps) => {
  const { currentUser } = props;

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback
  }: IButtonMutateProps) => {
    const afterAdd = data => {
      if (!data.automationsAdd || !data.automationsAdd._id) {
        return;
      }

      window.location.href = `/automations/details/${data.automationsAdd._id}`;
    };

    return (
      <ButtonMutate
        mutation={mutations.automationsAdd}
        variables={values}
        callback={afterAdd}
        refetchQueries={['automations', 'automationsMain', 'automationDetail']}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully created a ${name}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    loading: false,
    currentUser,
    renderButton
  };

  return <Detail {...updatedProps} />;
};

export default withProps<Props>(compose()(BlankContainer));
