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
import ClientPortalUserForm from '../../containers/ClientPortalUserForm';

import { Action, Name } from '../../styles';
import { IClientPortalUser } from '../../types';
import DetailInfo from './DetailInfo';

type Props = {
  clientPortalUser: IClientPortalUser;
  remove: () => void;
};

class BasicInfoSection extends React.Component<Props> {
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
    const { Section } = Sidebar;
    const { clientPortalUser } = this.props;

    const content = props => (
      <ClientPortalUserForm {...props} clientPortalUser={clientPortalUser} />
    );

    return (
      <Sidebar.Section>
        <InfoWrapper>
          <Name>{clientPortalUser.firstName}</Name>
          <ModalTrigger
            title="Edit basic info"
            trigger={<Icon icon="edit" />}
            size="xl"
            content={content}
          />
        </InfoWrapper>

        {this.renderAction()}

        <Section>
          <DetailInfo clientPortalUser={clientPortalUser} />
        </Section>
      </Sidebar.Section>
    );
  }
}

export default BasicInfoSection;
