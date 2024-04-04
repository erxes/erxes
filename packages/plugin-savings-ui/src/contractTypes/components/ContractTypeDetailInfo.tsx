import {
  Alert,
  Button,
  confirm,
  DropdownToggle,
  FieldStyle,
  Icon,
  MainStyleInfoWrapper as InfoWrapper,
  ModalTrigger,
  Sidebar,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src';
import { __ } from 'coreui/utils';
import Dropdown from 'react-bootstrap/Dropdown';
import { Action, Name } from '../../contracts/styles';
import React from 'react';

import { Description } from '../../contracts/styles';
import ContractTypeForm from '../containers/ContractTypeForm';
import { IContractTypeDetail } from '../types';

type Props = {
  contractType: IContractTypeDetail;
  remove?: () => void;
};

class DetailInfo extends React.Component<Props> {
  renderRow = (label, value) => {
    return (
      <li>
        <FieldStyle>{__(`${label}`)}</FieldStyle>
        <SidebarCounter>{value || '-'}</SidebarCounter>
      </li>
    );
  };

  renderAction() {
    const { remove } = this.props;

    const onDelete = () =>
      confirm()
        .then(() => remove())
        .catch(error => {
          Alert.error(error.message);
        });

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
    const { contractType } = this.props;
    const { Section } = Sidebar;

    const content = props => (
      <ContractTypeForm {...props} contractType={contractType} />
    );

    return (
      <Sidebar wide={true}>
        <Sidebar.Section>
          <InfoWrapper>
            <Name>{contractType.name}</Name>
            <ModalTrigger
              title={__('Edit basic info')}
              trigger={<Icon icon="edit" />}
              size="lg"
              content={content}
            />
          </InfoWrapper>

          {this.renderAction()}

          <Section>
            <SidebarList className="no-link">
              {this.renderRow('Code', contractType.code)}
              {this.renderRow('Name', contractType.name || '')}
              {this.renderRow('Start Number', contractType.number || '')}
              {this.renderRow(
                'After vacancy count',
                (contractType.vacancy || 0).toLocaleString()
              )}

              {this.renderRow(
                'Interest calc type',
                contractType.interestCalcType
              )}
              {this.renderRow(
                'Store interest interval',
                contractType.storeInterestInterval
              )}
              {this.renderRow('Is allow income', contractType.isAllowIncome)}
              {this.renderRow('Is allow outcome', contractType.isAllowOutcome)}
              <li>
                <FieldStyle>{__(`Description`)}</FieldStyle>
              </li>
              <Description
                dangerouslySetInnerHTML={{
                  __html: contractType.description
                }}
              />
            </SidebarList>
          </Section>
        </Sidebar.Section>
      </Sidebar>
    );
  }
}

export default DetailInfo;
