import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { InfoWrapper } from '@erxes/ui/src/styles/main';
import { Name, NameContainer } from '@erxes/ui-contacts/src/customers/styles';
import React from 'react';
import { IClientPortalUser } from '../../types';
import ClientPortalUserForm from '../../containers/ClientPortalUserForm';

type Props = {
  clientPortalUser: IClientPortalUser;
  children?: React.ReactNode;
};

class InfoSection extends React.Component<Props> {
  render() {
    const { clientPortalUser, children } = this.props;

    const content = props => (
      <ClientPortalUserForm {...props} clientPortalUser={clientPortalUser} />
    );

    return (
      <InfoWrapper>
        <NameContainer>
          <Name fontSize={16}>
            {clientPortalUser.firstName}

            <ModalTrigger
              title="Edit basic info"
              trigger={<Icon icon="pen-1" />}
              size="lg"
              content={content}
            />
          </Name>
        </NameContainer>
        {children}
      </InfoWrapper>
    );
  }
}

export default InfoSection;
