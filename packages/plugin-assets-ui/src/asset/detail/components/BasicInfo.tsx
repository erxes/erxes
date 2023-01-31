import Attachment from '@erxes/ui/src/components/Attachment';
import Button from '@erxes/ui/src/components/Button';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { InfoWrapper } from '@erxes/ui/src/styles/main';
import { IAttachment } from '@erxes/ui/src/types';
import { Alert, confirm, __ } from '@erxes/ui/src/utils';

import { Action, Name } from '@erxes/ui-contacts/src/customers/styles';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import {
  FieldStyle,
  SidebarCounter,
  SidebarFlexRow,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import moment from 'moment';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link } from 'react-router-dom';
import xss from 'xss';
import { IAsset } from '../../../common/types';
import { AssetContent, ContainerBox } from '../../../style';
import AssetForm from '../../containers/Form';
import { Tip } from '@erxes/ui/src';

type Props = {
  asset: IAsset;
  remove: () => void;
  history: any;
};

class BasicInfo extends React.Component<Props> {
  renderVendor = vendor => {
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

        <Link to={`/companies/detail/${vendor._id}`}>
          <SidebarCounter>{vendor.primaryName || ''}</SidebarCounter>
        </Link>
      </li>
    );
  };

  renderView = (name, variable, extraField?: any) => {
    const defaultName = name.includes('count') ? 0 : '-';

    return (
      <li>
        <FieldStyle>{__(name)}</FieldStyle>
        <SidebarCounter>{variable || defaultName}</SidebarCounter>
        {extraField && extraField}
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

  renderImage = (item: IAttachment) => {
    if (!item) {
      return null;
    }

    return <Attachment attachment={item} />;
  };

  renderInfo() {
    const { asset, history } = this.props;

    const editForm = props => <AssetForm {...props} asset={asset} />;
    const {
      code,
      name,
      type,
      category,
      parent,
      unitPrice,
      attachment,
      vendor,
      description,
      createdAt
    } = asset;

    const changeAssetDetail = () => {
      return (
        <Button
          onClick={() => history.push(`/settings/assets/detail/${parent._id}`)}
          btnStyle="link"
          style={{ paddingTop: '0' }}
        >
          <Tip text="See Parent Asset Detail" placement="bottom">
            <Icon icon="rightarrow" />
          </Tip>
        </Button>
      );
    };

    return (
      <Sidebar.Section>
        <InfoWrapper>
          <Name>{name}</Name>
          <ContainerBox gap={5}>
            <ModalTrigger
              title="Edit basic info"
              trigger={<Icon icon="edit" />}
              size="lg"
              content={editForm}
            />
          </ContainerBox>
        </InfoWrapper>

        {this.renderAction()}

        {this.renderImage(attachment)}
        <SidebarList className="no-link">
          {this.renderView('Code', code)}
          {this.renderView('Type', type)}
          {this.renderView('Category', category ? category.name : '')}
          {this.renderView(
            'Parent',
            parent ? parent.name : '',
            parent && changeAssetDetail()
          )}
          {this.renderView('Unit price', (unitPrice || 0).toLocaleString())}
          {this.renderVendor(vendor)}
          {this.renderView(
            'Create At',
            moment(createdAt).format('YYYY-MM-DD HH:mm')
          )}
          <SidebarFlexRow>{__(`Description`)}</SidebarFlexRow>
        </SidebarList>
        <AssetContent
          dangerouslySetInnerHTML={{
            __html: xss(description)
          }}
        />
      </Sidebar.Section>
    );
  }

  render() {
    return this.renderInfo();
  }
}

export default BasicInfo;
