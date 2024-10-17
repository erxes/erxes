import CatProdItem from "../../components/productGroup/CatProdItem";
import GroupForm from "../../components/productGroup/GroupForm";
import React, { useState } from "react";
import { CatProd, IPos, IProductGroup } from "../../../types";
import { LeftItem } from "@erxes/ui/src/components/step/styles";
import {
  FormGroup,
  ControlLabel,
  Button,
  Icon,
  Tip,
  ModalTrigger,
  __,
  FormControl,
} from "@erxes/ui/src";
import SelectProducts from "@erxes/ui-products/src/containers/SelectProducts";
import {
  ActionButtons,
  Description,
  FlexColumn,
  FlexItem,
  Block,
  BlockRow,
} from "../../../styles";
import SelectProductCategory from "@erxes/ui-products/src/containers/SelectProductCategory";

type Props = {
  onChange: (name: "pos" | "description" | "groups", value: any) => void;
  pos: IPos;
  groups: IProductGroup[];
  catProdMappings: CatProd[];
};

type State = {
  groups: IProductGroup[];
  currentMode: "create" | "update" | undefined;
  mappings: CatProd[];
  initialCategoryIds: string[];
  kioskExcludeCategoryIds: string[];
  kioskExcludeProductIds: string[];
  isCheckRemainder: boolean;
  checkExcludeCategoryIds: string[];
  banFractions: boolean;
};

const ConfigStep = (props: Props) => {
  const { onChange, pos, groups, catProdMappings } = props;

  const [state, setState] = useState<State>({
    groups: props.groups || [],
    currentMode: undefined,
    mappings: pos && pos.catProdMappings ? pos.catProdMappings : [],
    initialCategoryIds: (pos && pos.initialCategoryIds) || [],
    kioskExcludeCategoryIds: (pos && pos.kioskExcludeCategoryIds) || [],
    kioskExcludeProductIds: (pos && pos.kioskExcludeProductIds) || [],
    isCheckRemainder: (pos && pos.isCheckRemainder) || false,
    checkExcludeCategoryIds: (pos && pos.checkExcludeCategoryIds) || [],
    banFractions: (pos && pos.banFractions) || false,
  });

  const onSubmitGroup = (group: IProductGroup) => {
    const newGroups = [...state.groups];

    const index = state.groups.findIndex((e) => e._id === group._id);

    if (index !== -1) {
      newGroups[index] = group;
    } else {
      newGroups.push(group);
    }

    onChange("groups", newGroups);
  };

  const renderGroupFormTrigger = (
    trigger: React.ReactNode,
    group?: IProductGroup
  ) => {
    const content = (props) => (
      <GroupForm {...props} group={group} onSubmit={onSubmitGroup} />
    );

    const title = group ? "Edit group" : "Add group";

    return <ModalTrigger title={title} trigger={trigger} content={content} />;
  };

  const renderEditAction = (group: IProductGroup) => {
    const trigger = (
      <Button btnStyle="link" style={{ float: "right" }}>
        <Tip text={__("Edit")} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return renderGroupFormTrigger(trigger, group);
  };

  const renderRemoveAction = (group: IProductGroup) => {
    const remove = () => {
      let newGroups = state.groups;

      newGroups = state.groups.filter((e) => e._id !== group._id);

      setState((prevState) => ({ ...prevState, groups: newGroups }));
      onChange("groups", newGroups);
    };

    return (
      <Button btnStyle="link" onClick={remove} style={{ float: "right" }}>
        <Tip text={__("Remove")} placement="bottom">
          <Icon icon="cancel-1" />
        </Tip>
      </Button>
    );
  };

  const renderGroup = (group: IProductGroup) => {
    return (
      <FormGroup key={group._id}>
        <BlockRow>
          <ControlLabel>
            {group.name}
            <Description>{group.description}</Description>
          </ControlLabel>
          <ActionButtons>
            {renderEditAction(group)}
            {renderRemoveAction(group)}
          </ActionButtons>
        </BlockRow>
      </FormGroup>
    );
  };

  const renderMapping = (mapping: CatProd, index: number) => {
    const cleanFields = (cat: CatProd) => ({
      _id: cat._id,
      categoryId: cat.categoryId,
      productId: cat.productId,
      code: cat.code || "",
      name: cat.name || "",
    });

    // for omitting react __typename field
    const mappings = state.mappings.map((m) => ({
      _id: m._id,
      categoryId: m.categoryId,
      productId: m.productId,
      code: m.code || "",
      name: m.name || "",
    }));

    const editMapping = (item: CatProd) => {
      const index = mappings.findIndex((i) => i._id === item._id);
      const cleanItem = cleanFields(item);

      if (index !== -1) {
        mappings[index] = cleanItem;
      } else {
        mappings.push(cleanItem);
      }

      setState((prevState) => ({ ...prevState, mappings }));

      onChange("pos", { ...pos, catProdMappings: mappings });
    };

    const removeMapping = (_id: string) => {
      const excluded = mappings.filter((m) => m._id !== _id);

      setState((prevState) => ({ ...prevState, mappings: excluded }));

      onChange("pos", { ...pos, catProdMappings: excluded });
    };

    return (
      <CatProdItem
        editMapping={editMapping}
        removeMapping={removeMapping}
        item={mapping}
        index={index}
        key={mapping._id}
      />
    );
  };

  const onChangeValue = (name, value) => {
    setState((prevState) => ({ ...prevState, [name]: value }));

    onChange("pos", { ...pos, [name]: value });
  };

  const groupTrigger = (
    <Button btnStyle="primary" icon="plus-circle">
      Add group
    </Button>
  );

  const onClick = () => {
    const m = state.mappings.slice();

    m.push({
      _id: Math.random().toString(),
      categoryId: "",
      productId: "",
    });

    setState((prevState) => ({ ...prevState, mappings: m }));
  };

  return (
    <FlexItem>
      <FlexColumn>
        <LeftItem>
          <Block>
            <h4>{__("Product Groups")}</h4>
            <FormGroup>{groups.map((group) => renderGroup(group))}</FormGroup>

            {renderGroupFormTrigger(groupTrigger)}
          </Block>

          <Block>
            <h4>{__("Initial product categories")}</h4>
            <Description></Description>
            <FormGroup>
              <ControlLabel>Product Category</ControlLabel>
              <SelectProductCategory
                label={__("Choose product category")}
                name="productCategoryId"
                initialValue={state.initialCategoryIds}
                customOption={{
                  value: "",
                  label: "...Clear product category filter",
                }}
                onSelect={(categoryIds) =>
                  onChangeValue("initialCategoryIds", categoryIds)
                }
                multi={true}
              />
            </FormGroup>
          </Block>

          <Block>
            <h4>{__("kiosk exclude products")}</h4>
            <FormGroup>
              <ControlLabel>Categories</ControlLabel>
              <SelectProductCategory
                label={__("kiosk")}
                name="kioskExcludeCategoryIds"
                initialValue={state.kioskExcludeCategoryIds}
                onSelect={(categoryIds) =>
                  onChangeValue("kioskExcludeCategoryIds", categoryIds)
                }
                multi={true}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Products</ControlLabel>
              <SelectProducts
                label={"kiosk"}
                name="kioskExcludeProductIds"
                initialValue={state.kioskExcludeProductIds}
                onSelect={(productIds) =>
                  onChangeValue("kioskExcludeProductIds", productIds)
                }
                multi={true}
              />
            </FormGroup>
          </Block>

          <Block>
            <h4>{__("Product & category mappings")}</h4>
            <Description>
              Map a product to category. When a product within that category is
              sold in pos system with "take" option, then the mapped product
              will be added to the price.
            </Description>
            <FormGroup>
              {state.mappings.map((item, index) => renderMapping(item, index))}
            </FormGroup>
            <Button btnStyle="primary" icon="plus-circle" onClick={onClick}>
              Add mapping
            </Button>
          </Block>

          <Block>
            <h4>{__("Remainder configs")}</h4>
            <Description></Description>
            <FormGroup>
              <FormControl
                checked={state.isCheckRemainder}
                componentclass="checkbox"
                onChange={(e) => {
                  onChangeValue("isCheckRemainder", (e.target as any).checked);
                }}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Exclude Categories</ControlLabel>
              <SelectProductCategory
                label={__("kiosk")}
                name="checkExcludeCategoryIds"
                initialValue={state.checkExcludeCategoryIds}
                onSelect={(categoryIds) =>
                  onChangeValue("checkExcludeCategoryIds", categoryIds)
                }
                multi={true}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Ban Fractions</ControlLabel>
              <FormControl
                checked={state.banFractions}
                componentclass="checkbox"
                onChange={(e) => {
                  onChangeValue("banFractions", (e.target as any).checked);
                }}
              />
            </FormGroup>
          </Block>
        </LeftItem>
      </FlexColumn>
    </FlexItem>
  );
};

export default ConfigStep;
