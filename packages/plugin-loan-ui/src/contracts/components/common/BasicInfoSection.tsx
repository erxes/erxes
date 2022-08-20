import {
  __,
  Alert,
  Button,
  confirm,
  DropdownToggle,
  Icon,
  MainStyleInfoWrapper as InfoWrapper,
  ModalTrigger,
  Sidebar
} from '@erxes/ui/src';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';

import ContractForm from '../../containers/ContractForm';
import CloseForm from '../../containers/detail/CloseForm';
import { Action, Name } from '../../styles';
import { IContract } from '../../types';
import ContractPrint from './ContractPrint';
import DetailInfo from './DetailInfo';

type Props = {
  contract: IContract;
  remove: () => void;
  toConfirm: () => void;
};

class BasicInfoSection extends React.Component<Props> {
  onPrint = () => {
    const { contract } = this.props;

    const content = ContractPrint(contract);

    const printDiv = () => {
      const newWin = window.open('', 'Print-Window');
      newWin.document.open();
      newWin.document.write(
        '<html><body onload="window.print()">' + content + '</body></html>'
      );
      newWin.document.close();
    };

    printDiv();
  };

  toConfirmLending = () => {
    const { toConfirm } = this.props;

    confirm(__('Are you sure to Confirm Lending? This cannot be undone.'))
      .then(() => toConfirm())
      .catch(error => {
        Alert.error(error.message);
      });
  };

  renderAction() {
    const { remove, contract } = this.props;

    const onDelete = () =>
      confirm()
        .then(() => remove())
        .catch(error => {
          Alert.error(error.message);
        });

    const closeForm = props => <CloseForm {...props} contract={contract} />;

    return (
      <Action>
        <Dropdown>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-info">
            <Button btnStyle="simple" size="medium">
              {__('Action')}
              <Icon icon="angle-down" />
            </Button>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <li>
              <a href="#print" onClick={this.onPrint}>
                {__('Print Contract')}
              </a>
            </li>
            <li>
              <a href="#delete" onClick={this.toConfirmLending}>
                {__('To Confirm Lending')}
              </a>
            </li>
            <li>
              <ModalTrigger
                title="To Close Contract"
                trigger={<a href="#toClose">{__('To Close Contract')}</a>}
                size="lg"
                content={closeForm}
              />
            </li>
            <li>
              <a href="#delete" onClick={onDelete}>
                {__('Archive')}
              </a>
            </li>
            <li>
              <a href="#delete" onClick={onDelete}>
                {__('Delete')}
              </a>
            </li>
          </Dropdown.Menu>
        </Dropdown>
      </Action>
    );
  }

  render() {
    const { Section } = Sidebar;
    const { contract } = this.props;

    const contractForm = props => (
      <ContractForm {...props} contract={contract} />
    );

    return (
      <Sidebar.Section>
        <InfoWrapper>
          <Name>{contract.number}</Name>
          <ModalTrigger
            title="Edit basic info"
            trigger={<Icon icon="edit" />}
            size="lg"
            content={contractForm}
          />
        </InfoWrapper>

        {this.renderAction()}

        <Section>
          <DetailInfo contract={contract} />
        </Section>
      </Sidebar.Section>
    );
  }
}

export default BasicInfoSection;
