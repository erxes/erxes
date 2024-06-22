import { ModalFooter } from "@erxes/ui/src/styles/main";
import React, { useState } from "react";
import { Button, ControlLabel, FormControl, FormGroup } from "@erxes/ui/src";
import SelectProducts from "@erxes/ui-products/src/containers/SelectProducts";
import { IProductGroup } from "../../../types";
import SelectProductCategory from "@erxes/ui-products/src/containers/SelectProductCategory";

type Props = {
  group?: IProductGroup;
  onSubmit: (group: IProductGroup) => void;
  onDelete: (group: IProductGroup) => void;
  closeModal: () => void;
  mode: "create" | "update";
};

const GroupForm = (props: Props) => {
  const { mode, onSubmit, onDelete, closeModal } = props;

  const [group, setGroup] = useState<IProductGroup>(
    props.group || {
      _id: `temporaryId${String(Math.random())}`,
      name: "",
      description: "",
      categoryIds: [],
      excludedCategoryIds: [],
      excludedProductIds: [],
    }
  );

  const onChangeFunction = (name: any, value: any) => {
    setGroup((prevState) => ({ ...prevState, [name]: value }));
  };

  const onClicksave = () => {
    onSubmit(group);
    closeModal();
  };

  const onClickCancel = () => {
    closeModal();
  };

  const onChangeName = (e) => {
    onChangeFunction("name", (e.currentTarget as HTMLInputElement).value);
  };

  const onChangeDescription = (e) => {
    onChangeFunction(
      "description",
      (e.currentTarget as HTMLInputElement).value
    );
  };

  const onChangeCategories = (field, values) => {
    onChangeFunction(field, values);
  };

  const onChangeExcludeProducts = (values) => {
    onChangeFunction("excludedProductIds", values);
  };

  return (
    <>
      <FormGroup>
        <ControlLabel required={true}>Group Name</ControlLabel>
        <FormControl
          name="name"
          defaultValue={group.name}
          required={true}
          autoFocus={true}
          onChange={onChangeName}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>Group Description</ControlLabel>
        <FormControl
          name="description"
          componentclass="textarea"
          rows={5}
          defaultValue={group.description}
          onChange={onChangeDescription}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>Product Category</ControlLabel>
        <SelectProductCategory
          label="Choose product category"
          name="productCategoryId"
          initialValue={group.categoryIds}
          customOption={{
            value: "",
            label: "...Clear product category filter",
          }}
          onSelect={(categoryIds) =>
            onChangeCategories("categoryIds", categoryIds)
          }
          multi={true}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>Exclude Product Category</ControlLabel>
        <SelectProductCategory
          label="Choose product category"
          name="productCategoryId"
          initialValue={group.excludedCategoryIds}
          customOption={{
            value: "",
            label: "...Clear product category filter",
          }}
          onSelect={(categoryIds) =>
            onChangeCategories("excludedCategoryIds", categoryIds)
          }
          multi={true}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>Exclude Products</ControlLabel>
        <SelectProducts
          label={"exclude products"}
          name="excludeProductsIds"
          initialValue={group.excludedProductIds}
          onSelect={onChangeExcludeProducts}
          multi={true}
        />
      </FormGroup>
      <ModalFooter>
        <Button
          btnStyle="simple"
          type="button"
          icon="times-circle"
          onClick={onClickCancel}
        >
          Cancel
        </Button>

        <Button
          onClick={onClicksave}
          btnStyle="success"
          icon={mode === "update" ? "check-circle" : "plus-circle"}
        >
          {mode === "update" ? "Save" : "Add to POS"}
        </Button>
      </ModalFooter>
    </>
  );
};

export default GroupForm;
