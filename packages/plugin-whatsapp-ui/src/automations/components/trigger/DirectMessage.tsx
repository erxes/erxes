import { DrawerDetail } from "@erxes/ui-automations/src/styles";
import Button from "@erxes/ui/src/components/Button";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import Icon from "@erxes/ui/src/components/Icon";
import { __ } from "@erxes/ui/src/utils/core";
import colors from "@erxes/ui/src/styles/colors";
import typography from "@erxes/ui/src/styles/typography";
import { FlexRow } from "@erxes/ui/src/components/filterableList/styles";
import { Column } from "@erxes/ui/src/styles/main";
import React, { useState } from "react";
import Select from "react-select";
import styled from "styled-components";
import { ConditionsContainer } from "../../styles";

export const CustomChip = styled.span`
  color: ${colors.colorCoreBlack};
  background: ${colors.colorWhite};
  border: 1px solid ${colors.colorShadowGray}
  padding: 2px 10px;
  margin: 2px 5px 2px 0;
  display: inline-block;
  border-radius: 11px;
  position: relative;
  line-height: 18px;

  > p {
    margin: 0;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    font-weight:${typography.fontWeightMedium}
    margin:10px;
    gap:20px;

    > i {
      cursor: pointer
      
    }
  }
`;

const CondtionContainer = styled.div`
  display: grid;
  grid-template-columns: 92% 5%;
  gap:10px;
  opacity: 1;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }

  > i {
    opacity:0
    transition: opacity 0.3s ease;
    cursor: pointer;

      &:hover {
        opacity:1
      }
  }

  &:hover > i {
    opacity: 1;
    cursor: pointer;
  }

`;

export const OPERATOR_TYPES = [
  { label: "Is Equal to", value: "isEqual" },
  { label: "Is Contains", value: "isContains" },
  { label: "Is Every keywords includes", value: "every" },
  { label: "Is Some keywords includes", value: "some" },
  { label: "Start with", value: "startWith" },
  { label: "End with", value: "endWith" },
];

type Condtion = {
  _id: string;
  keywords: { _id: string; text: string; isEditable?: boolean }[];
  operator: string;
};

type Props = {
  conditions: Condtion[];
  onChange: (name: string, value: Condtion[]) => void;
  label: string;
};

export default function DirectMessageForm({
  conditions: propCondtions,
  onChange,
  label,
}: Props) {
  const [conditions, setConditions] = useState(propCondtions || []);

  const handleChangeCondtions = (conditions) => {
    onChange("conditions", conditions);
    setConditions(conditions);
  };

  const addCondition = () =>
    handleChangeCondtions([
      ...conditions,
      { _id: Math.random().toString(), operator: "", keywords: [] },
    ]);

  const onChangeCondition = (_id: string, name: string, value: any) =>
    handleChangeCondtions(
      conditions.map((condition) =>
        condition._id === _id ? { ...condition, [name]: value } : condition
      )
    );

  const removeCondition = (_id: string) =>
    handleChangeCondtions(
      conditions.filter((condition) => condition._id !== _id)
    );

  const renderCondition = ({ _id, operator, keywords = [] }: Condtion) => {
    const handleKeyPress = (e, keywords) => {
      if (e.key === "Enter") {
        onChangeCondition(_id, "keywords", [
          ...keywords,
          { _id: Math.random().toString(), text: e.currentTarget.value },
        ]);

        e.currentTarget.value = "";
      }
    };

    const clearKeyword = (_id: string) => {
      onChangeCondition(
        _id,
        "keywords",
        keywords.filter((keyword) => keyword._id !== _id)
      );
    };

    const onDoubleClick = (keywordId) => {
      onChangeCondition(
        _id,
        "keywords",
        keywords.map((keyword) =>
          keyword._id === keywordId ? { ...keyword, isEditable: true } : keyword
        )
      );
    };

    const onChangeKeyword = (e) => {
      const { id, value } = e.currentTarget as HTMLInputElement;

      onChangeCondition(
        _id,
        "keywords",
        keywords.map((keyword) =>
          keyword._id === id ? { ...keyword, text: value } : keyword
        )
      );
    };

    const onEnterKeyword = (e) => {
      if (e.key === "Enter") {
        const { id } = e.currentTarget as HTMLInputElement;
        onChangeCondition(
          _id,
          "keywords",
          keywords.map((keyword) =>
            keyword._id === id ? { ...keyword, isEditable: false } : keyword
          )
        );
      }
    };

    return (
      <CondtionContainer>
        <DrawerDetail key={_id}>
          <FormGroup>
            <ControlLabel>{__(label || "Message")}</ControlLabel>
            <Select
              value={OPERATOR_TYPES.find((o) => o.value === operator)}
              onChange={({ value }: any) =>
                onChangeCondition(_id, "operator", value)
              }
              isClearable={true}
              options={OPERATOR_TYPES}
            />
          </FormGroup>
          <Column>
            <ControlLabel>{__("Keywords")}</ControlLabel>
            <div>
              {keywords.map(({ _id, text, isEditable }) => (
                <CustomChip key={_id} onClick={() => clearKeyword(_id)}>
                  {isEditable ? (
                    <FormControl
                      id={_id}
                      defaultValue={text}
                      onKeyPress={onEnterKeyword}
                      onChange={onChangeKeyword}
                    />
                  ) : (
                    <p onDoubleClick={() => onDoubleClick(_id)}>
                      {text} <Icon icon="times" />
                    </p>
                  )}
                </CustomChip>
              ))}
              <CustomChip>
                <FormControl
                  placeholder={__("+ add keyword")}
                  onKeyPress={(e: any) => handleKeyPress(e, keywords)}
                />
              </CustomChip>
            </div>
          </Column>
        </DrawerDetail>
        <Icon icon="times" onClick={() => removeCondition(_id)} />
      </CondtionContainer>
    );
  };

  return (
    <>
      <FlexRow>
        <ControlLabel>{__("Conditions")}</ControlLabel>
        <Button
          size="small"
          onClick={addCondition}
          icon="plus-1"
          btnStyle="simple"
        >
          {__("Add Conditions")}
        </Button>
      </FlexRow>
      <ConditionsContainer>
        {conditions.map((condition) => renderCondition(condition))}
      </ConditionsContainer>
    </>
  );
}
