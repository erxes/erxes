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
  SidebarCounter,
  SidebarFlexRow,
  SidebarList
} from 'modules/layout/styles';
import ProductForm from 'modules/settings/productService/containers/product/ProductForm';
import { IProduct } from 'modules/settings/productService/types';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import xss from 'xss';

type Props = {
  product: IProduct;
  remove: () => void;
};

class BasicInfo extends React.Component<Props> {
  renderRow = (label, value) => {
    return (
      <li>
        {__(`${label}`)}:<SidebarCounter>{value || '-'}</SidebarCounter>
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

  renderImage = (item?: IAttachment) => {
    if (!item) {
      return <></>;
    }

    return <Attachment attachment={item} />;
  };

  renderInfo() {
    const { product } = this.props;

    const content = props => <ProductForm {...props} product={product} />;

    return (
      <Sidebar.Section>
        <InfoWrapper>
          <Name>{product.name}</Name>
          <ModalTrigger
            title="Edit basic info"
            trigger={<Icon icon="edit" />}
            size="lg"
            content={content}
          />
        </InfoWrapper>

        {this.renderAction()}

        {this.renderImage(product.attachment)}

        <SidebarList className="no-link">
          {this.renderRow('Code', product.code)}
          {this.renderRow('Type', product.type)}
          {this.renderRow(
            'Category',
            product.category ? product.category.name : ''
          )}
          {this.renderRow('Unit price', product.unitPrice)}
          {this.renderRow('Sku', product.sku)}
          <SidebarFlexRow>{__(`Description`)}</SidebarFlexRow>
        </SidebarList>
        <Content
          dangerouslySetInnerHTML={{
            __html: xss(product.description)
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
