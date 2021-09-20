import React from 'react';
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

import { USER_FILTERS } from 'modules/bookings/constants';
import Uploader from 'modules/common/components/Uploader';
import SelectProductCategory from 'modules/bookings/containers/SelectProductCategory';
import { IAttachment } from 'modules/common/types';

type Name =
  | 'name'
  | 'image'
  | 'description'
  | 'userFilters'
  | 'productCategoryId';

type Props = {
  onChange: (name: Name, value: any) => void;
  name: string;
  description: string;
  image: IAttachment;
  userFilters: string[];
  productCategoryId: string;
};

function ChooseContent({
  onChange,
  name,
  description,
  image,
  userFilters,
  productCategoryId
}: Props) {
  const attachment = (image && extractAttachment([image])) || [];

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

          <FlexItem hasSpace={true}>
            <FormGroup>
              <ControlLabel>Image</ControlLabel>
              <Uploader
                defaultFileList={attachment}
                onChange={(e: IAttachment[]) =>
                  onChange('image', e.length ? e[0] : null)
                }
                multiple={false}
                single={true}
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
          <ControlLabel>User filters</ControlLabel>
          <Select
            multi={true}
            value={userFilters}
            onChange={(e: any) => onChange('userFilters', e)}
            options={USER_FILTERS.ALL_LIST.map(el => ({
              value: el.value,
              label: el.label
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
            {`Select the main Product Category of the products and services you want
          to display. If you haven't created one, please go to 
          ${(
            <a href="/settings/product-service">{__('Product & Service')}</a>
          )} to
          organize your product first.`}
          </Description>
          <SelectProductCategory
            onChange={(el: any) => onChange('productCategoryId', el.value)}
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
