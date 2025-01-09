import {
  BarItems,
  Button,
  Chip,
  ControlLabel,
  EmptyState,
  FormControl,
  FormGroup,
  Icon,
  Label,
  ModalTrigger,
  SelectTeamMembers,
  Spinner,
  TabTitle,
  Tabs,
  __,
  colors
} from "@erxes/ui/src";

import Common from "@erxes/ui-automations/src/components/forms/actions/Common";
import PlaceHolderInput from "@erxes/ui-automations/src/components/forms/actions/placeHolder/PlaceHolderInput";
import { DrawerDetail, ItemRowHeader } from "@erxes/ui-automations/src/styles";
import { IAction } from "@erxes/ui-automations/src/types";
import EmailTemplate from "@erxes/ui-emailtemplates/src/containers/EmailTemplate";
import AddTemplateForm from "@erxes/ui-emailtemplates/src/containers/Form";
import SelectEmailTemplates from "@erxes/ui-emailtemplates/src/containers/SelectEmailtTemplate";
import { FlexRow } from "@erxes/ui-settings/src/styles";
import Popover from "@erxes/ui/src/components/Popover";
import { Avatar } from "@erxes/ui/src/components/SelectWithSearch";
import { PopoverContent } from "@erxes/ui/src/components/filterableList/styles";
import { isEnabled } from "@erxes/ui/src/utils/core";
import React, { useState } from "react";
import { renderDynamicComponent } from "../../../../utils";
import { Padding } from "../styles";
import { ItemRow } from "@erxes/ui-automations/src/components/forms/actions/ItemRow";
import SelectCompanies from "@erxes/ui-contacts/src/companies/containers/SelectCompanies";
import SelectCustomers from "@erxes/ui-contacts/src/customers/containers/SelectCustomers";
import { gql, useQuery } from "@apollo/client";
import Select, {
  type DropdownIndicatorProps,
  components,
  MenuProps
} from "react-select";
import { getReactSelectStyle } from "@erxes/ui/src/components/richTextEditor/RichTextEditorControl/styles";

type Props = {
  activeAction: any;
  addAction: (action: IAction, actionId?: string, config?: any) => void;
  closeModal: () => void;
  triggerType: string;
  triggerConfig: any;
  actionsConst: any[];
  triggersConst: any[];
};

const checkToFieldConfigured = (emailRecipientsConst, config) => {
  const keys = emailRecipientsConst.map(({ name }) => name);
  const configKeys = Object.keys(config);

  return keys.some(key =>
    Array.isArray(config[key])
      ? (config[key] || [])?.length
      : config[key] && configKeys.includes(key)
  );
};

const SelectDocument = ({ triggerType }) => {
  const query = `query Documents($contentType: String) {
  documents(contentType: $contentType) {
    _id
    name
    code
  }
}`;
  const [serviceName] = triggerType.includes("core")
    ? triggerType.split(".")
    : triggerType.split(":");

  const { data, loading } = useQuery(gql(query), {
    variables: {
      contentType: serviceName
    }
  });

  return ({ onClick }) => {
    if (loading) {
      return <Spinner objective />;
    }

    return (
      <Select
        placeholder="Documents"
        isMulti={false}
        isSearchable={false}
        menuPlacement="auto"
        maxMenuHeight={200}
        isLoading={loading}
        onChange={(val: any) => onClick(`document.${val.value}`)}
        options={(data?.documents || []).map(({ _id, name }) => ({
          value: _id,
          label: name
        }))}
        menuPortalTarget={document.body}
        styles={getReactSelectStyle(false)}
      />
    );
  };
};

const EmailTemplatesList = ({ triggerType, onChangeConfig }) => {
  const [searchValue, setSearchValue] = useState("");
  const addTemplateForm = () => {
    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        {__("Add template")}
      </Button>
    );

    const content = ({ closeModal }) => {
      const updatedProps = {
        closeModal,
        contentType: triggerType,
        additionalToolbarContent: isEnabled("documents")
          ? SelectDocument({ triggerType })
          : () => null,
        params: { searchValue }
      };

      return <AddTemplateForm {...updatedProps} />;
    };

    return (
      <ModalTrigger
        title="Add new email template"
        content={content}
        trigger={trigger}
        size="lg"
      />
    );
  };

  const onSearch = e => {
    const { value } = e.currentTarget as HTMLInputElement;

    setSearchValue(value);
  };

  const selectTemplate = (id: string) => {
    onChangeConfig("templateId", id);
  };

  return (
    <>
      <FormGroup>
        <ControlLabel>{__("Search")}</ControlLabel>
        <BarItems>
          <FormControl
            name="searchValue"
            placeholder={__("Type to search")}
            value={searchValue}
            onChange={onSearch}
          />
          {addTemplateForm()}
        </BarItems>
      </FormGroup>
      <SelectEmailTemplates
        searchValue={searchValue}
        handleSelect={selectTemplate}
      />
    </>
  );
};

const RecipientsForm = ({
  emailRecipientsConst,
  triggerType,
  triggerConfig,
  config,
  onChangeConfig,
  additionalAttributes
}) => {
  const [selectedTab, setTab] = useState("general");

  const onSelect = (value, name) => {
    onChangeConfig({ ...config, [name]: value });
  };

  const renderAttrubutionInput = () => {
    const onChange = updatedConfig => onChangeConfig(updatedConfig);

    const isAvailableTriggerExecutor = ["customer", "companies", "user"].some(
      c => triggerType.includes(c)
    );

    const customAttributions = isAvailableTriggerExecutor
      ? [
          {
            _id: String(Math.random()),
            label: "Trigger Executors",
            name: "triggerExecutors",
            type: "segment"
          }
        ]
      : [];

    return (
      <PlaceHolderInput
        config={config}
        triggerType={triggerType}
        inputName="attributionMails"
        placeholder={__(
          "Please select  some attributes from attributes section"
        )}
        label="Dynamic mails"
        attrTypes={["user", "contact", "segment"]}
        attrWithSegmentConfig={triggerType === "forms:form_submission"}
        triggerConfig={triggerConfig}
        onChange={onChange}
        customAttributions={[...additionalAttributes, ...customAttributions]}
        additionalContent={
          <Popover
            placement="auto"
            trigger={
              <Icon color={colors.colorCoreRed} icon="question-circle" />
            }
          >
            <PopoverContent style={{ width: "200px", padding: "10px" }}>
              This type does not include (From Mail) and (Not Verified mails)
            </PopoverContent>
          </Popover>
        }
      />
    );
  };

  const renderCustomMailInput = () => {
    const onChange = e => {
      const { value } = e.currentTarget;
      if (
        e.key === "Enter" &&
        value.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ) {
        onSelect((config?.customMails || []).concat(value), "customMails");
        e.currentTarget.value = "";
      }
    };

    const removeMail = mail => {
      onSelect(
        (config?.customMails || []).filter(value => value !== mail),
        "customMails"
      );
    };

    return (
      <FormGroup>
        <ControlLabel>{__("Custom Mail")}</ControlLabel>
        {(config?.customMails || []).map(customMail => (
          <Chip
            key={customMail}
            onClick={() => removeMail(customMail)}
            frontContent={<Avatar src="/images/avatar-colored.svg" />}
          >
            {customMail}
          </Chip>
        ))}
        <FormControl onKeyPress={onChange} placeholder="Enter some email" />
      </FormGroup>
    );
  };

  const renderRecipientTypeComponent = ({ serviceName, label, name, type }) => {
    if (serviceName) {
      return renderDynamicComponent(
        {
          componentType: "selectRecipients",
          type,
          value: config[name],
          label,
          name,
          onSelect
        },
        `${serviceName}:${type}`
      );
    }

    switch (type) {
      case "customMail":
        return renderCustomMailInput();
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
                status: "Verified"
              }}
            />
          </FormGroup>
        );

      default:
        const Components = {
          lead: SelectCustomers,
          customer: SelectCustomers,
          company: SelectCompanies
        };

        const Component = Components[type];

        if (!Component) {
          return <EmptyState text="Empty" icon="info-circle" />;
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
                emailValidationStatus: "valid"
              }}
            />
          </FormGroup>
        );
    }
  };

  const renderToEmailsContent = () => {
    if (selectedTab === "general") {
      return renderAttrubutionInput();
    }

    if (selectedTab === "static") {
      return (emailRecipientsConst || []).map(emailRType =>
        renderRecipientTypeComponent(emailRType)
      );
    }

    return null;
  };

  return (
    <FormGroup>
      <ControlLabel>{__("To Emails")}</ControlLabel>
      <DrawerDetail>
        <Tabs full>
          <TabTitle
            className={selectedTab === "general" ? "active" : ""}
            onClick={() => setTab("general")}
          >
            {__("General")}
            {config?.attributionMails && (
              <Label lblStyle="danger">
                <Icon icon="check" />
              </Label>
            )}
          </TabTitle>
          <TabTitle
            className={selectedTab === "static" ? "active" : ""}
            onClick={() => setTab("static")}
          >
            {__("Static")}
            {checkToFieldConfigured(emailRecipientsConst, config) && (
              <Label lblStyle="danger" shake={true} ignoreTrans={true}>
                {`${emailRecipientsConst
                  .filter(({ name }) => name !== "attributionMails")
                  .reduce((acc, item) => {
                    if (
                      config.hasOwnProperty(item.name) &&
                      Array.isArray(config[item.name])
                        ? (config[item.name] || []).length
                        : config[item.name]
                    ) {
                      acc++;
                    }
                    return acc;
                  }, 0)}`}
              </Label>
            )}
          </TabTitle>
        </Tabs>
        <Padding>{renderToEmailsContent()}</Padding>
      </DrawerDetail>
    </FormGroup>
  );
};

const ConfigForm = ({
  emailRecipientsConst,
  config,
  addAction,
  activeAction,
  closeModal,
  triggerConfig,
  setConfig,
  triggerType,
  additionalAttributes
}) => {
  const onSelect = (value, name) => {
    setConfig({ ...config, [name]: value });
  };

  return (
    <Common
      closeModal={closeModal}
      addAction={addAction}
      activeAction={activeAction}
      config={config}
    >
      <DrawerDetail>
        <ItemRow
          title={__("Sender")}
          description={__("Who is sending email")}
          buttonText="sender"
          isDone={config?.fromUserId}
          config={config}
          content={(doc, onChange) => (
            <FormGroup>
              <ControlLabel>{"Sender"}</ControlLabel>
              <SelectTeamMembers
                name="fromUserId"
                initialValue={doc?.fromUserId || config?.fromUserId}
                label={__("Select sender user")}
                onSelect={(value, name) => onChange({ ...doc, [name]: value })}
                filterParams={{
                  status: "Verified"
                }}
                multi={false}
              />
            </FormGroup>
          )}
          onSave={({ fromUserId }) => onSelect(fromUserId, "fromUserId")}
          subContent={config?.fromUserId ? "" : "Select Sender"}
        />
        <ItemRow
          title={__("Reciepent")}
          description=""
          buttonText="select recipients"
          config={config}
          isDone={checkToFieldConfigured(emailRecipientsConst, config)}
          content={(doc, onChange) => (
            <RecipientsForm
              config={doc}
              onChangeConfig={onChange}
              emailRecipientsConst={emailRecipientsConst}
              triggerConfig={triggerConfig}
              triggerType={triggerType}
              additionalAttributes={additionalAttributes}
            />
          )}
          onSave={setConfig}
          subContent={config?.to ? "" : "Select recipients"}
        />
        <ItemRow
          title={__("Subject")}
          description={__("Configure the subject of the email")}
          buttonText="subject"
          config={config}
          isDone={config?.subject}
          content={(doc, onChange) => (
            <PlaceHolderInput
              inputName="subject"
              label={__("Email Subject")}
              config={doc}
              onChange={() => null}
              onKeyPress={(e: any) => {
                const { name, value } = e.currentTarget as HTMLInputElement;
                onChange({ [name]: value });
              }}
              triggerType={triggerType}
            />
          )}
          subContent={__(config?.subject ? "" : "Enter subject")}
          onSave={doc => setConfig({ ...config, ...doc })}
        />

        <FlexRow $justifyContent="space-between">
          <FlexRow $alignItems="baseline">
            <ItemRowHeader>{__("Selected Email Template")}</ItemRowHeader>
            <Icon
              color={colors.colorCoreGreen}
              icon="check-circle"
              style={{ paddingLeft: "6px" }}
            />
          </FlexRow>
          <ModalTrigger
            title={__("Email Templates")}
            size="xl"
            trigger={
              <Button btnStyle="white">{__(`Change email template`)}</Button>
            }
            content={() => (
              <EmailTemplatesList
                triggerType={triggerType}
                onChangeConfig={(name, value) => {
                  setConfig({ ...config, [name]: value });
                }}
              />
            )}
          />
        </FlexRow>
        <EmailTemplate templateId={config?.templateId} onlyPreview />
      </DrawerDetail>
    </Common>
  );
};

export default function SendEmail({
  triggerType,
  actionsConst,
  addAction,
  activeAction,
  closeModal,
  triggerConfig,
  triggersConst
}: Props) {
  const [config, setConfig] = useState<any>(activeAction?.config || {});

  if (config?.templateId) {
    const { emailRecipientsConst = [] } =
      actionsConst.find(action => action.type === "sendEmail") || {};
    const { additionalAttributes = [] } =
      (triggersConst || []).find(({ type }) => type === triggerType) || {};

    const updatedProps = {
      emailRecipientsConst,
      config,
      addAction,
      activeAction,
      closeModal,
      triggerConfig,
      setConfig,
      triggerType,
      additionalAttributes
    };

    return <ConfigForm {...updatedProps} />;
  }

  return (
    <EmailTemplatesList
      triggerType={triggerType}
      onChangeConfig={(name, value) => {
        setConfig({ ...config, [name]: value });
      }}
    />
  );
}
