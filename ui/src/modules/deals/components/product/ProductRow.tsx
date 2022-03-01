import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import { NameWrapper, RemoveRow, TypeBox } from 'modules/deals/styles';
import { IProductData } from 'modules/deals/types';
import React from 'react';

type Props = {
  productData: IProductData;
  children: React.ReactNode;
  activeProduct?: string;
  onRemove: () => void;
  onRemoveTemplate: () => void;
  changeCurrentProduct: (productId: string) => void;
  templateInfo: any;
};

function ProductRow(props: Props) {
  const renderAmmount = (value: number) => {
    if (!value || value === 0) {
      return '-';
    }

    return (
      <>
        {value.toLocaleString()} <strong>{props.productData.currency}</strong>
      </>
    );
  };

  const renderType = (type: string) => {
    if (!type) {
      return (
        <Tip text={__('Unknown')} placement="left">
          <TypeBox color="#AAAEB3">
            <Icon icon="folder-2" />
          </TypeBox>
        </Tip>
      );
    }

    let space;

    if (type.includes('templateItem')) {
      space = <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</>;
    }

    if (type.includes('product')) {
      return (
        <>
          {space}
          <Tip text={__('Product')} placement="left">
            <TypeBox color="#3B85F4">
              <Icon icon="box" />
            </TypeBox>
          </Tip>
        </>
      );
    }

    return (
      <>
        {space}
        <Tip text={__('Service')} placement="left">
          <TypeBox color="#EA475D">
            <Icon icon="invoice" />
          </TypeBox>
        </Tip>
      </>
    );
  };

  const renderTemplateRow = (templateInfo: string) => {
    if (templateInfo) {
      return (
        <tr>
          <td colSpan={6}>
            <NameWrapper>{templateInfo}</NameWrapper>
          </td>
          <td>
            <RemoveRow>
              <Icon onClick={props.onRemoveTemplate} icon="times-circle" />
            </RemoveRow>
          </td>
        </tr>
      );
    }

    return null;
  };

  const {
    product,
    quantity,
    unitPrice,
    discount,
    tax,
    amount,
    uom,
    _id,
    templateId
  } = props.productData;
  const id = product ? product._id : _id;
  const changeCurrent = () => props.changeCurrentProduct(id);

  return (
    <>
      {renderTemplateRow(props.templateInfo)}
      <tr
        id={id}
        className={props.activeProduct === id ? 'active' : ''}
        onClick={changeCurrent}
      >
        <td>
          <NameWrapper>
            {renderType(
              templateId && product
                ? product.type + '_templateItem'
                : product
                ? product.type
                : ''
            )}
            {product ? product.name : __('Not selected')}
          </NameWrapper>
        </td>
        <td>
          {quantity} <strong>{uom}</strong>
        </td>
        <td>{renderAmmount(unitPrice)}</td>
        <td>{renderAmmount(discount)}</td>
        <td>{renderAmmount(tax)}</td>
        <td>{renderAmmount(amount)}</td>
        <td>
          <RemoveRow>
            <Icon onClick={props.onRemove} icon="times-circle" />
          </RemoveRow>
        </td>
      </tr>
      {props.children && (
        <tr className="active">
          <td colSpan={7}>{props.children}</td>
        </tr>
      )}
    </>
  );
}

export default ProductRow;
