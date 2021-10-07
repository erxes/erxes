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
import { extractAttachment, __ } from 'modules/common/utils';
import Select from 'react-select-plus';
import { FlexItem as FlexItemContainer, Title } from './style';

import SelectProductCategory from 'modules/bookings/containers/SelectProductCategory';
import Uploader from 'modules/common/components/Uploader';
import SelectFieldsGroup from 'modules/bookings/containers/SelectFieldsGroup';

type Name =
  | 'name'
  | 'description'
  | 'userFilters'
  | 'productCategoryId'
  | 'image'
  | 'fieldsGroup';

type Props = {
  onChange: (name: Name, value: any) => void;
  name: string;
  description: string;
  userFilters: string[];
  productCategoryId: string;
  image: any;
  fieldsGroup: string;
};

function ChooseContent({
  onChange,
  name,
  description,
  userFilters,
  productCategoryId,
  image,
  fieldsGroup
}: Props) {
  const [activeGroup, setActiveGroup] = useState([] as any);

  const onChangeFieldsGroup = (e: any) => {
    onChangeSelect('fieldsGroup', e);

    if (e && e.value) {
      return setActiveGroup(e.fields);
    }

    return setActiveGroup([]);
  };

  const onChangeSelect = (key: Name, e: any) => {
    let value = e;

    if (e && e.value) {
      value = e.value;
    }

    onChange(key, value);
  };

  const images =
    (image && delete image.__typename && extractAttachment([image])) || [];

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
                value={name}
                onChange={(e: any) => onChange('name', e.target.value)}
              />
            </FormGroup>
          </FlexItem>
        </FlexContent>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            type="text"
            value={description}
            onChange={(e: any) => onChange('description', e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Image</ControlLabel>
          <Uploader
            defaultFileList={images}
            onChange={e => onChange('image', e.length ? e[0] : null)}
            multiple={false}
            single={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Fields Groups</ControlLabel>
          <SelectFieldsGroup
            value={fieldsGroup}
            onChange={(e: any) => onChangeFieldsGroup(e)}
            placeholder="Choose a field groups"
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>User filters</ControlLabel>
          <Select
            multi={true}
            value={userFilters}
            onChange={(e: any) =>
              onChange('userFilters', e.map(el => el.value) || [])
            }
            options={activeGroup.map(el => ({
              value: el._id,
              label: el.text
            }))}
            clearable={true}
            placeholder="Choose filters"
          />
        </FormGroup>
      </>
    );
  };

  // const renderDisplayBlock = () => {
  //   return (
  //     <>
  //       <FlexContent>
  //         <FlexItem count={3}>
  //           <FormGroup>
  //             <ControlLabel>Display blocks</ControlLabel>
  //             <Select
  //               options={[
  //                 { label: 'Horizontally', value: 'horizontally' },
  //                 { label: 'Vertically', value: 'vertically' }
  //               ].map(el => ({
  //                 label: el.label,
  //                 value: el.value
  //               }))}
  //               placeholder="Choose shape"
  //             />
  //           </FormGroup>
  //         </FlexItem>

  //         <FlexItem hasSpace={true}>
  //           <FormGroup>
  //             <ControlLabel>Columns</ControlLabel>
  //             <FormControl type="number" />
  //           </FormGroup>
  //         </FlexItem>

  //         <FlexItem hasSpace={true}>
  //           <FormGroup>
  //             <ControlLabel>Rows</ControlLabel>
  //             <FormControl type="number" />
  //           </FormGroup>
  //         </FlexItem>

  //         <FlexItem hasSpace={true}>
  //           <FormGroup>
  //             <ControlLabel>Margin</ControlLabel>
  //             <FormControl type="number" />
  //           </FormGroup>
  //         </FlexItem>
  //       </FlexContent>

  //       <FormGroup>
  //         <Title>Product Details</Title>
  //         <Description>
  //           Select properties to display in the product detail page.
  //         </Description>
  //         <Select
  //           multi={true}
  //           // value={productDetail.properties}
  //           options={PRODUCT_PROPERTIES.ALL_LIST.map(el => ({
  //             value: el.value,
  //             label: el.label
  //           }))}
  //           placeholder="Choose properties"
  //         />
  //       </FormGroup>
  //     </>
  //   );
  // };

  const renderProductDetail = () => {
    return (
      <>
        <h4>{__('Products')}</h4>

        <FormGroup>
          <Title>{__('Main Product Category')}</Title>
          <Description>
            Select the main Product Category of the products and services you
            want to display. If you haven't created one, please go to
            <a href="/settings/product-service">{__(' Product & Service ')}</a>
            to organize your product first.
          </Description>
          <SelectProductCategory
            onChange={(e: any) => onChangeSelect('productCategoryId', e)}
            value={productCategoryId}
            placeholder="Choose product category"
          />
        </FormGroup>

        {/* {renderDisplayBlock()} */}
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
