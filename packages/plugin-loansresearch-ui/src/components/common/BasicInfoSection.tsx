// import { Action, Name } from '../../styles';
import { Actions } from '@erxes/ui/src/styles/main';
import {
  Alert,
  Button,
  DropdownToggle,
  Icon,
  MainStyleInfoWrapper as InfoWrapper,
  Sidebar,
  __,
  confirm,
} from '@erxes/ui/src';
import { Name } from '@erxes/ui-contacts/src/customers/styles';
import Dropdown from '@erxes/ui/src/components/Dropdown';

import { ILoanResearch } from '../../types';
import React from 'react';
import LoansResearchForm from '../../containers/LoansResearchForm';

type Props = {
  loansResearch: ILoanResearch;
  remove: () => void;
};

const BasicInfoSection = (props: Props) => {
  const { loansResearch, remove } = props;

  const renderAction = () => {
    const onDelete = () =>
      confirm()
        .then(() => remove())
        .catch((error) => {
          Alert.error(error.message);
        });

    const loanForm = (props) => (
      <LoansResearchForm {...props} loansResearch={loansResearch} />
    );

    const menuItems = [
      {
        title: 'Edit basic info',
        trigger: <a href="#edit">{__('Edit')}</a>,
        content: loanForm,
        additionalModalProps: { size: 'lg' },
      },
    ];

    return (
      <Actions>
        <Dropdown
          as={DropdownToggle}
          toggleComponent={
            <Button btnStyle="simple" size="medium">
              {__('Action')}
              <Icon icon="angle-down" />
            </Button>
          }
          modalMenuItems={menuItems}
        >
          <li>
            <a href="#delete" onClick={onDelete}>
              {__('Delete')}
            </a>
          </li>
        </Dropdown>
      </Actions>
    );
  };

  return (
    <Sidebar.Section>
      <InfoWrapper>
        <Name>{loansResearch.dealId}</Name>

        {renderAction()}
      </InfoWrapper>
    </Sidebar.Section>
  );
};

export default BasicInfoSection;
