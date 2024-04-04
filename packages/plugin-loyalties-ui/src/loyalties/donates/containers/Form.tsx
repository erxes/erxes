import * as compose from 'lodash.flowright';
import Form from '../components/Form';
import React from 'react';
import { ButtonMutate } from '@erxes/ui/src/components';
import { withProps } from '@erxes/ui/src/utils';
import { IButtonMutateProps, IQueryParams } from '@erxes/ui/src/types';
import { IDonate } from '../types';
import { IUser } from '@erxes/ui/src/auth/types';
import { mutations } from '../graphql';
import { UsersQueryResponse } from '@erxes/ui/src/auth/types';

type Props = {
  donate: IDonate;
  getAssociatedDonate?: (donateId: string) => void;
  closeModal: () => void;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  currentUser: IUser;
  queryParams: IQueryParams;
} & Props;

class DonateFromContainer extends React.Component<FinalProps> {
  render() {
    const renderButton = ({
      name,
      values,
      isSubmitted,
      object
    }: IButtonMutateProps) => {
      const { closeModal, getAssociatedDonate } = this.props;

      const afterSave = data => {
        closeModal();

        if (getAssociatedDonate) {
          getAssociatedDonate(data.donatesAdd);
        }
      };

      return (
        <ButtonMutate
          mutation={object ? mutations.donatesEdit : mutations.donatesAdd}
          variables={values}
          callback={afterSave}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
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
    'donatesMain',
    'donateDetail',
    // donates for customer detail donate associate
    'donates',
    'donateCounts',
    'donateCampaigns',
    'donateCampaignsTotalCount'
  ];
};

export default withProps<Props>(compose()(DonateFromContainer));
