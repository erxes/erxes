import React from 'react';
import { Description, SubHeading } from 'modules/settings/styles';
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
import { FlexItem as FlexItemContainer } from './style';
import SelectProductCategory from 'modules/bookings/containers/SelectProductCategory';
import Uploader from 'modules/common/components/Uploader';
import { BOOKING_DISPLAY_BLOCK } from 'modules/bookings/constants';

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
  | 'margin'
  | 'navigationText'
  | 'bookingFormText'
  | 'productFieldIds';

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
  navigationText?: string;
  bookingFormText?: string;
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
  margin,
  navigationText,
  bookingFormText
}: Props) {
  const onChangeSelect = (key: Name, e: any) => {
    let value = e;

    if (e && e.value) {
      value = e.value;
    }

    onChangeBooking(key, value);
  };

  const generateSelectOptions = options => {
    return options.map(option => ({
      label: option.label,
      value: option.value
    }));
  };

  const images =
    (image && delete image.__typename && extractAttachment([image])) || [];

  const renderGeneralSettings = () => {
    return (
      <>
        <FlexContent>
          <FlexItem>
            <FormGroup>
              <ControlLabel required={true}>Booking Name</ControlLabel>
              <FormControl
                type="text"
                value={name}
                onChange={(e: any) => onChangeBooking('name', e.target.value)}
              />
            </FormGroup>
          </FlexItem>
        </FlexContent>

        <FormGroup>
          <ControlLabel required={true}>Booking Description</ControlLabel>
          <FormControl
            type="text"
            value={description}
            onChange={(e: any) =>
              onChangeBooking('description', e.target.value)
            }
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Booking Image</ControlLabel>
          <Uploader
            defaultFileList={images}
            onChange={e => onChangeBooking('image', e.length ? e[0] : null)}
            multiple={false}
            single={true}
          />
        </FormGroup>
        <br />
        <SubHeading>{__('Widget Header')}</SubHeading>

        <FormGroup>
          <ControlLabel>{__('Navigation')}</ControlLabel>
          <Description>
            Type in a word to display as the navigation button text
          </Description>
          <FormControl
            type="text"
            value={navigationText}
            onChange={(e: any) =>
              onChangeBooking('navigationText', e.target.value)
            }
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
                options={generateSelectOptions(BOOKING_DISPLAY_BLOCK.ALL_LIST)}
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
        <SubHeading>{__('Products')}</SubHeading>

        <FormGroup>
          <ControlLabel required={true}>
            {__('Main Product Category')}
          </ControlLabel>
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

  const renderBookingFormText = () => {
    return (
      <>
        <FormGroup>
          <SubHeading>{__('Booking Form Button Text')}</SubHeading>
          <Description>
            Type in a word to display as the booking form button text in the
            product detail page.
          </Description>
          <FormControl
            type="text"
            value={bookingFormText}
            onChange={(e: any) =>
              onChangeBooking('bookingFormText', e.target.value)
            }
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
        {renderBookingFormText()}
      </LeftItem>
    </FlexItemContainer>
  );
}

export default ContentStep;
