import client from 'apolloClient';
import gql from 'graphql-tag';
import { IUser } from 'modules/auth/types';
import DueDateChanger from 'modules/boards/components/DueDateChanger';
import EditForm from 'modules/boards/components/editForm/EditForm';
import { FlexContent, LeftContainer } from 'modules/boards/styles/item';
import { IEditFormContent, IOptions } from 'modules/boards/types';
import { Alert } from 'modules/common/utils';
import React from 'react';
import { mutations } from '../graphql';
import { IGrowthHack, IGrowthHackParams } from '../types';
import { Left, Right, Top } from './editForm/';
import Actions from './editForm/Actions';

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
    const { formFields, priority, hackStage, formId } = this.state;

    const { name, stageId, description, closeDate, attachments } = state;

    const dateOnChange = date => onChangeField('closeDate', date);

    return (
      <>
        <Top
          {...this.state}
          options={options}
          name={name}
          users={users}
          stageId={stageId}
          description={description}
          item={item}
          onChangeField={onChangeField}
          saveFormFields={this.saveFormFields}
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
            <Actions
              priority={priority}
              hackStage={hackStage}
              onChangeField={this.onChangeExtraField}
              closeDate={closeDate}
              dateOnChange={dateOnChange}
              item={item}
              options={options}
              copy={copy}
              remove={remove}
            />
            <Left
              {...this.state}
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
