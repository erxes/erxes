import {
  FieldStyle,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import { __, renderFullName } from '@erxes/ui/src/utils/core';

import Box from '@erxes/ui/src/components/Box';
import CustomFieldsSection from '../../containers/CustomFieldsSection';
import DetailInfo from './DetailInfo';
import { IClientPortalUser } from '../../types';
import Icon from '@erxes/ui/src/components/Icon';
import { LinkButton } from '@erxes/ui/src/styles/main';
import { List } from '../../styles';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import VerificationForm from '../../containers/details/VerificationForm';

type Props = {
  clientPortalUser: IClientPortalUser;
  history: any;
};

class LeftSidebar extends React.Component<Props> {
  renderCustomer() {
    return renderFullName(this.props.clientPortalUser.customer);
  }

  renderCompany() {
    return renderFullName(this.props.clientPortalUser.company);
  }

  renderVerificationSection() {
    const { clientPortalUser } = this.props;
    const verificationRequest = clientPortalUser.verificationRequest || {
      status: 'notVerified'
    };

    let verificationStatus = 'notVerified';

    switch (verificationRequest.status) {
      case 'verified':
        verificationStatus = 'verified';
        break;
      case 'pending':
        verificationStatus = 'pending';
        break;
      case 'notVerified':
        verificationStatus = 'not verified';
        break;
      default:
        verificationStatus = 'not Verified';
        break;
    }

    const content = props => {
      return (
        <VerificationForm {...props} clientPortalUser={clientPortalUser} />
      );
    };

    const extraButtons = (
      <>
        <ModalTrigger
          title="Verification"
          trigger={
            <button>
              <Icon icon="edit-3" />
            </button>
          }
          content={content}
        />
      </>
    );

    return (
      <Box
        title="Verification"
        isOpen={true}
        name="verification"
        extraButtons={extraButtons}
      >
        <SidebarList className="no-link">
          <li>
            <FieldStyle>{__('status')}</FieldStyle>
            <SidebarCounter>{__(verificationStatus)}</SidebarCounter>
          </li>
        </SidebarList>
      </Box>
    );
  }

  render() {
    const { clientPortalUser, history } = this.props;

    const onClick = () => {
      if (clientPortalUser.type === 'customer') {
        history.push(`/contacts/details/${clientPortalUser.erxesCustomerId}`);
      }
      if (clientPortalUser.type === 'company') {
        history.push(`/companies/details/${clientPortalUser.erxesCompanyId}`);
      }
    };

    return (
      <Sidebar wide={true}>
        <DetailInfo clientPortalUser={clientPortalUser} />
        {this.renderVerificationSection()}
        {!clientPortalUser.customer && !clientPortalUser.company ? null : (
          <Box
            title={
              clientPortalUser.type === 'customer'
                ? 'Customer Detail'
                : 'Company Detail'
            }
            name="showDetail"
          >
            <List>
              <LinkButton onClick={onClick}>
                {clientPortalUser.erxesCustomerId
                  ? this.renderCustomer()
                  : this.renderCompany()}
              </LinkButton>
            </List>
          </Box>
        )}
        <CustomFieldsSection id={clientPortalUser._id} isDetail={true} />
      </Sidebar>
    );
  }
}

export default LeftSidebar;
