import SelectProductCategory from "@erxes/ui-products/src/containers/SelectProductCategory";
import SelectProducts from "@erxes/ui-products/src/containers/SelectProducts";
import SelectSegments from "@erxes/ui-segments/src/containers/SelectSegments";
import { GroupWrapper } from "@erxes/ui-segments/src/styles";
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Tip
} from "@erxes/ui/src/components";
import { FormColumn, FormWrapper } from "@erxes/ui/src/styles/main";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import { __ } from "@erxes/ui/src/utils";
import React from "react";
import { LittleGroup } from "../styles";
import SelectTags from "@erxes/ui-tags/src/containers/SelectTags";

type Props = {
  condition: any;
  onChange: (id: string, condition: any) => void;
  onRemove: (id: string) => void;
};

const PerConditions = (props: Props) => {
  const { condition, onChange } = props;

  const onChangeConfig = (code: string, value) => {
    onChange(condition.id, { ...condition, [code]: value });
  };

  const onChangeHandler = (name, value) => {
    onChangeConfig(name, value);
  };

  const onChangeInput = (code: string, e) => {
    onChangeConfig(code, e.target.value);
  };

  return (
    <GroupWrapper>
      <FormWrapper>
        <FormColumn>
          <FormGroup>
            <ControlLabel>{"Product Category"}</ControlLabel>
            <SelectProductCategory
              label="Choose product category"
              name="productCategoryIds"
              initialValue={condition.productCategoryIds || ""}
              onSelect={categoryIds =>
                onChangeHandler("productCategoryIds", categoryIds)
              }
              multi={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__("Exclude categories")}</ControlLabel>
            <SelectProductCategory
              name="excludeCategoryIds"
              label={__("Choose categories to exclude")}
              initialValue={condition.excludeCategoryIds}
              onSelect={categoryIds =>
                onChangeHandler("excludeCategoryIds", categoryIds)
              }
              multi={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__("Product Tags")}</ControlLabel>
            <SelectTags
              tagsType="core:product"
              label={__("Choose product tag")}
              name="productTagIds"
              initialValue={condition.productTagIds || ""}
              onSelect={tagIds => onChangeHandler("productTagIds", tagIds)}
              multi={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__("Exclude tags")}</ControlLabel>
            <SelectTags
              tagsType="core:product"
              name="excludeTagIds"
              label="Choose tags to exclude"
              initialValue={condition.excludeTagIds}
              onSelect={tagIds => onChangeHandler("excludeTagIds", tagIds)}
              multi={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__("Exclude products")}</ControlLabel>
            <SelectProducts
              name="excludeProductIds"
              label="Choose products to exclude"
              initialValue={condition.excludeProductIds}
              onSelect={productIds =>
                onChangeHandler("excludeProductIds", productIds)
              }
              multi={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__("Segment")}</ControlLabel>
            <SelectSegments
              name="segments"
              label="Choose segments"
              contentTypes={["core:product"]}
              initialValue={condition.segments}
              multi={true}
              onSelect={segmentIds => onChangeHandler("segments", segmentIds)}
            />
          </FormGroup>
        </FormColumn>

        <FormColumn>
          <FormGroup>
            <ControlLabel>{"Low Count"}</ControlLabel>
            <FormControl
              defaultValue={condition.ltCount}
              onChange={onChangeInput.bind(this, "ltCount")}
              required={true}
              autoFocus={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{"Great Count"}</ControlLabel>
            <FormControl
              defaultValue={condition.gtCount}
              onChange={onChangeInput.bind(this, "gtCount")}
              required={true}
              autoFocus={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__("Low UnitPrice")}</ControlLabel>
            <FormControl
              defaultValue={condition.ltUnitPrice}
              onChange={onChangeInput.bind(this, "ltUnitPrice")}
              required={true}
              autoFocus={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{"Great UnitPrice"}</ControlLabel>
            <FormControl
              defaultValue={condition.gtUnitPrice}
              onChange={onChangeInput.bind(this, "gtUnitPrice")}
              required={true}
              autoFocus={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{"Sub uom type"}</ControlLabel>
            <FormControl
              componentclass="select"
              defaultValue={condition.subUomType}
              options={[
                { label: "Not use", value: "" },
                { label: "Low than count", value: "lt" },
                { label: "Greater, equal than count", value: "gte" }
              ]}
              onChange={(e: any) => {
                onChangeHandler("subUomType", e.target.value);
              }}
            />
          </FormGroup>
        </FormColumn>
      </FormWrapper>
      <LittleGroup>
        <FormWrapper>
          <FormColumn>
            <ControlLabel>{"Set branch"}</ControlLabel>
            <SelectBranches
              label="Choose Branch"
              name="branchId"
              initialValue={condition.branchId}
              onSelect={branchId => onChangeHandler("branchId", branchId)}
              multi={false}
              customOption={{ value: "", label: "Clean branch" }}
            />
          </FormColumn>
          <FormColumn>
            <ControlLabel>{__("Set department")}</ControlLabel>
            <SelectDepartments
              label="Choose department"
              name="selectedDepartmentIds"
              initialValue={condition.departmentId}
              onSelect={departmentId =>
                onChangeHandler("departmentId", departmentId)
              }
              multi={false}
              customOption={{ value: "", label: "Clean department" }}
            />
          </FormColumn>
        </FormWrapper>
      </LittleGroup>
      <Tip text={"Delete"}>
        <Button
          btnStyle="simple"
          size="small"
          onClick={props.onRemove.bind(this, condition.id)}
          icon="times"
        />
      </Tip>
    </GroupWrapper>
  );
};
export default PerConditions;
