import React, { useReducer, useRef, useState } from "react";

import { gql, useQuery } from "@apollo/client";
import SelectProductCategory from "@erxes/ui-products/src/containers/SelectProductCategory";
import SelectProducts from "@erxes/ui-products/src/containers/SelectProducts";
import { FlexRow } from "@erxes/ui-settings/src/styles";
import SelectTags from "@erxes/ui-tags/src/containers/SelectTags";
import {
  Button,
  ButtonMutate,
  Form as CommonForm,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
  ModalTrigger,
  SelectWithSearch,
  Spinner,
  Tabs,
  TabTitle,
} from "@erxes/ui/src/components";
import Popover from "@erxes/ui/src/components/Popover";
import {
  FormColumn,
  FormWrapper,
  ModalFooter,
} from "@erxes/ui/src/styles/main";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import { __, loadDynamicComponent } from "@erxes/ui/src/utils";
import {
  Attributes,
  AttributeTrigger,
  OwnerBox,
  PaddingTop,
  Row,
} from "../../../styles";
import mutations from "../graphql/mutations";

type Props = {
  closeModal: () => void;
  campaign?: any;
  refetch?: () => void;
};

type FormProps = {
  formProps: IFormProps;
  onChange: (name: string, value: string) => void;
  state: any;
  ref: any;
  serviceName: string;
};

const OWNER_TYPES = [
  {
    value: "customer",
    label: "Customers",
    icon: "chat-bubble-user",
    type: "core:customer",
  },
  {
    value: "company",
    label: "Companies",
    icon: "building",
    type: "core:company",
  },
  {
    value: "teamMember",
    label: "Team Members",
    icon: "user-6",
    type: "core:user",
  },
];
function reducer(state, action) {
  const { type, ...values } = action;
  return {
    ...state,
    ...values,
  };
}

const query = `
query ScoreCampaignAttributes($serviceName:String) {
  scoreCampaignAttributes(serviceName:$serviceName)
}
`;

const GET_SERVICES_QUERY = `
query ScoreCampaignServices {
  scoreCampaignServices
}
`;

const Attributions = ({ ref, serviceName, onChange }) => {
  const [searchValue, setSearchValue] = useState("");
  const { loading, data } = useQuery(gql(query), {
    variables: { serviceName },
  });

  if (loading) {
    return null;
  }

  let attributes = data?.scoreCampaignAttributes || [];

  const onClick = (value, close) => {
    onChange(value);
    close();
  };
  const onSearch = (e) => {
    const { value } = e.currentTarget as HTMLInputElement;

    setSearchValue(value);
  };

  if (searchValue) {
    attributes = attributes.filter((option) =>
      new RegExp(searchValue, "i").test(option.label)
    );
  }

  return (
    <Popover
      innerRef={ref}
      trigger={
        <AttributeTrigger>
          {__("Attribution")} <Icon icon="angle-down" />
        </AttributeTrigger>
      }
      placement="top"
      closeAfterSelect={true}
    >
      {(close) => (
        <Attributes>
          <>
            <FormGroup>
              <ControlLabel>{__("Search")}</ControlLabel>
              <FormControl
                placeholder="Type to search"
                value={searchValue}
                onChange={onSearch}
              />
            </FormGroup>
            <li>
              <b>{__("Attributions")}</b>
            </li>
            {attributes.map((attribute) => {
              const { label = "", value } = attribute || {};

              if (!value) {
                return null;
              }
              return <li onClick={() => onClick(value, close)}>{__(label)}</li>;
            })}
          </>
        </Attributes>
      )}
    </Popover>
  );
};

const ActionForm = ({
  formProps,
  state,
  onChange,
  ref,
  serviceName,
}: FormProps) => {
  const handleChange = (e: React.FormEvent<HTMLElement>) => {
    const { name, value } = e.currentTarget as HTMLInputElement;

    onChange(name, value);
  };

  const onSelectAttribute = (value) => {
    onChange("placeholder", `${state?.placeholder || ""}{{ ${value} }}`);
  };

  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "80% 20%", gap: "16px" }}
    >
      <FormGroup>
        <Row $justifyContent="space-between">
          <ControlLabel>{"Score Value"}</ControlLabel>
          <Attributions
            ref={ref}
            serviceName={serviceName}
            onChange={onSelectAttribute}
          />
        </Row>
        <FormControl
          {...formProps}
          name="placeholder"
          required
          placeholder="Type a placeholder for subtract score"
          value={state?.placeholder || ""}
          onChange={handleChange}
        />
      </FormGroup>

      <PaddingTop padding={10}>
        <FormGroup>
          <ControlLabel>{"Currency ratio"}</ControlLabel>
          <FormControl
            {...formProps}
            name="currencyRatio"
            required
            type="number"
            placeholder="Type a currency ratio"
            value={state?.currencyRatio || ""}
            onChange={handleChange}
          />
        </FormGroup>
      </PaddingTop>
    </div>
  );
};

const SelectFieldGroup = ({ contentType, dispatch, state }) => {
  const query = `
  query fieldsGroups(
    $contentType: String!,
    $isDefinedByErxes: Boolean
  ) {
    fieldsGroups(
      contentType: $contentType,
      isDefinedByErxes: $isDefinedByErxes
    ) {
      _id
      name
      description
      code
      order
      contentType
    }
  }
`;

  const label = OWNER_TYPES.find(({ type }) => type === contentType)?.label;

  return (
    <FormGroup>
      <FlexRow $justifyContent="space-between">
        <ControlLabel>{__("Field Group")}</ControlLabel>
        <Button
          target="__blank"
          icon="plus-1"
          btnStyle="white"
          href={`/settings/properties?type=${contentType}`}
        >
          {__("New Group")}
        </Button>
      </FlexRow>
      <SelectWithSearch
        initialValue={state?.fieldGroupId}
        customQuery={query}
        queryName="fieldsGroups"
        name="fieldGroupId"
        label={`${label} Field Groups`}
        filterParams={{ contentType, isDefinedByErxes: false }}
        onSelect={(value) => dispatch({ fieldGroupId: value })}
        generateOptions={(groups) =>
          groups.map(({ _id, name }) => ({ value: _id, label: name }))
        }
      />
    </FormGroup>
  );
};

const SelectField = ({ state, contentType, dispatch }) => {
  const query = `
  query Fields($contentType: String!, $groupIds: [String], $isDisabled: Boolean) {
  fields(contentType: $contentType, groupIds: $groupIds, isDisabled: $isDisabled) {
    _id
    text
  }
}
  `;

  return (
    <FormGroup>
      <ControlLabel>{__("Select Field")}</ControlLabel>
      <FlexRow>
        <SelectWithSearch
          initialValue={state?.fieldId}
          customQuery={query}
          queryName="fields"
          name="fieldId"
          label={`Select field`}
          filterParams={{
            contentType,
            groupIds: state?.fieldGroupId ? [state?.fieldGroupId] : [],
            isDisabled: true,
          }}
          onSelect={(value) => dispatch({ fieldId: value })}
          generateOptions={(field) => {
            return field.map(({ _id, text }) => ({ value: _id, label: text }));
          }}
        />
      </FlexRow>
    </FormGroup>
  );
};

const SelectFieldTabContent = ({
  currentTab,
  formProps,
  campaign,
  isFieldEditing,
  state,
  onChangeInput,
  setFieldEdit,
  dispatch,
  contentType,
}) => {
  const fieldTabs = {
    new: (
      <FormGroup>
        <ControlLabel>{__("Field Name")}</ControlLabel>
        <FlexRow>
          <FormControl
            {...formProps}
            name="fieldName"
            required={currentTab === "exists" && campaign?.fieldId}
            disabled={
              !!campaign?.fieldName && campaign?.fieldId && !isFieldEditing
            }
            defaultValue={state.fieldName}
            onChange={onChangeInput}
          />
          {!!campaign?.fieldName && campaign?.fieldId && (
            <Button
              icon="pencil"
              btnStyle={isFieldEditing ? "simple" : "white"}
              onClick={() => setFieldEdit(!isFieldEditing)}
            />
          )}
        </FlexRow>
      </FormGroup>
    ),
    exists: (
      <SelectField
        state={state}
        dispatch={dispatch}
        contentType={contentType}
      />
    ),
  };

  return fieldTabs[currentTab];
};

const SelectService = ({ state, dispatch }) => {
  const { data, loading } = useQuery(gql(GET_SERVICES_QUERY));
  const [serviceConfig, setServiceConfig] = useState<any>({});
  if (loading) {
    return <Spinner />;
  }

  const { scoreCampaignServices = [] } = data || {};

  return (
    <>
      <FlexRow>
        {scoreCampaignServices.map((serviceConfig) => {
          const isSelected = serviceConfig.name === state?.serviceName;
          return (
            <OwnerBox
              key={serviceConfig?.name}
              $isSelected={isSelected}
              onClick={() => {
                setServiceConfig(serviceConfig);
                dispatch({ serviceName: serviceConfig.name });
              }}
              isWithActions={
                isSelected && serviceConfig?.isAviableAdditionalConfig
              }
            >
              <Icon icon={serviceConfig?.icon || "question-circle"} size={16} />
              <span>{serviceConfig?.label || "-"}</span>
              {isSelected && serviceConfig?.isAviableAdditionalConfig ? (
                <ModalTrigger
                  title="Service Configurations"
                  size="lg"
                  trigger={<Button btnStyle="link" icon="settings" />}
                  content={() =>
                    loadDynamicComponent("scoreCampaignConfig", {
                      config: state?.additionalConfig,
                      onChange: (value) =>
                        dispatch({ additionalConfig: value }),
                    })
                  }
                />
              ) : (
                <></>
              )}
            </OwnerBox>
          );
        })}
      </FlexRow>
    </>
  );
};

export default function Form({ campaign, closeModal, refetch }: Props) {
  const [currentTab, setCurrentTab] = useState("add");
  const [currentFieldTab, setCurrentFieldTab] = useState<"new" | "exists">(
    !!campaign && !campaign?.fieldName ? "exists" : "new"
  );
  const [isFieldEditing, setFieldEdit] = useState(false);
  const [state, dispatch] = useReducer(reducer, { ...campaign });
  const ref = useRef<any>(null);

  const generateDoc = (values) => {
    const object = { ...values, ...state };
    const prevFieldId = campaign?.fieldId;
    if (
      state.fieldId !== prevFieldId &&
      !!campaign?.fieldName &&
      currentFieldTab === "exists"
    ) {
      object.fieldName = "";
    }
    if (
      !!state?.fieldName &&
      currentFieldTab === "new" &&
      !campaign?.fieldName
    ) {
      object.fieldId === "";
    }

    return object;
  };

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object,
  }: IButtonMutateProps) => {
    const attachmentMoreArray: any[] = [];
    const attachment = values.attachment || undefined;
    const attachmentMore = values.attachmentMore || [];

    attachmentMore.map((att) => {
      attachmentMoreArray.push({ ...att, __typename: undefined });
    });

    values.attachment = attachment
      ? { ...attachment, __typename: undefined }
      : null;
    values.attachmentMore = attachmentMoreArray;

    return (
      <ButtonMutate
        mutation={object ? mutations.update : mutations.add}
        variables={values}
        callback={callback}
        isSubmitted={isSubmitted}
        type="submit"
        uppercase={false}
        successMessage={`You successfully ${
          object ? "updated" : "added"
        } a ${name}`}
      />
    );
  };

  const renderRestrictionForm = () => {
    const { restrictions } = state;

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Product Category</ControlLabel>
              <SelectProductCategory
                label={__("Choose product category")}
                name="categoryIds"
                initialValue={restrictions?.categoryIds || []}
                onSelect={(categoryIds) =>
                  dispatch({ restrictions: { ...restrictions, categoryIds } })
                }
                multi={true}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>
                Or Exclude Product Category
              </ControlLabel>
              <SelectProductCategory
                label={__("Choose product category")}
                name="excludeCategoryIds"
                initialValue={restrictions?.excludeCategoryIds || []}
                onSelect={(excludeCategoryIds) =>
                  dispatch({
                    restrictions: { ...restrictions, excludeCategoryIds },
                  })
                }
                multi={true}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Product</ControlLabel>
              <SelectProducts
                label={__("Filter by products")}
                name="productIds"
                multi={true}
                initialValue={restrictions?.productIds || []}
                onSelect={(productIds) =>
                  dispatch({ restrictions: { ...restrictions, productIds } })
                }
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Or Exclude Product</ControlLabel>
              <SelectProducts
                label={__("Filter by products")}
                name="excludeProductIds"
                multi={true}
                initialValue={restrictions?.excludeProductIds || []}
                onSelect={(excludeProductIds) =>
                  dispatch({
                    restrictions: { ...restrictions, excludeProductIds },
                  })
                }
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Tag</ControlLabel>
              <SelectTags
                label={__("Filter by tag")}
                name="tagIds"
                multi={true}
                initialValue={restrictions?.tagIds || []}
                tagsType="core:product"
                onSelect={(tagIds) =>
                  dispatch({ restrictions: { ...restrictions, tagIds } })
                }
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Or Exclude Tag</ControlLabel>
              <SelectTags
                label={__("Filter by tag")}
                name="excludeTagIds"
                multi={true}
                initialValue={restrictions?.excludeTagIds || []}
                tagsType="core:product"
                onSelect={(excludeTagIds) =>
                  dispatch({ restrictions: { ...restrictions, excludeTagIds } })
                }
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
      </>
    );
  };

  const renderForm = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    const onChangeInput = (e) => {
      const { value, name } = e.currentTarget as HTMLInputElement;

      dispatch({ [name]: value });
    };

    const renderContent = () => {
      const onChange = (name: string, value: string) => {
        dispatch({ [currentTab]: { ...state[currentTab], [name]: value } });
      };

      return (
        <PaddingTop>
          <ActionForm
            serviceName={state?.serviceName}
            formProps={formProps}
            state={state[currentTab] || {}}
            onChange={onChange}
            ref={ref}
          />
        </PaddingTop>
      );
    };

    return (
      <>
        <FormGroup>
          <ControlLabel required>{__("Title")}</ControlLabel>
          <FormControl
            {...formProps}
            name="title"
            required
            defaultValue={state.title}
            onChange={onChangeInput}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__("Description")}</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            required
            componentclass="textarea"
            defaultValue={state.description}
            onChange={onChangeInput}
          />
        </FormGroup>

        {renderRestrictionForm()}

        <SelectService state={state} dispatch={dispatch} />
        {state.serviceName && (
          <>
            <Tabs>
              <TabTitle
                className={currentTab === "add" ? "active" : ""}
                onClick={() => setCurrentTab("add")}
              >
                {__("Add")}
              </TabTitle>
              <TabTitle
                className={currentTab === "subtract" ? "active" : ""}
                onClick={() => setCurrentTab("subtract")}
              >
                {__("Subtract")}
              </TabTitle>
            </Tabs>
            {renderContent()}
            <FormGroup>
              <ControlLabel>{__("Apply Score To")}</ControlLabel>
              <FlexRow>
                {OWNER_TYPES.map(({ label, value, icon }) => (
                  <OwnerBox
                    key={value}
                    $isSelected={value === state?.ownerType}
                    onClick={() => dispatch({ ownerType: value })}
                  >
                    <Icon icon={icon} size={16} />
                    <span>{label}</span>
                  </OwnerBox>
                ))}
              </FlexRow>
            </FormGroup>

            {state.ownerType === "customer" && (
              <FormGroup>
                <ControlLabel>
                  {__("Only client portal (optional)")}
                </ControlLabel>
                <FormControl
                  {...formProps}
                  componentclass="checkbox"
                  checked={state.onlyClientPortal || false}
                  onChange={(e: any) =>
                    dispatch({ onlyClientPortal: e.target.checked })
                  }
                />
              </FormGroup>
            )}

            {state.ownerType && (
              <>
                <SelectFieldGroup
                  contentType={
                    OWNER_TYPES.find(({ value }) => value === state.ownerType)
                      ?.type
                  }
                  state={state}
                  dispatch={dispatch}
                />

                {state?.fieldGroupId && (
                  <>
                    <Tabs>
                      <TabTitle
                        className={currentFieldTab === "new" ? "active" : ""}
                        onClick={() => setCurrentFieldTab("new")}
                      >
                        {__("New")}
                      </TabTitle>
                      <TabTitle
                        className={currentFieldTab === "exists" ? "active" : ""}
                        onClick={() => setCurrentFieldTab("exists")}
                      >
                        {__("Exists")}
                      </TabTitle>
                    </Tabs>
                    <PaddingTop>
                      <SelectFieldTabContent
                        currentTab={currentFieldTab}
                        formProps={formProps}
                        isFieldEditing={isFieldEditing}
                        setFieldEdit={setFieldEdit}
                        campaign={campaign}
                        state={state}
                        dispatch={dispatch}
                        onChangeInput={onChangeInput}
                        contentType={
                          OWNER_TYPES.find(
                            ({ value }) => value === state.ownerType
                          )?.type
                        }
                      />
                    </PaddingTop>
                  </>
                )}
              </>
            )}
          </>
        )}

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            {__("Close")}
          </Button>

          {renderButton({
            name: "score Campaign",
            values: generateDoc(values),
            isSubmitted,
            callback: () => {
              closeModal();
              refetch && refetch();
            },
            object: campaign,
          })}
        </ModalFooter>
      </>
    );
  };

  return <CommonForm renderContent={renderForm} />;
}
