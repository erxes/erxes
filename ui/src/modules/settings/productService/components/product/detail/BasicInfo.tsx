import { Content } from 'modules/boards/styles/item';
import Attachment from 'modules/common/components/Attachment';
import Button from 'modules/common/components/Button';
import DropdownToggle from 'modules/common/components/DropdownToggle';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { InfoWrapper } from 'modules/common/styles/main';
import { IAttachment } from 'modules/common/types';
import { __, Alert, confirm } from 'modules/common/utils';

import { Action, Name } from 'modules/customers/styles';
import Sidebar from 'modules/layout/components/Sidebar';
import {
  FieldStyle,
  SidebarCounter,
  SidebarFlexRow,
  SidebarList
} from 'modules/layout/styles';
import ProductForm from 'modules/settings/productService/containers/product/ProductForm';
import { IProduct } from 'modules/settings/productService/types';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link } from 'react-router-dom';
import xss from 'xss';

type Props = {
  product: IProduct;
  remove: () => void;
  chooseFeature: (_id: string, counter: string) => void;
};

class BasicInfo extends React.Component<Props> {
  onRadio = e => {
    const { product, chooseFeature } = this.props;
    chooseFeature(product._id, e.target.value);
  };

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

        <Link to={`/companies/details/${vendor._id}`}>
          <SidebarCounter>{vendor.primaryName || ''}</SidebarCounter>
        </Link>
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
    const { product } = this.props;

    const content = props => <ProductForm {...props} product={product} />;
    const {
      code,
      name,
      type,
      category,
      supply,
      productCount,
      minimiumCount,
      unitPrice,
      sku,
      attachment,
      vendor,
      description
    } = product;

    return (
      <Sidebar.Section>
        <InfoWrapper>
          <Name>{name}</Name>
          <ModalTrigger
            title="Edit basic info"
            trigger={<Icon icon="edit" />}
            size="lg"
            content={content}
          />
        </InfoWrapper>

        {this.renderAction()}

        {this.renderImage(attachment)}
        <SidebarList className="no-link">
          {this.renderView('Code', code)}
          {this.renderView('Type', type)}
          {this.renderView('Category', category ? category.name : '')}
          {this.renderView('Unit price', (unitPrice || 0).toLocaleString())}
          {this.renderView('Sku', sku)}
          {this.renderVendor(vendor)}
          {this.renderView('Supply', supply)}
          {this.renderView('Product count', productCount)}
          {this.renderView('Minimium product count', minimiumCount)}
          <SidebarFlexRow>{__(`Description`)}</SidebarFlexRow>
        </SidebarList>
        <Content
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
