import {
  FormColumn,
  FormWrapper,
  ModalFooter
} from "@erxes/ui/src/styles/main";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";

import ActionButtons from "@erxes/ui/src/components/ActionButtons";
import Button from "@erxes/ui/src/components/Button";
import CommonForm from "@erxes/ui/src/components/form/Form";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import {
  IBundleCondition,
  IBundleRule,
  IBundleRuleItem,
  IProduct
} from "@erxes/ui-products/src/types";
import Icon from "@erxes/ui/src/components/Icon";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import { ProductButton } from "@erxes/ui-sales/src/deals/styles";
import ProductChooser from "@erxes/ui-products/src/containers/ProductChooser";
import React, { useState } from "react";
import Tip from "@erxes/ui/src/components/Tip";
import { __ } from "@erxes/ui/src/utils";
import { CollapseContent } from "@erxes/ui/src";
import Select from "react-select";

const PRICE_TYPE = {
  "": null,
  thisProductPricePercent: "thisProductPricePercent",
  mainPricePercent: "mainPricePercent",
  price: "price"
};

const PRICE_ADJUST_TYPE = {
  none: "none",
  default: "default",
  round: "round",
  floor: "floor",
  ceil: "ceil",
  endsWith9: "endsWith9"
};

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  bundleRule: IBundleRule;
  bundleConditions: IBundleCondition[];
};

export default function FormRule(props: Props) {
  const [rules, setRules] = useState(props?.bundleRule?.rules || []);
  const [name, setName] = useState(props.bundleRule?.name);
  const [description, setDescription] = useState(props.bundleRule?.description);
  const [code, setCode] = useState(props.bundleRule?.code);

  const generateDoc = (values: { _id?: string }) => {
    const { bundleRule } = props;
    const finalValues = values;

    if (bundleRule) {
      finalValues._id = bundleRule._id;
    }
    const converted = rules.map(({ products, __typename, ...rest }) => ({
      ...rest,
      productIds: products?.map(p => p._id) || [],
      // priceAdjustFactor: Number(rest.priceAdjustFactor) || 0,
      priceValue: Number(rest.priceValue) || 0,
      percent: Number(rest.percent) || 0,
      quantity: Number(rest.quantity) || 0,
      allowSkip: rest.allowSkip || false
    }));

    return {
      ...finalValues,
      rules: converted
    };
  };

  const renderProductServiceTrigger = (products: IProduct[]) => {
    let content = (
      <div style={{ overflow: "hidden", lineClamp: 1, WebkitLineClamp: 1 }}>
        {products
          ? products.map(x => x.name).join(",")
          : __("Choose Product & service ")}{" "}
        <Icon icon="caret-down" />
      </div>
    );

    return <ProductButton>{content}</ProductButton>;
  };

  const renderProductModal = (products: IProduct[], setValue: any) => {
    const productOnChange = (products: IProduct[]) => {
      setValue(products);
    };

    const content = props => (
      <ProductChooser
        {...props}
        onSelect={productOnChange}
        data={{
          name: "Product",
          products: products || []
        }}
        limit={10}
      />
    );

    return (
      <ModalTrigger
        title={__("Choose product & service")}
        trigger={renderProductServiceTrigger(products)}
        size="lg"
        content={content}
      />
    );
  };

  const renderProductsGroup = (rule: IBundleRuleItem, index: number) => {
    const options = props.bundleConditions?.map(item => ({
      value: item.code,
      label: item.code
    }));
    const existed = options?.find(d => d.value === rule.code);
    if (!existed && options) {
      options.push({ value: rule.code, label: rule.code });
    }
    return (
      <CollapseContent title={rule && rule.code ? rule.code : "Add new"}>
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              right: "0px",
              top: "0px"
            }}
          ></div>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>Code</ControlLabel>
                <Select
                  placeholder={"select code"}
                  value={{ value: rule.code, label: rule.code }}
                  onChange={v => {
                    setBundleRuleItem({ ...rule, code: v?.value || "" }, index);
                  }}
                  options={options}
                  // multi={false}
                />
                {/* <FormControl
                  name="type"
                  componentclass="text"
                  defaultValue={rule.code}
                  required={true}
                  onChange={(e: any) => {
                    e.target?.value || "";
                    setBundleRuleItem(
                      { ...rule, code: e.target?.value || "" },
                      index
                    );
                  }}
                ></FormControl> */}
              </FormGroup>
            </FormColumn>
          </FormWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>Products:</ControlLabel>
                {renderProductModal(rule.products, value => {
                  setBundleRuleItem({ ...rule, products: value || [] }, index);
                })}
              </FormGroup>
            </FormColumn>
          </FormWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>Price Type</ControlLabel>
                <FormControl
                  name="type"
                  componentclass="select"
                  required={true}
                  defaultValue={rule.priceType}
                  onChange={(e: any) => {
                    setBundleRuleItem(
                      { ...rule, priceType: e.target?.value || "" },
                      index
                    );
                  }}
                >
                  {Object.keys(PRICE_TYPE).map(value => (
                    <option key={value} value={value}>
                      {PRICE_TYPE[value]}
                    </option>
                  ))}
                </FormControl>
              </FormGroup>
            </FormColumn>
          </FormWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>Price Adjust Type</ControlLabel>
                <FormControl
                  name="type"
                  componentclass="select"
                  required={true}
                  defaultValue={rule.priceAdjustType}
                  onChange={(e: any) => {
                    setBundleRuleItem(
                      { ...rule, priceAdjustType: e.target?.value || "" },
                      index
                    );
                  }}
                >
                  {Object.keys(PRICE_ADJUST_TYPE).map(value => (
                    <option key={value} value={value}>
                      {PRICE_ADJUST_TYPE[value]}
                    </option>
                  ))}
                </FormControl>
              </FormGroup>
            </FormColumn>
          </FormWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>price Adjust Factor</ControlLabel>
                <FormControl
                  name="type"
                  type="number"
                  componentclass="input"
                  defaultValue={rule.priceAdjustFactor}
                  required={true}
                  onChange={(e: any) => {
                    setBundleRuleItem(
                      { ...rule, priceAdjustFactor: e.target?.value || "" },
                      index
                    );
                  }}
                ></FormControl>
              </FormGroup>
            </FormColumn>
          </FormWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>Quantity</ControlLabel>
                <FormControl
                  name="type"
                  componentclass="text"
                  type="number"
                  defaultValue={rule.quantity}
                  required={true}
                  onChange={(e: any) => {
                    setBundleRuleItem(
                      { ...rule, quantity: e.target?.value || "" },
                      index
                    );
                  }}
                ></FormControl>
              </FormGroup>
            </FormColumn>
            {rule.priceType === "price" && (
              <FormColumn>
                <FormGroup>
                  <ControlLabel required={true}>Price Value</ControlLabel>
                  <FormControl
                    name="type"
                    type="number"
                    componentclass="text"
                    defaultValue={rule.priceValue}
                    required={true}
                    onChange={(e: any) => {
                      setBundleRuleItem(
                        { ...rule, priceValue: e.target?.value || "" },
                        index
                      );
                    }}
                  ></FormControl>
                </FormGroup>
              </FormColumn>
            )}
            {rule.priceType !== "price" && (
              <FormColumn>
                <FormGroup>
                  <ControlLabel required={true}>Percent</ControlLabel>
                  <FormControl
                    name="type"
                    type="number"
                    componentclass="text"
                    defaultValue={rule.percent}
                    required={true}
                    onChange={(e: any) => {
                      setBundleRuleItem(
                        { ...rule, percent: e.target?.value || "" },
                        index
                      );
                    }}
                  ></FormControl>
                </FormGroup>
              </FormColumn>
            )}
          </FormWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={false}>Allow Skip</ControlLabel>
                <FormControl
                  name="type"
                  type="boolean"
                  componentclass="checkbox"
                  checked={rule.allowSkip}
                  required={false}
                  onChange={(e: any) => {
                    setBundleRuleItem(
                      { ...rule, allowSkip: e.target?.value === "on" },
                      index
                    );
                  }}
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>
          <ActionButtons>
            <Tip text="Delete" placement="top">
              <Button
                btnStyle="link"
                onClick={() => {
                  let replica = [...rules];
                  replica.splice(index, 1);
                  setRules(replica);
                }}
                icon="times-circle"
              >
                Delete
              </Button>
            </Tip>
          </ActionButtons>
        </div>
      </CollapseContent>
    );
  };
  const setBundleRuleItem = (rule: IBundleRuleItem, index: number) => {
    const replica = [...rules];
    replica[index] = rule;
    setRules(replica);
  };
  const renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal } = props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Name</ControlLabel>
              <FormControl
                {...formProps}
                name="name"
                defaultValue={name}
                autoFocus={true}
                onChange={(e: any) => {
                  setName(e.target?.value);
                }}
                required={true}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={false}>Code</ControlLabel>
              <FormControl
                {...formProps}
                onChange={(e: any) => {
                  setCode(e.target?.value);
                }}
                name="code"
                defaultValue={code}
                required={false}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>

        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={false}>Description</ControlLabel>
              <FormControl
                {...formProps}
                name="description"
                componentclass="textarea"
                defaultValue={description}
                required={false}
                onChange={(e: any) => {
                  setDescription(e.target?.value);
                }}
              ></FormControl>
            </FormGroup>
          </FormColumn>
        </FormWrapper>
        {rules?.map((rule, index) => renderProductsGroup(rule, index))}
        <Button
          btnStyle="simple"
          onClick={() => {
            const newAdded = [...rules, {} as any];
            setRules(newAdded);
          }}
          icon="plus-circle"
          uppercase={false}
        >
          Add Row
        </Button>
        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Close
          </Button>

          {renderButton({
            name: props.bundleRule?.name || "",
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: props.bundleRule
          })}
        </ModalFooter>
      </>
    );
  };
  return <CommonForm renderContent={renderContent} />;
}
