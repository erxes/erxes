import Attachment from '@erxes/ui/src/components/Attachment';
import Button from '@erxes/ui/src/components/Button';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { Actions, InfoWrapper } from '@erxes/ui/src/styles/main';
import { IAttachment } from '@erxes/ui/src/types';
import { __, Alert, confirm } from '@erxes/ui/src/utils';

import { Name } from '@erxes/ui-contacts/src/customers/styles';
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

const BasicInfo: React.FC<Props> = (props) => {
  const { history, product, remove } = props;

  const renderVendor = (vendor) => {
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

  const renderBarcodes = (barcodes) => {
    return (
      <>
        <li>
          <FieldStyle>{__(`Barcodes`)}</FieldStyle>
        </li>
        {(barcodes || []).map((item: string, iteration: number) => (
          <ProductBarcodeContent key={iteration} isValid={isValidBarcode(item)}>
            <Link
              to={`/settings/barcode-generator/${product._id}?barcode=${item}`}
            >
              <Icon icon="print" />
              {item}
            </Link>
          </ProductBarcodeContent>
        ))}
      </>
    );
  };

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
  };

  const renderAction = () => {
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

  const renderImage = (item: IAttachment) => {
    if (!item) {
      return null;
    }

    return <Attachment attachment={item} />;
  };

  const renderProductContent = () => {
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

  const renderInfo = () => {
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
          {renderAction()}
        </InfoWrapper>

        {renderImage(attachment)}
        <SidebarList className="no-link">
          {renderView('Code', code)}
          {renderView('Type', type)}
          {renderView('Category', category ? category.name : '')}
          {renderView('Unit price', (unitPrice || 0).toLocaleString())}
          {renderBarcodes(barcodes)}
          {renderVendor(vendor)}
          <SidebarFlexRow>{__(`Description`)}</SidebarFlexRow>
        </SidebarList>
        {renderProductContent()}
      </Sidebar.Section>
    );
  };

  return renderInfo();
};

export default BasicInfo;
