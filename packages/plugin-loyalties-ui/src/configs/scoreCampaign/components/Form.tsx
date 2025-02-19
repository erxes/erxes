import React, { useReducer, useRef, useState } from 'react';

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
  TabTitle,
} from '@erxes/ui/src/components';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __, Alert } from '@erxes/ui/src/utils';
import {
  Attributes,
  AttributeTrigger,
  OwnerBox,
  PaddingTop,
  Row,
} from '../../../styles';
import { FlexRow } from '@erxes/ui-settings/src/styles';
import Popover from '@erxes/ui/src/components/Popover';
import mutations from '../graphql/mutations';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { gql, useQuery } from '@apollo/client';

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
};

const OWNER_TYPES = [
  {
    value: 'customer',
    label: 'Customers',
    icon: 'chat-bubble-user',
    type: 'core:customer',
  },
  {
    value: 'company',
    label: 'Companies',
    icon: 'building',
    type: 'core:company',
  },
  {
    value: 'teamMember',
    label: 'Team Members',
    icon: 'user-6',
    type: 'core:user',
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
query ScoreCampaignAttributes {
  scoreCampaignAttributes
}
`;

const Attributions = ({ ref, onChange }) => {
  const { loading, data } = useQuery(gql(query));

  if (loading) {
    return null;
  }

  const attributes = data?.scoreCampaignAttributes || [];

  const onClick = (value, close) => {
    onChange(value);
    close();
  };

  return (
    <Popover
      innerRef={ref}
      trigger={
        <AttributeTrigger>
          {__('Attribution')} <Icon icon="angle-down" />
        </AttributeTrigger>
      }
      placement="top"
      closeAfterSelect={true}
    >
      {(close) => (
        <Attributes>
          <>
            <li>
              <b>{__('Attributions')}</b>
            </li>
            {attributes.map((attribute) => {
              const { label = '', value } = attribute || {};

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

const ActionForm = ({ formProps, state, onChange, ref }: FormProps) => {
  const handleChange = (e: React.FormEvent<HTMLElement>) => {
    const { name, value } = e.currentTarget as HTMLInputElement;

    onChange(name, value);
  };

  const onSelectAttribute = (value) => {
    onChange('placeholder', `${state?.placeholder || ''}{{ ${value} }}`);
  };

  return (
    <>
      <FormGroup>
        <Row $justifyContent="space-between">
          <ControlLabel>{'Score'}</ControlLabel>
          <Attributions ref={ref} onChange={onSelectAttribute} />
        </Row>
        <FormControl
          {...formProps}
          name="placeholder"
          required
          placeholder="Type a placeholder for subtract score"
          value={state?.placeholder || ''}
          onChange={handleChange}
        />
      </FormGroup>

      <FormGroup>
        <ControlLabel>{'Currency ratio'}</ControlLabel>
        <FormControl
          {...formProps}
          name="currencyRatio"
          required
          type="number"
          placeholder="Type a currency ratio"
          value={state?.currencyRatio || ''}
          onChange={handleChange}
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
      <FlexRow $justifyContent="space-between">
        <ControlLabel>{__('Field Group')}</ControlLabel>
        <Button
          target="__blank"
          href={`/settings/properties?type=${contentType}`}
        >
          {__('Add Field Group')}
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
  query Fields($contentType: String!, $groupIds: [String], $isDefinedByErxes: Boolean) {
  fields(contentType: $contentType, groupIds: $groupIds, isDefinedByErxes: $isDefinedByErxes) {
    _id
    text
  }
}
  `;

  return (
    <FormGroup>
      <ControlLabel>{__('Select Field')}</ControlLabel>
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
            isDefinedByErxes: true,
          }}
          onSelect={(value) => dispatch({ fieldId: value })}
          generateOptions={(field) => {
            console.log(field);
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
        <ControlLabel>{__('Field Name')}</ControlLabel>
        <FlexRow>
          <FormControl
            {...formProps}
            name="fieldName"
            required={campaign?.fieldId}
            disabled={campaign?.fieldId && !isFieldEditing}
            defaultValue={state.fieldName}
            onChange={onChangeInput}
          />
          {campaign?.fieldId && (
            <Button
              icon="pencil"
              btnStyle={isFieldEditing ? 'simple' : 'white'}
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

export default function Form({ campaign, closeModal, refetch }: Props) {
  const [currentTab, setCurrentTab] = useState('add');
  const [currentFieldTab, setCurrentFieldTab] = useState<'new' | 'exists'>(
    'new'
  );
  const [isFieldEditing, setFieldEdit] = useState(false);
  const [state, dispatch] = useReducer(reducer, { ...campaign });
  const ref = useRef<any>(null);

  const generateDoc = (values) => {
    return { ...values, ...state };
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
          object ? 'updated' : 'added'
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
      const onChange = (name: string, value: string) => {
        dispatch({ [currentTab]: { ...state[currentTab], [name]: value } });
      };

      return (
        <PaddingTop>
          <ActionForm
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
          <ControlLabel required>{__('Title')}</ControlLabel>
          <FormControl
            {...formProps}
            name="title"
            required
            defaultValue={state.title}
            onChange={onChangeInput}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Description')}</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            required
            componentclass="textarea"
            defaultValue={state.description}
            onChange={onChangeInput}
          />
        </FormGroup>

        <Tabs full>
          <TabTitle
            className={currentTab === 'add' ? 'active' : ''}
            onClick={() => setCurrentTab('add')}
          >
            {__('Add')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'subtract' ? 'active' : ''}
            onClick={() => setCurrentTab('subtract')}
          >
            {__('Subtract')}
          </TabTitle>
        </Tabs>
        {renderContent()}
        <FormGroup>
          <ControlLabel>{__('Owner Type')}</ControlLabel>
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
              <>
                <Tabs full={true}>
                  <TabTitle
                    className={currentFieldTab === 'new' ? 'active' : ''}
                    onClick={() => setCurrentFieldTab('new')}
                  >
                    {__('Create new a field')}
                  </TabTitle>
                  <TabTitle
                    className={currentFieldTab === 'exists' ? 'active' : ''}
                    onClick={() => setCurrentFieldTab('exists')}
                  >
                    {__('Use exists field')}
                  </TabTitle>
                </Tabs>
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
                    OWNER_TYPES.find(({ value }) => value === state.ownerType)
                      ?.type
                  }
                />
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
            {__('Close')}
          </Button>

          {renderButton({
            name: 'score Campaign',
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
