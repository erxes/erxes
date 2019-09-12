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
import Score from './Score';

type Props = {
  options: IOptions;
  item: IGrowthHack;
  users: IUser[];
  addItem: (doc: IGrowthHackParams, callback: () => void, msg?: string) => void;
  saveItem: (doc: IGrowthHackParams, callback?: (item) => void) => void;
  onUpdate: (item, prevStageId?: string) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  beforePopupClose: () => void;
};

type State = {
  hackDescription: string;
  goal: string;
  formFields: JSON;
  formId: string;
  priority: string;
  hackStages: string[];
  impact: number;
  ease: number;
  confidence: number;
  reach: number;
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
      hackStages: item.hackStages || [],
      formId: item.formId || '',
      impact: item.impact || 0,
      confidence: item.confidence || 0,
      ease: item.ease || 0,
      reach: item.reach || 0
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

  renderDueDate = (closeDate, onDateChange: (date) => void) => {
    if (!closeDate) {
      return null;
    }

    return (
      <DueDateChanger
        isWarned={true}
        value={closeDate}
        onChange={onDateChange}
      />
    );
  };

  renderScore = () => {
    const { reach, impact, confidence, ease } = this.state;

    const onChange = e => {
      const value = Number((e.target as HTMLInputElement).value);
      const confirmedValue = value > 10 ? 10 : value;

      this.setState({ [e.target.name]: confirmedValue } as Pick<
        State,
        keyof State
      >);
    };

    return (
      <Score
        reach={reach}
        impact={impact}
        confidence={confidence}
        ease={ease}
        onChange={onChange}
        scoringType={this.props.item.scoringType || 'ice'}
      />
    );
  };

  renderFormContent = ({
    state,
    onChangeAttachment,
    onChangeField,
    copy,
    remove,
    onBlurFields
  }: IEditFormContent) => {
    const { item, options, saveItem } = this.props;
    const { formFields, priority, hackStages, formId } = this.state;

    const {
      name,
      stageId,
      description,
      closeDate,
      attachments,
      assignedUserIds
    } = state;

    const dateOnChange = date => onChangeField('closeDate', date);

    return (
      <>
        <Top
          {...this.state}
          options={options}
          name={name}
          stageId={stageId}
          item={item}
          onChangeField={onChangeField}
          saveFormFields={this.saveFormFields}
          dueDate={this.renderDueDate(closeDate, dateOnChange)}
          score={this.renderScore}
          onBlurFields={onBlurFields}
        />

        <FlexContent>
          <LeftContainer>
            <Actions
              priority={priority}
              hackStages={hackStages}
              onChangeField={this.onChangeExtraField}
              closeDate={closeDate}
              dateOnChange={dateOnChange}
              item={item}
              options={options}
              copy={copy}
              remove={remove}
              saveItem={saveItem}
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
              assignedUserIds={assignedUserIds}
              onBlurFields={onBlurFields}
            />
          </LeftContainer>

          <Right
            item={item}
            onChangeExtraField={this.onChangeExtraField}
            saveItem={saveItem}
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
