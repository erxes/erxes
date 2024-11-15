import React, { useReducer, useState } from "react";

import {
  Button,
  ButtonMutate,
  Form as CommonForm,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
  SelectWithSearch,
  Tabs,
  TabTitle
} from "@erxes/ui/src/components";
import { ModalFooter } from "@erxes/ui/src/styles/main";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import { __ } from "@erxes/ui/src/utils";
import { OwnerBox, PaddingTop } from "../../../styles";
import { FlexRow } from "@erxes/ui-settings/src/styles";

type Props = {
  closeModal: () => void;
  campaign?: any;
  refetch?: () => void;
};

type FormProps = {
  formProps: IFormProps;
  onChange: (e: React.FormEvent<HTMLElement>) => void;
  state: any;
};

const OWNER_TYPES = [
  {
    value: "customer",
    label: "Customers",
    icon: "chat-bubble-user",
    type: "core:customer"
  },
  {
    value: "company",
    label: "Companies",
    icon: "building",
    type: "core:company"
  },
  {
    value: "teamMember",
    label: "Team Members",
    icon: "user-6",
    type: "core:user"
  }
];
function reducer(state, action) {
  const { type, ...values } = action;
  return {
    ...state,
    ...values
  };
}

const AddForm = ({ formProps, state, onChange }: FormProps) => {
  return (
    <>
      <FormGroup>
        <ControlLabel>{"Percent of Total amount"}</ControlLabel>
        <FormControl
          {...formProps}
          name="percentageAdd"
          required
          placeholder="Type a percentage of the total amount to add score"
          defaultValue={state.percentageAdd}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>{"Ratio currency"}</ControlLabel>
        <FormControl
          {...formProps}
          name="currencyRatioAdd"
          required
          placeholder="Type a percentage of the total amount to add score"
          defaultValue={state.currencyRatioAdd}
          onChange={onChange}
        />
      </FormGroup>
    </>
  );
};

const SubtractForm = ({ formProps, state, onChange }: FormProps) => {
  return (
    <>
      <FormGroup>
        <ControlLabel>{"Percent of Total amount"}</ControlLabel>
        <FormControl
          {...formProps}
          name="percentageSubtract"
          required
          type="Type a percentage of the total amount to subtract score"
          defaultValue={state.percentageSubtract}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>{"Ratio currency"}</ControlLabel>
        <FormControl
          {...formProps}
          name="currencyRatioSubtract"
          required
          placeholder="Type a percentage of the total amount to add score"
          defaultValue={state.currencyRatioSubtract}
          onChange={onChange}
        />
      </FormGroup>
    </>
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
      <ControlLabel>{__("Field Group")}</ControlLabel>
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

const contents = {
  add: AddForm,
  subtract: SubtractForm
};

export default function Form({ campaign, closeModal, refetch }: Props) {
  const [currentTab, setCurrentTab] = useState("add");
  const [isFieldEditing, setFieldEdit] = useState(false);
  const [state, dispatch] = useReducer(reducer, { title: "" });

  const generateDoc = (values) => {
    return values;
  };

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object
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
        mutation={``}
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

  const renderForm = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    const onChangeInput = (e) => {
      const { value, name } = e.currentTarget as HTMLInputElement;

      dispatch({ [name]: value });
    };

    const renderContent = () => {
      const Component = contents[currentTab];

      const onChange = (e) => {
        const { value, name } = e.currentTarget as HTMLInputElement;

        dispatch({ [currentTab]: { ...state[currentTab], [name]: value } });
      };

      return (
        <PaddingTop>
          <Component formProps={formProps} state={state} onChange={onChange} />
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
            defaultValue={state.title}
            onChange={onChangeInput}
          />
        </FormGroup>

        <Tabs full>
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
          <ControlLabel>{__("Owner Type")}</ControlLabel>
          <FlexRow>
            {OWNER_TYPES.map(({ label, value, icon }) => (
              <OwnerBox
                key={value}
                $isSelected={value === state?.ownerType}
                onClick={() => dispatch({ ownerType: value })}
              >
                <Icon icon={icon} size={24} />
                <span>{label}</span>
              </OwnerBox>
            ))}
          </FlexRow>
        </FormGroup>

        {state.ownerType && (
          <>
            <SelectFieldGroup
              contentType={
                OWNER_TYPES.find(({ value }) => value === state.ownerType)?.type
              }
              state={state}
              dispatch={dispatch}
            />

            {state?.fieldGroupId && (
              <FormGroup>
                <ControlLabel>{__("Field Name")}</ControlLabel>
                <FlexRow>
                  <FormControl
                    {...formProps}
                    name="fieldName"
                    required
                    disabled={campaign?.fieldId && !isFieldEditing}
                    defaultValue={state.fieldName}
                    onChange={onChangeInput}
                  />
                  {campaign?.fieldId && (
                    <Button
                      icon="pencil"
                      btnStyle="simple"
                      onClick={() => setFieldEdit(!isFieldEditing)}
                    />
                  )}
                </FlexRow>
              </FormGroup>
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
            Close
          </Button>

          {renderButton({
            name: "score Campaign",
            values: generateDoc(values),
            isSubmitted,
            callback: () => {
              closeModal();
              refetch && refetch();
            },
            object: campaign
          })}
        </ModalFooter>
      </>
    );
  };

  return <CommonForm renderContent={renderForm} />;
}
