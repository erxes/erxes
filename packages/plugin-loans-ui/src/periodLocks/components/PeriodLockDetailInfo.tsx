import dayjs from 'dayjs';
import {
  __,
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
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';

import { Action, Name } from '../../contracts/styles';
import PeriodLockForm from '../containers/PeriodLockForm';
import { IPeriodLockDetail } from '../types';

type Props = {
  periodLock: IPeriodLockDetail;
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
        .then(() => remove && remove())
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
    const { periodLock } = this.props;
    const { Section } = Sidebar;

    const content = props => (
      <PeriodLockForm {...props} periodLock={periodLock} />
    );

    return (
      <Sidebar wide={true}>
        <Sidebar.Section>
          <InfoWrapper>
            <Name>{dayjs(periodLock.date).format('ll')}</Name>
            <ModalTrigger
              title="Edit basic info"
              trigger={<Icon icon="edit" />}
              size="lg"
              content={content}
            />
          </InfoWrapper>

          {this.renderAction()}

          <Section>
            <SidebarList className="no-link"></SidebarList>
          </Section>
        </Sidebar.Section>
      </Sidebar>
    );
  }
}

export default DetailInfo;
