import Attachment from '@erxes/ui/src/components/Attachment';
import Button from '@erxes/ui/src/components/Button';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { Actions, InfoWrapper } from '@erxes/ui/src/styles/main';
import { IAttachment } from '@erxes/ui/src/types';
import { __, Alert, confirm } from '@erxes/ui/src/utils';

import { Action, Name } from '@erxes/ui-contacts/src/customers/styles';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import {
  FieldStyle,
  SidebarCounter,
  SidebarFlexRow,
  SidebarList,
} from '@erxes/ui/src/layout/styles';
import ProductForm from '@erxes/ui-products/src/containers/ProductForm';
import { IProduct } from '../../../types';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link } from 'react-router-dom';
import xss from 'xss';
import { ProductBarcodeContent, ProductContent } from '../../../styles';
import { isValidBarcode } from '../../../utils';
import { Tip } from '@erxes/ui/src';

type Props = {
  product: IProduct;
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

  renderBarcodes = (barcodes) => {
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

  renderEdit() {
    const { product } = this.props;
    const content = (props) => <ProductForm {...props} product={product} />;
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

  renderImage = (item: IAttachment) => {
    if (!item) {
      return null;
    }

    return <Attachment attachment={item} />;
  };

  renderProductContent = () => {
    const { product } = this.props;

    if (!product.description) {
      return null;
    }

    return (
      <ProductContent
        dangerouslySetInnerHTML={{
          __html: xss(product.description),
        }}
      />
    );
  };

  renderInfo() {
    const { product } = this.props;

    const {
      code,
      name,
      type,
      category,
      unitPrice,
      barcodes,
      attachment,
      vendor,
    } = product;

    return (
      <Sidebar.Section>
        <InfoWrapper>
          <Name>{name}</Name>
          {this.renderAction()}
        </InfoWrapper>

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
        {this.renderProductContent()}
      </Sidebar.Section>
    );
  }

  render() {
    return this.renderInfo();
  }
}

export default BasicInfo;
