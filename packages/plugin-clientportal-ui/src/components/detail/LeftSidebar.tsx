import {
  FieldStyle,
  SectionContainer,
  SidebarCounter,
  SidebarList,
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
import CompanyAssignForm from '../../containers/details/CompanyAssignForm';
import { Button } from '@erxes/ui/src/components';
import { useNavigate } from 'react-router-dom';

type Props = {
  clientPortalUser: IClientPortalUser;

  queryParams?: any;
};

const LeftSidebar: React.FC<Props> = (props: Props) => {
  const { clientPortalUser, queryParams } = props;
  const navigate = useNavigate()
  const renderCustomer = () => {
    return renderFullName(clientPortalUser.customer);
  };

  const renderCompany = () => {
    return renderFullName(clientPortalUser.company);
  };

  const renderCompanyAssignSection = () => {
    const content = ({ closeModal }) => {
      return (
        <CompanyAssignForm
          closeModal={closeModal}
          {...props}
          clientPortalUser={clientPortalUser}
        />
      );
    };

    const trigger = (
      <Button btnStyle="link">
        <Icon icon="edit-3" />
      </Button>
    );

    const extraButtons = (
      <ModalTrigger
        title={'Assign corresponding company to user'}
        trigger={trigger}
        content={content}
      />
    );

    return (
      <Box
        title="Company"
        isOpen={true}
        name="verification"
        extraButtons={extraButtons}
      >
        <SidebarList className="no-link">
          <li>
            <FieldStyle>{__('Company Name')}</FieldStyle>
            <SidebarCounter>{clientPortalUser.companyName}</SidebarCounter>
          </li>
        </SidebarList>
      </Box>
    );
  };

  const renderVerificationSection = () => {
    const verificationRequest = clientPortalUser.verificationRequest || {
      status: 'notVerified',
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

    const content = (props) => {
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
  };

  const onClick = () => {
    if (clientPortalUser.type === 'customer') {
      navigate(`/contacts/details/${clientPortalUser.erxesCustomerId}`);
    }
    if (clientPortalUser.type === 'company') {
      navigate(`/companies/details/${clientPortalUser.erxesCompanyId}`);
    }
  };

  return (
    <Sidebar wide={true} hasBorder={true}>
      <SectionContainer>
        <DetailInfo clientPortalUser={clientPortalUser} />
      </SectionContainer>
      {renderVerificationSection()}
      {clientPortalUser.customer && renderCompanyAssignSection()}
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
                ? renderCustomer()
                : renderCompany()}
            </LinkButton>
          </List>
        </Box>
      )}
      <CustomFieldsSection id={clientPortalUser._id} isDetail={true} />
    </Sidebar>
  );
};

export default LeftSidebar;
