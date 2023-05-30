import { Alert, __, confirm } from '@erxes/ui/src/utils';
import { Box, MailBox, States } from '../../styles';

import { Actions } from '@erxes/ui/src/styles/main';
import Button from '@erxes/ui/src/components/Button';
import CompaniesMerge from '../../../companies/components/detail/CompaniesMerge';
import CompanyForm from '@erxes/ui-contacts/src/companies/containers/CompanyForm';
import { ControlLabel } from '@erxes/ui/src/components/form';
import CustomerForm from '../../containers/CustomerForm';
import CustomersMerge from '../detail/CustomersMerge';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import { ICompany } from '@erxes/ui-contacts/src/companies/types';
import { ICustomer } from '../../types';
import Icon from '@erxes/ui/src/components/Icon';
import MailForm from '@erxes/ui-inbox/src/settings/integrations/containers/mail/MailForm';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import SmsForm from '@erxes/ui-inbox/src/settings/integrations/containers/telnyx/SmsForm';
import TargetMerge from './TargetMerge';
import Tip from '@erxes/ui/src/components/Tip';

type Props = {
  coc: ICustomer | ICompany;
  cocType: string;
  remove: () => void;
  merge: (doc: { ids: string[]; data: ICustomer | ICompany }) => void;
  search: (value: string, callback: (objects: any[]) => void) => void;
  changeState?: (value: string) => void;
  isSmall?: boolean;
};
class ActionSection extends React.Component<Props, { customerState: string }> {
  constructor(props) {
    super(props);

    this.state = {
      customerState: props.cocType === 'customer' ? props.coc.state : ''
    };
  }

  renderActions() {
    const { coc, cocType } = this.props;
    const { primaryPhone, primaryEmail } = coc;

    const content = props => (
      <MailBox>
        <MailForm
          fromEmail={primaryEmail}
          customerId={cocType === 'customer' ? coc._id : undefined}
          refetchQueries={
            cocType === 'customer'
              ? ['activityLogsCustomer']
              : ['activityLogsCompany']
          }
          closeModal={props.closeModal}
        />
      </MailBox>
    );

    const smsForm = props => <SmsForm {...props} primaryPhone={primaryPhone} />;

    return (
      <>
        <ModalTrigger
          dialogClassName="middle"
          title="Email"
          trigger={
            <Button
              disabled={primaryEmail ? false : true}
              size="small"
              btnStyle={primaryEmail ? 'primary' : 'simple'}
            >
              <Tip text="Send e-mail" placement="top-end">
                <Icon icon="envelope" />
              </Tip>
            </Button>
          }
          size="lg"
          content={content}
          paddingContent="less-padding"
          enforceFocus={false}
        />
        <ModalTrigger
          dialogClassName="middle"
          title={`Send SMS to (${primaryPhone})`}
          trigger={
            <Button
              disabled={primaryPhone ? false : true}
              size="small"
              btnStyle={primaryPhone ? 'primary' : 'simple'}
            >
              <Tip text="Send SMS" placement="top-end">
                <Icon icon="message" />
              </Tip>
            </Button>
          }
          content={smsForm}
        />
        <Button
          href={primaryPhone && `tel:${primaryPhone}`}
          size="small"
          btnStyle={primaryPhone ? 'primary' : 'simple'}
          disabled={primaryPhone ? false : true}
        >
          <Tip text="Call" placement="top-end">
            <Icon icon="phone" />
          </Tip>
        </Button>
      </>
    );
  }

  renderButton() {
    const { isSmall } = this.props;

    return (
      <Button size="small" btnStyle="default">
        {isSmall ? (
          <Icon icon="ellipsis-h" />
        ) : (
          <>
            {__('Action')} <Icon icon="angle-down" />
          </>
        )}
      </Button>
    );
  }

  renderEditButton() {
    const { cocType, coc } = this.props;

    const customerForm = props => {
      return <CustomerForm {...props} size="lg" customer={coc} />;
    };

    const companyForm = props => {
      return <CompanyForm {...props} size="lg" company={coc} />;
    };

    return (
      <li>
        <ModalTrigger
          title="Edit basic info"
          trigger={<a>{__('Edit')}</a>}
          size="lg"
          content={cocType === 'company' ? companyForm : customerForm}
        />
      </li>
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
        id="customerChangeStateBox"
        key={index}
        selected={this.state.customerState === type}
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
        desc: __('A person who preparing to buy some service or product')
      },
      {
        value: 'customer',
        desc: __('A person who already bought some service or product')
      }
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
        .catch(error => {
          Alert.error(error.message);
        });

    const generateOptions = customers => {
      return customers.map((cus, key) => ({
        key,
        value: JSON.stringify(cus),
        label:
          cus.firstName ||
          cus.lastName ||
          cus.middleName ||
          cus.primaryEmail ||
          cus.primaryPhone ||
          'Unknown'
      }));
    };

    const targetMergeOptions = companies => {
      return companies.map((c, key) => ({
        key,
        value: JSON.stringify(c),
        label: c.primaryName || c.website || 'Unknown'
      }));
    };

    return (
      <Dropdown>
        <Dropdown.Toggle as={DropdownToggle} id="dropdown-action">
          {this.renderButton()}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {this.renderEditButton()}
          <li>
            <TargetMerge
              onSave={merge}
              object={coc}
              searchObject={search}
              mergeForm={
                cocType === 'customer' ? CustomersMerge : CompaniesMerge
              }
              generateOptions={
                cocType === 'customer' ? generateOptions : targetMergeOptions
              }
            />
          </li>
          <li>
            <a href="#delete" onClick={onClick}>
              {__('Delete')}
            </a>
          </li>
          <li>{this.renderChangeStateForm()}</li>
        </Dropdown.Menu>
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
