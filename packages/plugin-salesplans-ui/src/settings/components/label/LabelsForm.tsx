import Popover from "@erxes/ui/src/components/Popover";
import React, { useEffect, useState } from "react";
import SelectProductCategory from "@erxes/ui-products/src/containers/SelectProductCategory";
import TwitterPicker from "react-color/lib/Twitter";
import { __ } from "@erxes/ui/src/utils";
import {
  Button,
  ControlLabel,
  Form as CommonForm,
  FormControl,
  FormGroup,
  Icon,
} from "@erxes/ui/src/components";
import {
  ColorPick,
  ColorPicker,
  Column,
  FormColumn,
  FormWrapper,
  LinkButton,
} from "@erxes/ui/src/styles/main";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import { ILabelRule, ISPLabel } from "../../types";
import {
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
} from "@erxes/ui/src/styles/eindex";
import { LevelOption, LevelWrapper, RemoveRow } from "../../../styles";
import { FlexContent } from "@erxes/ui/src/layout";
import { ExpandWrapper } from "@erxes/ui-settings/src/styles";
import Select from "react-select";

type Props = {
  spLabel?: ISPLabel;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const Form = (props: Props) => {
  const { spLabel, renderButton, closeModal } = props;

  const [label, setLabel] = useState(
    spLabel || {
      rules: [
        {
          id: Math.random().toString(),
          productCategoryId: "",
          multiplier: 1,
        },
      ],
    }
  );

  const generateDoc = (values: { _id?: string }) => {
    const finalValues = values;

    if (label._id) {
      finalValues._id = label._id;
    }

    return {
      ...finalValues,
      ...label,
    };
  };

  const onChangeDescription = (e) => {
    setLabel((prevLabel) => ({
      ...prevLabel,
      description: e.editor.getData(),
    }));
  };

  const onInputChange = (e) => {
    e.preventDefault();
    const value = e.target.value;
    const name = e.target.name;

    setLabel((prevLabel) => ({ ...prevLabel, [name]: value }));
  };

  const onStatusChange = (selectedStatus) => {
    setLabel((prevLabel) => ({ ...prevLabel, status: selectedStatus.value }));
  };

  const onAddRule = () => {
    const newLabel = { ...label };
    const { rules = [] } = newLabel;

    rules.push({
      id: Math.random().toString(),
      productCategoryId: "",
      multiplier: 1,
    });

    newLabel.rules = rules;
    setLabel(newLabel);
  };

  const onRemoveRule = (ruleId) => () => {
    const newLabel = { ...label };
    const { rules = [] } = newLabel;

    newLabel.rules = rules.filter((a) => a.id !== ruleId);
    setLabel(newLabel);
  };

  const renderRule = (rule: ILabelRule, formProps) => {
    const changeRule = (key, value) => {
      const newLabel = { ...label };

      rule[key] = value;
      newLabel.rules = (newLabel.rules || []).map(
        (a) => (a.id === rule.id && rule) || a
      );
      setLabel(newLabel);
    };

    const onChangeMultiplier = (e) => {
      e.preventDefault();
      const value = e.target.value;
      changeRule("multiplier", Number(value));
    };

    const onChangeProductCategory = (categoryId) => {
      changeRule("productCategoryId", categoryId);
    };

    return (
      <LevelWrapper key={rule.id}>
        <FormColumn>
          <SelectProductCategory
            label="Choose product category"
            name="productCategoryId"
            initialValue={rule.productCategoryId}
            onSelect={onChangeProductCategory}
            multi={false}
          />
        </FormColumn>

        <FormColumn>
          <FormControl
            {...formProps}
            name="multiplier"
            type="number"
            min={0}
            defaultValue={rule.multiplier || 1}
            required={true}
            onChange={onChangeMultiplier}
          />
        </FormColumn>

        <RemoveRow onClick={onRemoveRule(rule.id)}>
          <Icon icon="times" />
        </RemoveRow>
      </LevelWrapper>
    );
  };

  const renderRules = (formProps) => {
    if (label.rules?.length === 0) {
      return null;
    }

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <ControlLabel required={true}>
              {__("Product Category")}
            </ControlLabel>
          </FormColumn>
          <FormColumn>
            <ControlLabel required={true}>{__("Multiplier")}</ControlLabel>
          </FormColumn>
        </FormWrapper>
        {(label.rules || []).map((rule) => renderRule(rule, formProps))}
      </>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    const onChangeColor = (e) => {
      const newLabel = { ...label };

      newLabel.color = e.hex;
      setLabel(newLabel);
    };

    const statusOptions = ["active", "archived"].map((option) => ({
      value: option,
      label: option,
    }));

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>{__(`Title`)}</ControlLabel>
          <FormControl
            {...formProps}
            name="title"
            defaultValue={label.title}
            autoFocus={true}
            required={true}
            onChange={onInputChange}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>{__(`Effect`)}</ControlLabel>
          <FormControl
            {...formProps}
            name="effect"
            defaultValue={label.effect}
            required={true}
            onChange={onInputChange}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            {...formProps}
            componentclass="textarea"
            name="description"
            defaultValue={label.description}
            onChange={onInputChange}
          />
        </FormGroup>

        <FormWrapper>
          <FlexContent>
            <ExpandWrapper>
              <FormGroup>
                <ControlLabel>Status</ControlLabel>
                <Select
                  id="status"
                  value={statusOptions.find(
                    (o) => o.value === (label.status || "active")
                  )}
                  options={statusOptions}
                  onChange={onStatusChange}
                  // formProps={formProps}
                  isClearable={false}
                />
              </FormGroup>
            </ExpandWrapper>
            <FormGroup>
              <ControlLabel>{__("Color")}</ControlLabel>
              <div>
                <Popover
                  placement="bottom-start"
                  trigger={
                    <ColorPick>
                      <ColorPicker style={{ backgroundColor: label.color }} />
                    </ColorPick>
                  }
                >
                  <TwitterPicker
                    color={{ hex: label.color }}
                    onChange={onChangeColor}
                    triangle="hide"
                  />
                </Popover>
              </div>
            </FormGroup>
          </FlexContent>
        </FormWrapper>

        {renderRules(formProps)}

        <LevelOption>
          <LinkButton onClick={onAddRule}>
            <Icon icon="add" /> {__("Add another level")}
          </LinkButton>
        </LevelOption>

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
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: spLabel,
          })}
        </ModalFooter>
      </>
    );
  };
  return <CommonForm renderContent={renderContent} />;
};

export default Form;
