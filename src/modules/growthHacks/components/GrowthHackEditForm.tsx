import client from 'apolloClient';
import gql from 'graphql-tag';
import { IUser } from 'modules/auth/types';
import DueDateChanger from 'modules/boards/components/DueDateChanger';
import EditForm from 'modules/boards/components/editForm/EditForm';
import SelectItem from 'modules/boards/components/SelectItem';
import { PRIORITIES } from 'modules/boards/constants';
import { Watch } from 'modules/boards/containers/editForm/';
import { ColorButton } from 'modules/boards/styles/common';
import {
  ActionContainer,
  FlexContent,
  LeftContainer
} from 'modules/boards/styles/item';
import { IEditFormContent, IOptions } from 'modules/boards/types';
import Icon from 'modules/common/components/Icon';
import { Alert } from 'modules/common/utils';
import React from 'react';
import { HACKSTAGES } from '../constants';
import { mutations } from '../graphql';
import { IGrowthHack, IGrowthHackParams } from '../types';
import { Left, Right, Top } from './editForm/';

type Props = {
  options: IOptions;
  item: IGrowthHack;
  users: IUser[];
  addItem: (doc: IGrowthHackParams, callback: () => void, msg?: string) => void;
  saveItem: (doc: IGrowthHackParams, callback?: () => void) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  closeModal: () => void;
};

type State = {
  hackDescription: string;
  goal: string;
  formFields: JSON;
  formId: string;
  priority: string;
  hackStage: string;
};

export default class GrowthHackEditForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const item = props.item;

    this.state = {
      hackDescription: item.hackDescription || '',
      goal: item.goal || '',
      formFields: item.formFields || {},
      priority: item.priority || '',
      hackStage: item.hackStage || '',
      formId: item.formId || ''
    };
  }

  onChangeExtraField = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  saveFormFields = (itemId: string, stageId: string, formFields: JSON) => {
    client
      .mutate({
        mutation: gql(mutations.growthHacksSaveFormFields),
        variables: {
          _id: itemId,
          formFields,
          stageId
        }
      })
      .then(({ data }) => {
        if (data && data.growthHacksSaveFormFields) {
          this.setState({ formId: data.growthHacksSaveFormFields });
        }
      })
      .catch((e: Error) => {
        Alert.error(e.message);
      });
  };

  renderFormContent = ({
    state,
    onChangeAttachment,
    onChangeField,
    copy,
    remove
  }: IEditFormContent) => {
    const { item, users, options } = this.props;
    const {
      hackDescription,
      goal,
      formFields,
      priority,
      hackStage,
      formId
    } = this.state;

    const commonProp = {
      priority,
      hackDescription,
      hackStage,
      goal
    };

    const { name, stageId, description, closeDate, attachments } = state;

    const dateOnChange = date => onChangeField('closeDate', date);
    const priorityTrigger = (
      <ColorButton>
        <Icon icon="sort-amount-up" />
        Priority
      </ColorButton>
    );
    const hackStageTrigger = (
      <ColorButton>
        <Icon icon="diary" />
        Hack Stage
      </ColorButton>
    );

    const onClick = () => remove(item._id);
    const priorityOnChange = (value: string) =>
      this.onChangeExtraField('priority', value);
    const hackStageOnChange = (value: string) =>
      this.onChangeExtraField('hackStage', value);

    return (
      <>
        <Top
          {...commonProp}
          options={options}
          name={name}
          users={users}
          stageId={stageId}
          description={description}
          item={item}
          onChangeField={onChangeField}
          saveFormFields={this.saveFormFields}
          formFields={formFields}
          dueDate={
            closeDate && (
              <DueDateChanger
                isWarned={true}
                value={closeDate}
                onChange={dateOnChange}
              />
            )
          }
        />

        <FlexContent>
          <LeftContainer>
            <ActionContainer>
              <DueDateChanger value={closeDate} onChange={dateOnChange} />
              <SelectItem
                items={PRIORITIES}
                currentItem={priority}
                onChange={priorityOnChange}
                trigger={priorityTrigger}
              />
              <SelectItem
                items={HACKSTAGES}
                currentItem={hackStage}
                onChange={hackStageOnChange}
                trigger={hackStageTrigger}
              />
              <Watch item={item} options={options} isSmall={true} />
              <ColorButton onClick={copy}>
                <Icon icon="copy-1" />
                Copy
              </ColorButton>
              <ColorButton onClick={onClick}>
                <Icon icon="times-circle" />
                Delete
              </ColorButton>
            </ActionContainer>

            <Left
              {...commonProp}
              onChangeAttachment={onChangeAttachment}
              type={options.type}
              description={description}
              attachments={attachments}
              item={item}
              onChangeField={onChangeField}
              onChangeExtraField={this.onChangeExtraField}
              options={options}
            />
          </LeftContainer>

          <Right
            item={item}
            onChangeExtraField={this.onChangeExtraField}
            formFields={formFields}
            formId={formId}
          />
        </FlexContent>
      </>
    );
  };

  render() {
    const extendedProps = {
      ...this.props,
      formContent: this.renderFormContent,
      extraFields: this.state
    };

    return <EditForm {...extendedProps} />;
  }
}
