import React, { useState, useMemo, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import { components } from "react-select";
import { DEFAULT_LABELS } from "core/src/data/constants";
import Button from "@erxes/ui/src/components/Button";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import styled from 'styled-components';
import {
  FlexCenter,
  FormColumn,
  FormWrapper,
  AttachmentContainer
} from '@erxes/ui/src/styles/main';

type Email = {
  type: string;
  email: string;
};

type Label = {
  name: string;
  forType: string;
  type: string;
};

type Props = {
  emails: Email[];
  onChange: (emails: Email[]) => void;
  labels?: Label[];
};

const EmailEntry = styled(FlexCenter)`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

const SelectContainer = styled(FormColumn)`
  max-width: 150px;
`;

const InputContainer = styled(FormColumn)`
  flex: 1;
`;

const EditableEmailList = ({ emails, onChange, labels }: Props) => {
  const defaultEmailLabels = useMemo(
    () =>
      (labels || DEFAULT_LABELS.email).map((item) => ({
        value: item.name,
        label: item.name.charAt(0).toUpperCase() + item.name.slice(1),
      })),
    [labels]
  );

  const [customOptions, setCustomOptions] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
   const defaultTypes = defaultEmailLabels.map((opt) => opt.value);

   const unknownTypes = emails
    .map((e) => e.type)
    .filter((type) => !defaultTypes.includes(type))
    .filter((type) => !customOptions.some((opt) => opt.value === type));

   if (unknownTypes.length > 0) {
    setCustomOptions((prev) => [
      ...prev,
      ...unknownTypes.map((type) => ({
        value: type,
        label: type.charAt(0).toUpperCase() + type.slice(1),
      })),
    ]);
   }
  }, )

  const flattenOptions = () =>
    [...defaultEmailLabels, ...customOptions];

  const getAvailableGroupedOptions = () => {
    const hasPrimary = emails.some((e) => e.type === "primary");
    const filterPrimary = (opt: { value: string }) => opt.value !== "primary";

    return [
      {
        label: "Default",
        options: hasPrimary
          ? defaultEmailLabels.filter(filterPrimary)
          : defaultEmailLabels,
      },
      {
        label: "Custom",
        options: hasPrimary
          ? customOptions.filter(filterPrimary)
          : customOptions,
      },
    ];
  };

  const handleTypeChange = (index: number, newType: string) => {
    let updated = [...emails];

    if (newType === "primary") {
      updated = updated.map((e, i) =>
        i !== index && e.type === "primary" ? { ...e, type: "other" } : e
      );
    }

    updated[index] = { ...updated[index], type: newType };
    onChange(updated);
  };

  const handleEmailChange = (index: number, newEmail: string) => {
    const updated = [...emails];
    updated[index] = { ...updated[index], email: newEmail };
    onChange(updated);
  };

  const handleAddEmail = () => {
    const nonPrimary =
      flattenOptions().find((opt) => opt.value !== "primary")?.value || "other";
    onChange([...emails, { type: nonPrimary, email: "" }]);
  };

  const handleRemoveEmail = (index: number) => {
    const removedEmail = emails[index];
    const updatedEmails = emails.filter((_, i) => i !== index);
    onChange(updatedEmails);

    if (
      !defaultEmailLabels.some((opt) => opt.value === removedEmail.type) &&
      !updatedEmails.some((e) => e.type === removedEmail.type)
    ) {
      setCustomOptions((prev) =>
        prev.filter((opt) => opt.value !== removedEmail.type)
      );
    }
  };

  const CustomOption = (props: any) => {
    const option = props.data;

    return (
      <components.Option {...props}>
        <FlexCenter>
          <span>{option.label}</span>
          {customOptions.find((opt) => opt.value === option.value) && (
            <span
              style={{
                marginLeft: 8,
                color: "#999",
                cursor: "pointer",
                fontWeight: "bold",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setCustomOptions((prev) =>
                  prev.filter((o) => o.value !== option.value)
                );

                const fallback =
                  defaultEmailLabels.find((d) => d.value !== "primary")?.value ||
                  "other";

                const updatedEmails = emails.map((e) =>
                  e.type === option.value ? { ...e, type: fallback } : e
                );
                onChange(updatedEmails);
              }}
            >
              ×
            </span>
          )}
        </FlexCenter>
      </components.Option>
    );
  };

  const availableOptions = getAvailableGroupedOptions();

  return (
    <FormGroup>
      <FormWrapper>
        {emails.map((item, index) => {
          const selectedOption =
            flattenOptions().find((opt) => opt.value === item.type) || null;

          return (
            <EmailEntry key={index}>
              <SelectContainer>
                <CreatableSelect
                  value={selectedOption}
                  options={availableOptions}
                  onChange={(selected) =>
                    selected && handleTypeChange(index, selected.value)
                  }
                  onCreateOption={(inputValue) => {
                    const newValue = inputValue.trim().toLowerCase();
                    if (!newValue) return;

                    if (
                      newValue === "primary" &&
                      emails.some((e) => e.type === "primary")
                    ) {
                      return;
                    }

                    if (
                      defaultEmailLabels.some((opt) => opt.value === newValue) ||
                      customOptions.some((opt) => opt.value === newValue)
                    ) {
                      handleTypeChange(index, newValue);
                      return;
                    }

                    const newOption = {
                      value: newValue,
                      label:
                        newValue.charAt(0).toUpperCase() + newValue.slice(1),
                    };

                    setCustomOptions((prev) => {
                      const updated = [...prev, newOption];
                      handleTypeChange(index, newValue);
                      return updated;
                    });
                  }}
                  components={{ Option: CustomOption }}
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: "34px",
                      height: "34px",
                      fontSize: "14px",
                    }),
                    indicatorsContainer: (base) => ({
                      ...base,
                      height: "34px",
                    }),
                    option: (base) => ({
                      ...base,
                      padding: "8px 12px",
                      fontSize: "14px",
                    }),
                    singleValue: (base) => ({
                      ...base,
                      fontSize: "14px",
                    }),
                  }}
                />
              </SelectContainer>

              <InputContainer>
                <FormControl
                  name={`email-${index}`}
                  value={item.email}
                  placeholder={
                    item.type === "primary" ? "Primary email" : "Email address"
                  }
                  onChange={(e: any) =>
                    handleEmailChange(index, e.target.value)
                  }
                />
              </InputContainer>

              <div>
                <Button
                  btnStyle="simple"
                  icon="trash"
                  size="small"
                  onClick={() => handleRemoveEmail(index)}
                />
              </div>
            </EmailEntry>
          );
        })}
      </FormWrapper>

      <AttachmentContainer>
        <Button
          btnStyle="simple"
          icon="plus"
          onClick={handleAddEmail}
          uppercase={false}
          size="small"
        >
          Add email
        </Button>
      </AttachmentContainer>
    </FormGroup>
  );
};

export default EditableEmailList;
