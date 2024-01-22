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
  SidebarFlexRow,
  SidebarList,
} from '@erxes/ui/src/layout/styles';
import { IItem } from './../../types';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link } from 'react-router-dom';
import xss from 'xss';
import { Tip } from '@erxes/ui/src';
import { ProductContent } from '../../styles';

type Props = {
  item: IItem;
  remove: () => void;
  history: any;
};

class BasicInfo extends React.Component<Props> {
  renderVendor = (vendor) => {
    const { history } = this.props;

    if (!vendor) {
      return (
        <li>
          <FieldStyle>{__(`Vendor`)}</FieldStyle>
          <SidebarCounter>-</SidebarCounter>
        </li>
      );
    }

    return (
      <li>
        <FieldStyle>{__(`Vendor`)}</FieldStyle>
        <SidebarCounter>{vendor.primaryName || ''}</SidebarCounter>
        <Button
          onClick={() => history.push(`/companies/details/${vendor._id}`)}
          btnStyle="link"
          style={{ padding: '0', paddingLeft: '8px' }}
        >
          <Tip text="See Vendor Detail" placement="bottom">
            <Icon icon="rightarrow" />
          </Tip>
        </Button>
      </li>
    );
  };

  renderView = (name, variable) => {
    const defaultName = name.includes('count') ? 0 : '-';

    return (
      <li>
        <FieldStyle>{__(name)}</FieldStyle>
        <SidebarCounter>{variable || defaultName}</SidebarCounter>
      </li>
    );
  };

  renderEdit() {
    function content(props) {
      return <>form</>;
    }
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
  }

  renderAction() {
    const { remove } = this.props;

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
            {this.renderEdit()}
            <li>
              <a href="#delete" onClick={onDelete}>
                {__('Delete')}
              </a>
            </li>
          </Dropdown.Menu>
        </Dropdown>
      </Actions>
    );
  }

  renderItemContent = () => {
    const { item } = this.props;

    if (!item.description) {
      return null;
    }

    return (
      <ProductContent
        dangerouslySetInnerHTML={{
          __html: xss(item.description),
        }}
      />
    );
  };

  renderInfo() {
    const { item } = this.props;

    const { code, name, description } = item;

    return (
      <Sidebar.Section>
        <InfoWrapper>
          <Name>{name}</Name>
          {this.renderAction()}
        </InfoWrapper>

        <SidebarList className="no-link">
          {this.renderView('Code', code)}
          {this.renderView('Name', name)}
          {this.renderView('Description', description)}
          <SidebarFlexRow>{__(`Description`)}</SidebarFlexRow>
        </SidebarList>
      </Sidebar.Section>
    );
  }

  render() {
    return this.renderInfo();
  }
}

export default BasicInfo;
