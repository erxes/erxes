import Attachment from '@erxes/ui/src/components/Attachment';
import Button from '@erxes/ui/src/components/Button';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { InfoWrapper } from '@erxes/ui/src/styles/main';
import { IAttachment } from '@erxes/ui/src/types';
import { __, Alert, confirm } from '@erxes/ui/src/utils';

import { Action, Name } from '@erxes/ui-contacts/src/customers/styles';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import {
  FieldStyle,
  SidebarCounter,
  SidebarFlexRow,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import ProductForm from '@erxes/ui-products/src/containers/ProductForm';
import { IProduct } from '../../../types';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link } from 'react-router-dom';
import xss from 'xss';
import { ProductBarcodeContent, ProductContent } from '../../../styles';
import { isValidBarcode } from '../../../utils';

type Props = {
  product: IProduct;
  remove: () => void;
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

        <Link to={`/companies/details/${vendor._id}`}>
          <SidebarCounter>{vendor.primaryName || ''}</SidebarCounter>
        </Link>
      </li>
    );
  };

  renderBarcodes = barcodes => {
    return (
      <>
        <li>
          <FieldStyle>{__(`Barcodes`)}</FieldStyle>
        </li>
        {(barcodes || []).map((item: string, iteration: number) => (
          <ProductBarcodeContent key={iteration} isValid={isValidBarcode(item)}>
            <Link
              to={`/settings/barcode-generator/${this.props.product._id}?barcode=${item}`}
            >
              <Icon icon="print" />
              {item}
            </Link>
          </ProductBarcodeContent>
        ))}
      </>
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
      unitPrice,
      barcodes,
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
            size="xl"
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
          {this.renderBarcodes(barcodes)}
          {this.renderVendor(vendor)}
          <SidebarFlexRow>{__(`Description`)}</SidebarFlexRow>
        </SidebarList>
        <ProductContent
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
