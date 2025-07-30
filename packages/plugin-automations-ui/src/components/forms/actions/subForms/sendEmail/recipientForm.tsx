import {
  Button,
  Chip,
  ControlLabel,
  EmptyState,
  FormControl,
  FormGroup,
  Icon,
  SelectTeamMembers,
  __,
  colors,
} from "@erxes/ui/src";

import PlaceHolderInput from "@erxes/ui-automations/src/components/forms/actions/placeHolder/PlaceHolderInput";
import SelectCompanies from "@erxes/ui-contacts/src/companies/containers/SelectCompanies";
import SelectCustomers from "@erxes/ui-contacts/src/customers/containers/SelectCustomers";
import { FieldsCombinedByType } from "@erxes/ui-forms/src/settings/properties/types";
import { FlexRow } from "@erxes/ui-settings/src/styles";
import Popover from "@erxes/ui/src/components/Popover";
import { Avatar } from "@erxes/ui/src/components/SelectWithSearch";
import { PopoverContent } from "@erxes/ui/src/components/filterableList/styles";
import { FlexColumn } from "@erxes/ui/src/components/step/style";
import React, { useState } from "react";
import Select from "react-select";
import { renderDynamicComponent } from "../../../../../utils";

const MAIL_TYPES = [
  { type: "attributionMail", name: "attributionMails", label: "Dynamic Entry" },
  { type: "customMail", name: "customMails", label: "Manual Entry" },
  {
    type: "teamMember",
    name: "teamMemberIds",
    label: "Team Members",
  },
  {
    type: "lead",
    name: "leadIds",
    label: "Leads",
  },
  {
    type: "customer",
    name: "customerIds",
    label: "Customers",
  },
  {
    type: "company",
    name: "companyIds",
    label: "Companies",
  },
];

export const RecipientsForm = ({
  triggerType,
  triggerConfig,
  config,
  onChangeConfig,
  additionalAttributes,
}) => {
  const [CCEnabled, setCCEnabled] = useState(config?.cc || false);

  const onSelect = (value: any, name: string) => {
    onChangeConfig({ ...config, [name]: value });
  };

  return (
    <>
      <FormGroup>
        <FlexRow $justifyContent='space-between'>
          <ControlLabel>{__("To")}</ControlLabel>
          <Button
            size='small'
            btnStyle={CCEnabled ? "white" : "link"}
            onClick={() => {
              if (CCEnabled) {
                onChangeConfig({ ...config, cc: undefined });
                setCCEnabled(false);
              } else {
                setCCEnabled(true);
              }
            }}
          >
            {__("CC")}
          </Button>
        </FlexRow>
        <FieldRow
          config={config}
          onSelect={onSelect}
          onChangeConfig={onChangeConfig}
          additionalAttributes={additionalAttributes}
          triggerConfig={triggerConfig}
          triggerType={triggerType}
        />
      </FormGroup>
      {CCEnabled && (
        <FormGroup>
          <ControlLabel>{__("CC")}</ControlLabel>
          <FieldRow
            config={config?.cc || {}}
            onSelect={(value: any, name: string) =>
              onSelect({ ...(config?.cc || {}), [name]: value }, "cc")
            }
            onChangeConfig={(newConfig) =>
              onChangeConfig({
                ...(config || {}),
                cc: { ...(newConfig || {}) },
              })
            }
            additionalAttributes={additionalAttributes}
            triggerConfig={triggerConfig}
            triggerType={triggerType}
          />
        </FormGroup>
      )}
    </>
  );
};

const FieldRow = ({
  config,
  onSelect,
  onChangeConfig,
  additionalAttributes,
  triggerType,
  triggerConfig,
}: {
  config: any;
  onSelect: (...args: any) => void;
  triggerType: string;
  triggerConfig: any;
  onChangeConfig: (config: any) => void;
  additionalAttributes: FieldsCombinedByType[];
}) => {
  const [selectedType, setType] = useState("attributionMail");
  const options = MAIL_TYPES.map(({ type, label }) => ({ value: type, label }));

  return (
    <FlexColumn style={{ gap: "12px" }}>
      <Select
        defaultValue={options.find(({ value }) => value === selectedType)}
        options={options}
        onChange={(opt) =>
          opt?.value ? setType(opt?.value) : setType("attributionMail")
        }
      />

      <EmailFieldInputWrapper
        type={selectedType}
        config={config}
        onSelect={onSelect}
        onChangeConfig={onChangeConfig}
        additionalAttributes={additionalAttributes}
        triggerConfig={triggerConfig}
        triggerType={triggerType}
      />
    </FlexColumn>
  );
};

const EmailFieldInputWrapper = ({
  type,
  config,
  onSelect,
  onChangeConfig,
  additionalAttributes,
  triggerType,
  triggerConfig,
}: {
  type: string;
  config: any;
  onSelect: (...args: any) => void;
  triggerType: string;
  triggerConfig: any;
  onChangeConfig: (config: any) => void;
  additionalAttributes: FieldsCombinedByType[];
}) => {
  switch (type) {
    case "customMail":
      return <CustomMailInput config={config} onSelect={onSelect} />;
    case "teamMember":
      return (
        <FormGroup>
          <ControlLabel>{__("Team member")}</ControlLabel>
          <SelectTeamMembers
            name={"teamMemberIds"}
            initialValue={config["teamMemberIds"] || ""}
            label={"Team members"}
            onSelect={onSelect}
            filterParams={{
              status: "Verified",
            }}
          />
        </FormGroup>
      );
    case "customer":
    case "lead":
      return (
        <FormGroup>
          <ControlLabel>{__(type.toLocaleUpperCase())}</ControlLabel>
          <SelectCustomers
            name={`${type}Ids`}
            initialValue={config[`${type}Ids`] || ""}
            label={`${type.toLocaleUpperCase()}s`}
            onSelect={onSelect}
            filterParams={{
              status: "Verified",
            }}
          />
        </FormGroup>
      );
    case "company":
      return (
        <FormGroup>
          <ControlLabel>{__("Customer")}</ControlLabel>
          <SelectCompanies
            name={"companyIds"}
            initialValue={config["companyIds"] || ""}
            label={"Companies"}
            onSelect={onSelect}
            filterParams={{
              status: "Verified",
            }}
          />
        </FormGroup>
      );
    case "attributionMail":
    default:
      return (
        <AttrubutionInput
          config={config}
          onChangeConfig={onChangeConfig}
          triggerType={triggerType}
          triggerConfig={triggerConfig}
          additionalAttributes={additionalAttributes}
        />
      );
  }
};

const AttrubutionInput = ({
  onChangeConfig,
  triggerType,
  triggerConfig,
  additionalAttributes,
  config,
}: {
  config: any;
  onChangeConfig: (config: any) => void;
  triggerType: string;
  triggerConfig: any;
  additionalAttributes: FieldsCombinedByType[];
}) => {
  const onChange = (updatedConfig) => onChangeConfig(updatedConfig);

  const isAvailableTriggerExecutor = ["customer", "companies", "user"].some(
    (c) => triggerType.includes(c)
  );

  const customAttributions = isAvailableTriggerExecutor
    ? [
        {
          _id: String(Math.random()),
          label: "Trigger Executors",
          name: "triggerExecutors",
          type: "segment",
        },
      ]
    : [];

  return (
    <PlaceHolderInput
      config={config}
      triggerType={triggerType}
      inputName='attributionMails'
      placeholder={__("Please select  some attributes from attributes section")}
      label='Dynamic mails'
      attrTypes={["user", "contact", "segment"]}
      attrWithSegmentConfig={triggerType === "forms:form_submission"}
      triggerConfig={triggerConfig}
      onChange={onChange}
      customAttributions={[...additionalAttributes, ...customAttributions]}
      additionalContent={
        <Popover
          placement='auto'
          trigger={<Icon color={colors.colorCoreRed} icon='question-circle' />}
        >
          <PopoverContent style={{ width: "200px", padding: "10px" }}>
            This type does not include (From Mail) and (Not Verified mails)
          </PopoverContent>
        </Popover>
      }
    />
  );
};

const CustomMailInput = ({
  config,
  onSelect,
}: {
  config: any;
  onSelect: (value: any, name) => void;
}) => {
  const onChange = (e) => {
    const { value } = e.currentTarget;
    if (
      e.key === "Enter" &&
      value.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    ) {
      onSelect((config?.customMails || []).concat(value), "customMails");
      e.currentTarget.value = "";
    }
  };

  const removeMail = (mail) => {
    onSelect(
      (config?.customMails || []).filter((value) => value !== mail),
      "customMails"
    );
  };

  return (
    <FormGroup>
      <ControlLabel>{__("Custom Mail")}</ControlLabel>
      {(config?.customMails || []).map((customMail) => (
        <Chip
          key={customMail}
          onClick={() => removeMail(customMail)}
          frontContent={<Avatar src='/images/avatar-colored.svg' />}
        >
          {customMail}
        </Chip>
      ))}
      <FormControl onKeyPress={onChange} placeholder='Enter some email' />
    </FormGroup>
  );
};

const RecipientTypeComponent = ({
  props: { config = {}, onSelect },
  emailRType: { serviceName, label, name, type },
}: {
  props: { config: any; onSelect: (value: any, name: any) => void };
  emailRType: {
    serviceName: string;
    label: string;
    name: string;
    type: string;
  };
}) => {
  if (serviceName) {
    return renderDynamicComponent(
      {
        componentType: "selectRecipients",
        type,
        value: config[name],
        label,
        name,
        onSelect,
      },
      `${serviceName}:${type}`
    );
  }

  switch (type) {
    case "customMail":
      return <CustomMailInput config={config} onSelect={onSelect} />;
    case "teamMember":
      return (
        <FormGroup>
          <ControlLabel>{__(label)}</ControlLabel>
          <SelectTeamMembers
            name={name}
            initialValue={config[name] || ""}
            label={label}
            onSelect={onSelect}
            filterParams={{
              status: "Verified",
            }}
          />
        </FormGroup>
      );

    default:
      const Components = {
        lead: SelectCustomers,
        customer: SelectCustomers,
        company: SelectCompanies,
      };

      const Component = Components[type];

      if (!Component) {
        return <EmptyState text='Empty' icon='info-circle' />;
      }

      return (
        <FormGroup>
          <ControlLabel>{__(label)}</ControlLabel>
          <Component
            name={name}
            initialValue={config[name] || ""}
            label={label}
            onSelect={onSelect}
            filterParams={{
              type,
              emailValidationStatus: "valid",
            }}
          />
        </FormGroup>
      );
  }
};
