import {
  ControlLabel,
  FormControl,
  FormGroup,
} from "@erxes/ui/src/components/form";
import React, { useEffect, useState } from "react";

import { Attributes } from "../styles";
import Button from "@erxes/ui/src/components/Button";
import { FieldsCombinedByType } from "@erxes/ui-forms/src/settings/properties/types";
import Icon from "@erxes/ui/src/components/Icon";
import PlaceHolderInput from "./PlaceHolderInput";
import Popover from "@erxes/ui/src/components/Popover";
import { __ } from "@erxes/ui/src/utils";

type Props = {
  triggerType: string;
  triggerConfig?: any;
  config: any;
  label: string;
  attributions: Array<
    { excludeAttr?: boolean; callback?: () => void } & FieldsCombinedByType
  >;
  onSelect: (config: any) => void;
  withDefaultValue?: boolean;
};

const renderFields = (
  { triggerType, triggerConfig, config, onSelect }: Props,
  {
    fields,
    setFields,
  }: {
    fields: Array<
      { excludeAttr?: boolean; callback?: () => void } & FieldsCombinedByType
    >;
    setFields: any;
  }
) => {
  const removeField = ({ _id, name }) => {
    setFields(fields.filter((field) => field._id !== _id));

    onSelect({ ...config, [name]: undefined });
  };

  return fields.map((field) => (
    <PlaceHolderInput
      key={field._id}
      inputName={field.name}
      label={field.label}
      config={config}
      excludeAttr={field.excludeAttr}
      onChange={onSelect}
      triggerType={triggerType}
      fieldType={field.type === "Date" ? "date" : field.type}
      options={field.selectOptions || []}
      optionsAllowedTypes={["contact"]}
      triggerConfig={triggerConfig}
      attrWithSegmentConfig={!!triggerConfig}
      isMulti={true}
      additionalContent={
        <Button
          btnStyle="danger"
          size="small"
          onClick={removeField.bind(this, field)}
        >
          <Icon icon="cancel-1" />
        </Button>
      }
    />
  ));
};

const SelectFields = (props: Props) => {
  let {
    attributions = [],
    onSelect,
    config = {},
    withDefaultValue,
    label,
  } = props;

  const [fields, setFields] = useState([] as typeof attributions);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const selectedFields = attributions.filter((attribution) =>
      Object.keys(config).includes(attribution.name)
    );

    if (selectedFields.length) {
      setFields(selectedFields);
    }
  }, []);

  const onClickField = (item, close: () => void) => {
    item?.callback && item?.callback();

    setFields([...fields, item]);

    withDefaultValue &&
      onSelect({ ...config, [item.name]: `{{ ${item.name} }}` });

    close();
  };

  const onSearch = (e) => {
    const { value } = e.currentTarget as HTMLInputElement;

    setSearchValue(value);
  };

  if (searchValue) {
    attributions = attributions.filter((option) =>
      new RegExp(searchValue, "i").test(option.label)
    );
  }
  return (
    <>
      {renderFields(props, { fields, setFields })}
      <Popover
        closeAfterSelect
        trigger={
          <Button btnStyle="simple" block icon="add">
            {__(label || "")}
          </Button>
        }
        placement="top"
      >
        {(close: () => void) => {
          return (
            <Attributes>
              <React.Fragment>
                <FormGroup>
                  <ControlLabel>{__("Search")}</ControlLabel>
                  <FormControl
                    placeholder="type a search"
                    onChange={onSearch}
                  />
                </FormGroup>
                <li>
                  <b>{__("Fields")}</b>
                </li>
                {attributions
                  .filter(
                    (attribution) =>
                      !fields.find((field) => field._id === attribution._id)
                  )
                  .map((item) => (
                    <li
                      key={item.name}
                      onClick={() => onClickField(item, close)}
                    >
                      {__(item.label)}
                    </li>
                  ))}
              </React.Fragment>
            </Attributes>
          );
        }}
      </Popover>
    </>
  );
};

export default SelectFields;
