import React from "react";
import { Description, SubHeading } from "@erxes/ui-settings/src/styles";
import { FlexItem } from "@erxes/ui/src/layout/styles";
import {
  FlexHeight as FlexItemContainer,
  Flex,
} from "@erxes/ui/src/styles/main";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import { LeftItem } from "@erxes/ui/src/components/step/styles";
import { extractAttachment, __ } from "coreui/utils";
import Select from "react-select-plus";
import SelectProductCategory from "../../containers/SelectProductCategory";
import Uploader from "@erxes/ui/src/components/Uploader";
import { BOOKING_DISPLAY_BLOCK } from "../../constants";
import { IField } from "@erxes/ui/src/types";
import { isEnabled } from "@erxes/ui/src/utils/core";

type Name =
  | "name"
  | "description"
  | "userFilters"
  | "productCategoryId"
  | "image"
  | "fieldsGroup"
  | "line"
  | "columns"
  | "rows"
  | "margin"
  | "navigationText"
  | "bookingFormText"
  | "productFieldIds";

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
  productFieldIds?: string[];
  productFields: IField[];
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
  bookingFormText,
  productFields,
  productFieldIds,
}: Props) {
  const onChangeSelect = (key: Name, e: any) => {
    let value = e;

    if (e && e.value) {
      value = e.value;
    }

    onChangeBooking(key, value);
  };

  const generateSelectOptions = (options) => {
    return options.map((option) => ({
      label: option.label || option.text,
      value: option.value || option._id,
    }));
  };

  const images =
    (image && delete image.__typename && extractAttachment([image])) || [];

  const renderGeneralSettings = () => {
    return (
      <>
        <Flex>
          <FlexItem>
            <FormGroup>
              <ControlLabel required={true}>Booking Name</ControlLabel>
              <FormControl
                type="text"
                value={name}
                onChange={(e: any) => onChangeBooking("name", e.target.value)}
              />
            </FormGroup>
          </FlexItem>
        </Flex>

        <FormGroup>
          <ControlLabel required={true}>Booking Description</ControlLabel>
          <FormControl
            type="text"
            value={description}
            onChange={(e: any) =>
              onChangeBooking("description", e.target.value)
            }
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Booking Image</ControlLabel>
          <Uploader
            defaultFileList={images}
            onChange={(e) => onChangeBooking("image", e.length ? e[0] : null)}
            multiple={false}
            single={true}
          />
        </FormGroup>
        <br />
        <SubHeading>{__("Widget Header")}</SubHeading>

        <FormGroup>
          <ControlLabel>{__("Navigation")}</ControlLabel>
          <Description>
            Type in a word to display as the navigation button text
          </Description>
          <FormControl
            type="text"
            value={navigationText}
            onChange={(e: any) =>
              onChangeBooking("navigationText", e.target.value)
            }
          />
        </FormGroup>
      </>
    );
  };

  const renderDisplayBlock = () => {
    return (
      <>
        <Flex>
          <FlexItem count={3}>
            <FormGroup>
              <ControlLabel>Display blocks</ControlLabel>
              <Select
                options={generateSelectOptions(BOOKING_DISPLAY_BLOCK.ALL_LIST)}
                placeholder="Choose line"
                value={line}
                onChange={(e: any) => onChangeBooking("line", e ? e.value : "")}
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
                  onChangeBooking("columns", e.target.value)
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
                onChange={(e: any) => onChangeBooking("rows", e.target.value)}
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
                onChange={(e: any) => onChangeBooking("margin", e.target.value)}
              />
            </FormGroup>
          </FlexItem>
        </Flex>
      </>
    );
  };

  const renderProductDetails = () => {
    return (
      <>
        <SubHeading>{__("Products")}</SubHeading>
        <FormGroup>
          <ControlLabel required={true}>
            {__("Main Product Category")}
          </ControlLabel>
          <Description>
            Select the main Product Category of the products and services you
            want to display. If you haven't created one, please go to
            <a href="/settings/product-service">
                {__(" Product & Service ")}
              </a>
            to organize your product first.
          </Description>
          <SelectProductCategory
            onChange={(e: any) => onChangeSelect("productCategoryId", e)}
            value={productCategoryId}
            placeholder="Choose product category"
          />
        </FormGroup>

        {renderDisplayBlock()}

        <FormGroup>
          <SubHeading>{__("Booking Form Button Text")}</SubHeading>
          <Description>
            Type in a word to display as the booking form button text in the
            product detail page.
          </Description>
          <FormControl
            type="text"
            value={bookingFormText}
            onChange={(e: any) =>
              onChangeBooking("bookingFormText", e.target.value)
            }
          />
        </FormGroup>

        <FormGroup>
          <SubHeading>{__("Product details")}</SubHeading>
          <Description>
            Select custom properties to display on the product detail page.
          </Description>
          <Select
            options={generateSelectOptions(productFields)}
            onChange={(e: any) =>
              onChangeBooking(
                "productFieldIds",
                e.map((field) => field.value)
              )
            }
            value={productFieldIds}
            multi={true}
            placeholder="Choose custom properties"
          />
        </FormGroup>
      </>
    );
  };

  return (
    <FlexItemContainer>
      <LeftItem>
        {renderGeneralSettings()}
        {renderProductDetails()}
      </LeftItem>
    </FlexItemContainer>
  );
}

export default ContentStep;
