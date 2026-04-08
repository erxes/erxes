import { Alert, __, confirm } from '@erxes/ui/src/utils';
import { Box, States } from '../../styles';

import { Actions } from '@erxes/ui/src/styles/main';
import Button from '@erxes/ui/src/components/Button';
import CompaniesMerge from '../../../companies/components/detail/CompaniesMerge';
import CompanyForm from '@erxes/ui-contacts/src/companies/containers/CompanyForm';
import { ControlLabel } from '@erxes/ui/src/components/form';
import CustomerForm from '../../containers/CustomerForm';
import CustomersMerge from '../../containers/CustomersMerge';
import EmailWidget from '@erxes/ui-inbox/src/inbox/components/EmailWidget';
import { ICompany } from '@erxes/ui-contacts/src/companies/types';
import { ICustomer } from '../../types';
import Icon from '@erxes/ui/src/components/Icon';
import { Menu } from '@headlessui/react';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import SmsForm from '@erxes/ui-inbox/src/settings/integrations/containers/telnyx/SmsForm';
import TargetMerge from './TargetMerge';
import Tip from '@erxes/ui/src/components/Tip';
import { isEnabled } from '@erxes/ui/src/utils/core';
import Dropdown from '@erxes/ui/src/components/Dropdown';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';

type Props = {
  coc: ICustomer | ICompany;
  cocType: string;
  remove: () => void;
  merge: (doc: { ids: string[]; data: ICustomer | ICompany }) => void;
  search: (value: string, callback: (objects: any[]) => void) => void;
  changeState?: (value: string) => void;
  isSmall?: boolean;
};

class ActionSection extends React.Component<
  Props,
  { customerState: string; show: boolean }
> {
  constructor(props) {
    super(props);

    this.state = {
      customerState: props.cocType === 'customer' ? props.coc.state : '',
      show: false,
    };
  }

  renderActions() {
    const { coc, cocType } = this.props;
    const { primaryPhone, primaryEmail } = coc;
    let emailValidationStatus = 'unknown';

    if (cocType === 'customer') {
      emailValidationStatus =
        (coc as ICustomer).emailValidationStatus || 'unknown';
    }

    const smsForm = (props) => (
      <SmsForm {...props} primaryPhone={primaryPhone} />
    );

    return (
      <>
        {(isEnabled('engages') || isEnabled('imap')) && (
          <EmailWidget
            disabled={
              emailValidationStatus === 'valid' && primaryEmail ? false : true
            }
            buttonStyle={
              emailValidationStatus === 'valid' && primaryEmail
                ? 'primary'
                : 'simple'
            }
            emailTo={primaryEmail}
            customerId={cocType === 'customer' ? coc._id : undefined}
            buttonSize='small'
            type='action'
          />
        )}
        <ModalTrigger
          dialogClassName='middle'
          title={`Send SMS to (${primaryPhone})`}
          tipText='Send SMS'
          trigger={
            <Button
              disabled={primaryPhone ? false : true}
              size='small'
              btnStyle={primaryPhone ? 'primary' : 'simple'}
            >
              <Icon icon='message' />
            </Button>
          }
          content={smsForm}
        />
        <Tip text='Call' placement='top-end'>
          <Button
            size='small'
            btnStyle={primaryPhone ? 'primary' : 'simple'}
            disabled={primaryPhone ? false : true}
          >
            <Icon icon='phone' />
          </Button>
        </Tip>
      </>
    );
  }

  renderBox(index, type, desc) {
    const { changeState } = this.props;

    if (!changeState) {
      return null;
    }

    const onClick = () => {
      this.setState({ customerState: type });
      changeState(type);
    };

    return (
      <Box
        id='customerChangeStateBox'
        key={index}
        $selected={this.state.customerState === type}
        onClick={onClick}
      >
        <b>{type}</b>
        <p>{__(desc)}</p>
      </Box>
    );
  }

  renderChangeStateForm() {
    const options = [
      {
        value: 'lead',
        desc: __('A person who preparing to buy some service or product'),
      },
      {
        value: 'customer',
        desc: __('A person who already bought some service or product'),
      },
    ];

    const modalContent = () => {
      return (
        <>
          <ControlLabel>Change State</ControlLabel>
          <States>
            {options.map((option, index) =>
              this.renderBox(index, option.value, option.desc)
            )}
          </States>
        </>
      );
    };

    return (
      <ModalTrigger
        title={__('Change state')}
        trigger={<a>{__('Change state')}</a>}
        content={modalContent}
        hideHeader={true}
        centered={true}
      />
    );
  }

  renderDropdown() {
    const { remove, merge, cocType, search, coc } = this.props;

    const onClick = () =>
      confirm()
        .then(() => remove())
        .catch((error) => {
          Alert.error(error.message);
        });

    const generateOptions = (customers) => {
      return customers.map((cus, key) => ({
        key,
        value: JSON.stringify(cus),
        label:
          cus.firstName ||
          cus.lastName ||
          cus.middleName ||
          cus.primaryEmail ||
          cus.primaryPhone ||
          'Unknown',
      }));
    };

    const targetMergeOptions = (companies) => {
      return companies.map((c, key) => ({
        key,
        value: JSON.stringify(c),
        label: c.primaryName || c.website || 'Unknown',
      }));
    };

    const customerForm = (props) => {
      return <CustomerForm {...props} size='lg' customer={coc} />;
    };

    const companyForm = (props) => {
      return <CompanyForm {...props} size='lg' company={coc} />;
    };

    const menuItems = [
      {
        title: 'Edit basic info',
        trigger: <a href='#edit'>{__('Edit Profile')}</a>,
        content: cocType === 'company' ? companyForm : customerForm,
        additionalModalProps: { size: 'lg' },
      },
    ];

    return (
      <Dropdown
        as={DropdownToggle}
        toggleComponent={
          <Button size='small' btnStyle='default'>
            {this.props.isSmall ? (
              <Icon icon='ellipsis-h' />
            ) : (
              <>
                {__('Action')} <Icon icon='angle-down' />
              </>
            )}
          </Button>
        }
        modalMenuItems={menuItems}
        unmount={false}
      >
        <Menu.Item>
          {({ close }) => (
            <div onClick={close}>
              <TargetMerge
                onSave={merge}
                object={coc}
                searchObject={search}
                mergeForm={cocType === "customer" ? CustomersMerge : CompaniesMerge}
                generateOptions={
                  cocType === "customer" ? generateOptions : targetMergeOptions
                }
              />
            </div>
          )}
        </Menu.Item>
        <Menu.Item>
          <a href='#delete' onClick={onClick}>
            {__('Delete')}
          </a>
        </Menu.Item>
        <Menu.Item>{this.renderChangeStateForm()}</Menu.Item>
      </Dropdown>
    );
  }

  render() {
    return (
      <Actions>
        {this.renderActions()}
        {this.renderDropdown()}
      </Actions>
    );
  }
}

export default ActionSection;
