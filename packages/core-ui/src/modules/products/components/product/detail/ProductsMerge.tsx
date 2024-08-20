import Button from '@erxes/ui/src/components/Button';
import { SmallLoader } from '@erxes/ui/src/components/ButtonMutate';
import Icon from '@erxes/ui/src/components/Icon';
import { Column, Columns, Title } from '@erxes/ui/src/styles/chooser';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import { PRODUCT_INFO } from '@erxes/ui-products/src/constants';
import { InfoDetail } from '../../../styles';
import { Info, InfoTitle } from '@erxes/ui/src/styles/main';
import { IProduct, IProductDoc } from '../../../types';

type Props = {
  objects: IProduct[];
  mergeProductLoading: boolean;
  save: (doc: { ids: string[]; data: any; callback: () => void }) => void;
  closeModal: () => void;
};

const ProductsMerge: React.FC<Props> = (props) => {
  const [initialSelectedValues, setInitialSelectedValues] = useState({} as any);
  const { objects, save, closeModal, mergeProductLoading } = props;

  const saveHandler = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedValues = { ...initialSelectedValues };

    if (selectedValues.category) {
      selectedValues.categoryId = selectedValues.category._id;
    }

    if (selectedValues.vendor) {
      selectedValues.vendorId = selectedValues.vendor._id;
    }

    save({
      ids: objects.map((product) => product._id),
      data: { ...selectedValues },
      callback: () => {
        closeModal();
      },
    });
  };

  const handleChange = (type: string, key: string, value: string) => {
    const selectedValues = { ...initialSelectedValues };

    if (type === 'plus-1') {
      selectedValues[key] = value;

      if (key === 'links') {
        const links = Object.assign({ ...initialSelectedValues.links }, value);
        selectedValues[key] = links;
      }
    } else {
      delete selectedValues[key];
    }

    setInitialSelectedValues(selectedValues);
  };

  const renderProduct = (product: IProductDoc, icon: string) => {
    const properties = PRODUCT_INFO.ALL;

    return (
      <React.Fragment>
        <Title>{product.name}</Title>
        <ul>
          {properties.map((info) => {
            const key = info.field;

            if (!product[key]) {
              return null;
            }

            return renderProductProperties(key, product[key], icon);
          })}
        </ul>
      </React.Fragment>
    );
  };

  const renderProductProperties = (
    key: string,
    value: string,
    icon: string,
  ) => {
    return (
      <li key={key} onClick={handleChange.bind(this, icon, key, value)}>
        {renderTitle(key)}
        {renderValue(key, value)}
        <Icon icon={icon} />
      </li>
    );
  };

  const renderTitle = (key: string) => {
    const title = PRODUCT_INFO[key];

    return <InfoTitle>{title}:</InfoTitle>;
  };

  const renderValue = (field: string, value: any) => {
    switch (field) {
      case 'category':
        return renderCategoryInfo(value);

      case 'vendor':
        return renderVendorInfo(value);

      default:
        return <InfoDetail>{value}</InfoDetail>;
    }
  };

  const renderCategoryInfo = (value) => {
    return (
      <Info>
        <InfoTitle>{__('Name')}: </InfoTitle>
        <InfoDetail>{value.name}</InfoDetail>
      </Info>
    );
  };

  const renderVendorInfo = (value) => {
    return (
      <Info>
        <InfoTitle>{__('Info')}: </InfoTitle>
        <InfoDetail>
          {value.primaryName ||
            value.primaryEmail ||
            value.primaryPhone ||
            value.code}
        </InfoDetail>
      </Info>
    );
  };

  const [product1, product2] = objects;

  return (
    <form onSubmit={saveHandler}>
      <Columns>
        <Column className="multiple">
          {renderProduct(product1, 'plus-1')}
        </Column>

        <Column className="multiple">
          {renderProduct(product2, 'plus-1')}
        </Column>

        <Column>{renderProduct(initialSelectedValues, 'times')}</Column>
      </Columns>

      <ModalFooter>
        <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
          Cancel
        </Button>
        <Button
          type="submit"
          btnStyle="success"
          icon={mergeProductLoading ? undefined : 'check-circle'}
          disabled={mergeProductLoading}
        >
          {mergeProductLoading && <SmallLoader />}
          Save
        </Button>
      </ModalFooter>
    </form>
  );
};

export default ProductsMerge;
