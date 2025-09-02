import SelectProductCategory from "@erxes/ui-products/src/containers/SelectProductCategory";
import SelectProducts from "@erxes/ui-products/src/containers/SelectProducts";
import SelectTags from "@erxes/ui-tags/src/containers/SelectTags";
import {
  ControlLabel,
  FormControl,
  FormGroup,
} from "@erxes/ui/src/components/form";
import { FormColumn, FormWrapper } from "@erxes/ui/src/styles/main";
import { __ } from "@erxes/ui/src/utils/core";
import React from 'react';

type Props = {
  restrictions: any;

  onChange: (restrictions: any) => void;
};

const Form = (props: Props) => {
  const { restrictions, onChange } = props;

  const handleChange = (selectedOptions) => {
    onChange({
      ...restrictions,
      ...selectedOptions,
    });
  };

  return (
    <>
      <FormWrapper>
        <FormColumn>
          <FormGroup>
            <ControlLabel required={true}>Minimum spend</ControlLabel>
            <FormControl
              name="minimumSpend"
              type="number"
              min={0}
              value={restrictions.minimumSpend || 0}
              onChange={(e) =>
                handleChange({ minimumSpend: Number((e.target as any).value) })
              }
            />
          </FormGroup>
        </FormColumn>
        <FormColumn>
          <FormGroup>
            <ControlLabel required={true}>Maximum spend</ControlLabel>
            <FormControl
              name="maximumSpend"
              type="number"
              min={0}
              value={restrictions.maximumSpend || 0}
              onChange={(e) =>
                handleChange({ maximumSpend: Number((e.target as any).value) })
              }
            />
          </FormGroup>
        </FormColumn>
      </FormWrapper>
      <FormWrapper>
        <FormColumn>
          <FormGroup>
            <ControlLabel required={true}>Product Category</ControlLabel>
            <SelectProductCategory
              label={__("Choose product category")}
              name="categoryIds"
              initialValue={restrictions.categoryIds}
              onSelect={(categoryIds) => handleChange({ categoryIds })}
              multi={true}
            />
          </FormGroup>
        </FormColumn>
        <FormColumn>
          <FormGroup>
            <ControlLabel required={true}>
              Or Exclude Product Category
            </ControlLabel>
            <SelectProductCategory
              label={__("Choose product category")}
              name="excludeCategoryIds"
              initialValue={restrictions.excludeCategoryIds}
              onSelect={(excludeCategoryIds) =>
                handleChange({ excludeCategoryIds })
              }
              multi={true}
            />
          </FormGroup>
        </FormColumn>
      </FormWrapper>
      <FormWrapper>
        <FormColumn>
          <FormGroup>
            <ControlLabel required={true}>Product</ControlLabel>
            <SelectProducts
              label={__("Filter by products")}
              name="productIds"
              multi={true}
              initialValue={restrictions.productIds}
              onSelect={(productIds) => handleChange({ productIds })}
            />
          </FormGroup>
        </FormColumn>
        <FormColumn>
          <FormGroup>
            <ControlLabel required={true}>Or Exclude Product</ControlLabel>
            <SelectProducts
              label={__("Filter by products")}
              name="excludeProductIds"
              multi={true}
              initialValue={restrictions.excludeProductIds}
              onSelect={(excludeProductIds) =>
                handleChange({ excludeProductIds })
              }
            />
          </FormGroup>
        </FormColumn>
      </FormWrapper>
      <FormWrapper>
        <FormColumn>
          <FormGroup>
            <ControlLabel required={true}>Tag</ControlLabel>
            <SelectTags
              label={__("Filter by tag")}
              name="tagIds"
              multi={true}
              initialValue={restrictions.tagIds}
              tagsType="core:product"
              onSelect={(tagIds) => handleChange({ tagIds })}
            />
          </FormGroup>
        </FormColumn>
        <FormColumn>
          <FormGroup>
            <ControlLabel required={true}>Or Exclude Tag</ControlLabel>
            <SelectTags
              label={__("Filter by tag")}
              name="excludeTagIds"
              multi={true}
              initialValue={restrictions.excludeTagIds}
              tagsType="core:product"
              onSelect={(excludeTagIds) => handleChange({ excludeTagIds })}
            />
          </FormGroup>
        </FormColumn>
      </FormWrapper>
    </>
  );
};

export default Form;
