import React, { useState } from 'react';
import { Description } from 'modules/settings/styles';
import { FlexItem } from 'modules/layout/styles';
import { FlexContent } from 'modules/boards/styles/item';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components/form';
import { LeftItem } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import Select from 'react-select-plus';
import { FlexItem as FlexItemContainer, Title } from './style';

import { PRODUCT_PROPERTIES, USER_FILTERS } from 'modules/bookings/constants';
import Uploader from 'modules/common/components/Uploader';
import { IAttachment } from 'modules/common/types';
import SelectProductCategory from 'modules/bookings/containers/SelectProductCategory';

type Name =
  | 'name'
  | 'image'
  | 'description'
  | 'userFilters'
  | 'propertyCategoryId';

type Props = {
  onChange: (name: Name, value: any) => void;
};

function ChooseContent({ onChange }: Props) {
  const [content, setContent] = useState({
    name: '',
    image: [] as IAttachment[],
    description: '',
    userFilters: [],

    propertyCategoryId: ''
  });

  const renderFilterSelectOptions = () => {
    return USER_FILTERS.ALL_LIST.map(el => ({
      value: el.value,
      label: el.label
    }));
  };

  const renderPropertyOptions = () => {
    return PRODUCT_PROPERTIES.ALL_LIST.map(el => ({
      value: el.value,
      label: el.label
    }));
  };

  const onChangeFunction = (key: Name, e: any) => {
    let value = e;

    if (e.target) {
      value = e.target.value;
    }

    setContent({
      ...content,
      [key]: value
    });

    onChange(key, value);
  };

  const renderGeneralSettings = () => {
    return (
      <>
        <h4>{__('General')}</h4>

        <FlexContent>
          <FlexItem>
            <FormGroup>
              <ControlLabel>Name</ControlLabel>
              <FormControl
                type="text"
                value={content.name}
                onChange={e => onChangeFunction('name', e)}
              />
            </FormGroup>
          </FlexItem>

          <FlexItem hasSpace={true}>
            <FormGroup>
              <ControlLabel>Image</ControlLabel>
              <Uploader
                defaultFileList={content.image}
                onChange={e => onChangeFunction('image', e)}
                single={true}
              />
            </FormGroup>
          </FlexItem>
        </FlexContent>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            type="text"
            value={content.description}
            onChange={e => onChangeFunction('description', e)}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>User filters</ControlLabel>
          <Select
            multi={true}
            value={content.userFilters}
            onChange={e => onChangeFunction('userFilters', e)}
            options={renderFilterSelectOptions()}
            clearable={true}
            placeholder="Choose filters"
          />
        </FormGroup>
      </>
    );
  };

  const renderDisplayBlock = () => {
    return (
      <>
        <FlexContent>
          <FlexItem count={3}>
            <FormGroup>
              <ControlLabel>Display blocks</ControlLabel>
              <Select
                options={[
                  { label: 'Horizontally', value: 'horizontally' },
                  { label: 'Vertically', value: 'vertically' }
                ].map(el => ({
                  label: el.label,
                  value: el.value
                }))}
                placeholder="Choose shape"
              />
            </FormGroup>
          </FlexItem>

          <FlexItem hasSpace={true}>
            <FormGroup>
              <ControlLabel>Columns</ControlLabel>
              <FormControl type="number" />
            </FormGroup>
          </FlexItem>

          <FlexItem hasSpace={true}>
            <FormGroup>
              <ControlLabel>Rows</ControlLabel>
              <FormControl type="number" />
            </FormGroup>
          </FlexItem>

          <FlexItem hasSpace={true}>
            <FormGroup>
              <ControlLabel>Margin</ControlLabel>
              <FormControl type="number" />
            </FormGroup>
          </FlexItem>
        </FlexContent>

        <FormGroup>
          <Title>Product Details</Title>
          <Description>
            Select properties to display in the product detail page.
          </Description>
          <Select
            multi={true}
            // value={productDetail.properties}
            options={renderPropertyOptions()}
            placeholder="Choose properties"
          />
        </FormGroup>
      </>
    );
  };

  const renderProductDetail = () => {
    return (
      <>
        <h4>{__('Products')}</h4>

        <FormGroup>
          <Title>{__('Main Product Category')}</Title>
          <Description>
            {`Select the main Product Category of the products and services you want
          to display. If you haven't created one, please go to 
          ${(
            <a href="/settings/product-service">{__('Product & Service')}</a>
          )} to
          organize your product first.`}
          </Description>
          <SelectProductCategory
            onChange={el => onChangeFunction('propertyCategoryId', el.value)}
            value={content.propertyCategoryId}
            placeholder="Choose product category"
          />
        </FormGroup>

        {renderDisplayBlock()}
      </>
    );
  };

  return (
    <FlexItemContainer>
      <LeftItem>
        {renderGeneralSettings()}
        {renderProductDetail()}
      </LeftItem>
    </FlexItemContainer>
  );
}

export default ChooseContent;
