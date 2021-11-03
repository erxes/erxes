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

import SelectProductCategory from 'modules/bookings/containers/SelectProductCategory';
import Uploader from 'modules/common/components/Uploader';

type Name =
  | 'name'
  | 'description'
  | 'userFilters'
  | 'productCategoryId'
  | 'image'
  | 'fieldsGroup'
  | 'line'
  | 'columns'
  | 'rows'
  | 'margin';

type Props = {
  onChangeBooking: (name: Name, value: any) => void;
  name: string;
  description: string;
  userFilters: string[];
  productCategoryId: string;
  image: any;
  line?: string;
  columns?: number;
  rows?: number;
  margin?: number;
};

function ContentStep({
  onChangeBooking,
  name,
  description,
  productCategoryId,
  image,
  line,
  columns,
  rows,
  margin
}: Props) {
  const onChangeSelect = (key: Name, e: any) => {
    let value = e;

    if (e && e.value) {
      value = e.value;
    }

    onChangeBooking(key, value);
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
                onChange={(e: any) => onChangeBooking('name', e.target.value)}
              />
            </FormGroup>
          </FlexItem>
        </FlexContent>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            type="text"
            value={description}
            onChange={(e: any) =>
              onChangeBooking('description', e.target.value)
            }
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Image</ControlLabel>
          <Uploader
            defaultFileList={images}
            onChange={e => onChangeBooking('image', e.length ? e[0] : null)}
            multiple={false}
            single={true}
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
                placeholder="Choose line"
                value={line}
                onChange={(e: any) => onChangeBooking('line', e ? e.value : '')}
              />
            </FormGroup>
          </FlexItem>

          <FlexItem hasSpace={true}>
            <FormGroup>
              <ControlLabel>Columns</ControlLabel>
              <FormControl
                type="number"
                min={0}
                value={columns}
                onChange={(e: any) =>
                  onChangeBooking('columns', e.target.value)
                }
              />
            </FormGroup>
          </FlexItem>

          <FlexItem hasSpace={true}>
            <FormGroup>
              <ControlLabel>Rows</ControlLabel>
              <FormControl
                type="number"
                min={0}
                value={rows}
                onChange={(e: any) => onChangeBooking('rows', e.target.value)}
              />
            </FormGroup>
          </FlexItem>

          <FlexItem hasSpace={true}>
            <FormGroup>
              <ControlLabel>Margin</ControlLabel>
              <FormControl
                type="number"
                min={0}
                value={margin}
                onChange={(e: any) => onChangeBooking('margin', e.target.value)}
              />
            </FormGroup>
          </FlexItem>
        </FlexContent>
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
      </>
    );
  };

  return (
    <FlexItemContainer>
      <LeftItem>
        {renderGeneralSettings()}
        {renderProductDetail()}
        {renderDisplayBlock()}
      </LeftItem>
    </FlexItemContainer>
  );
}

export default ContentStep;
