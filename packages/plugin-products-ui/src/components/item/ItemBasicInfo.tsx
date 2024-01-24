import Button from '@erxes/ui/src/components/Button';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { Actions, InfoWrapper } from '@erxes/ui/src/styles/main';
import { __, Alert, confirm } from '@erxes/ui/src/utils';
import { Name } from '@erxes/ui-contacts/src/customers/styles';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import {
  FieldStyle,
  SidebarCounter,
  SidebarList,
} from '@erxes/ui/src/layout/styles';
import { IItem } from './../../types';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from '../../containers/item/ItemForm';
import { IAttachment } from '@erxes/ui/src/types';
import Attachment from '@erxes/ui/src/components/Attachment';

type Props = {
  item: IItem;
  remove: () => void;
  history: any;
};

function BasicInfo(props: Props) {
  const renderView = (name, variable) => {
    const defaultName = name.includes('count') ? 0 : '-';

    return (
      <li>
        <FieldStyle>{__(name)}</FieldStyle>
        <SidebarCounter>{variable || defaultName}</SidebarCounter>
      </li>
    );
  };

  const renderEdit = () => {
    const { item } = props;
    const content = (props) => <Form {...props} item={item} />;
    return (
      <ModalTrigger
        title="Edit basic info"
        trigger={
          <li>
            <a href="#edit">{__('Edit')}</a>
          </li>
        }
        size="xl"
        content={content}
      />
    );
  };

  const renderAction = () => {
    const { remove } = props;

    const onDelete = () =>
      confirm()
        .then(() => remove())
        .catch((error) => {
          Alert.error(error.message);
        });

    return (
      <Actions>
        <Dropdown>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-info">
            <Button btnStyle="simple" size="medium">
              {__('Action')}
              <Icon icon="angle-down" />
            </Button>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {renderEdit()}
            <li>
              <a href="#delete" onClick={onDelete}>
                {__('Delete')}
              </a>
            </li>
          </Dropdown.Menu>
        </Dropdown>
      </Actions>
    );
  };

  const renderImage = (image: IAttachment) => {
    if (!image) {
      return null;
    }
    return <Attachment attachment={image} />;
  };

  const renderInfo = () => {
    const { item } = props;
    const { name, code, description, attachment } = item;

    return (
      <Sidebar.Section>
        <InfoWrapper>
          <Name>{name}</Name>
          {renderAction()}
        </InfoWrapper>

        {renderImage(attachment)}
        <SidebarList className="no-link">
          {renderView('Name', name)}
          {renderView('Code', code)}
          {renderView('Description', description)}
        </SidebarList>
      </Sidebar.Section>
    );
  };

  return renderInfo();
}

export default BasicInfo;
