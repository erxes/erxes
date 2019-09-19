import { IUser } from 'modules/auth/types';
import DueDateChanger from 'modules/boards/components/DueDateChanger';
import EditForm from 'modules/boards/components/editForm/EditForm';
import { FlexContent, LeftContainer } from 'modules/boards/styles/item';
import { IEditFormContent, IOptions } from 'modules/boards/types';
import { IFormSubmission } from 'modules/forms/types';
import React from 'react';
import { IGrowthHack, IGrowthHackParams } from '../types';
import { Left, StageForm, Top } from './editForm/';
import Actions from './editForm/Actions';
import Score from './Score';

const reactiveFields = ['priority', 'hackStages'];

type Props = {
  options: IOptions;
  item: IGrowthHack;
  users: IUser[];
  addItem: (doc: IGrowthHackParams, callback: () => void, msg?: string) => void;
  saveFormSubmission: (doc: IFormSubmission) => void;
  saveItem: (doc: IGrowthHackParams, callback?: (item) => void) => void;
  onUpdate: (item, prevStageId?: string) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  beforePopupClose: () => void;
};

type State = {
  formSubmissions: JSON;
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
      formSubmissions: item.formSubmissions || {},
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
    this.setState({ [name]: value } as Pick<State, keyof State>, () => {
      if (reactiveFields.includes(name)) {
        this.props.saveItem({ [name]: value }, updatedItem => {
          this.props.onUpdate(updatedItem);
        });
      }
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
    const { saveItem, item } = this.props;

    const onChange = e => {
      const value = Number((e.target as HTMLInputElement).value);
      const confirmedValue = value > 10 ? 10 : value;

      const changedValue = { [e.target.name]: confirmedValue };

      this.setState(changedValue as Pick<State, keyof State>);
    };

    const onExited = () => {
      saveItem(
        {
          impact,
          confidence,
          ease,
          reach
        },
        updatedItem => {
          this.props.onUpdate(updatedItem);
        }
      );
    };

    return (
      <Score
        reach={reach}
        impact={impact}
        confidence={confidence}
        ease={ease}
        onChange={onChange}
        onExited={onExited}
        scoringType={item.scoringType || 'ice'}
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
    const { item, options, saveFormSubmission } = this.props;
    const { formSubmissions, priority, hackStages, formId } = this.state;

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
            />
            <Left
              {...this.state}
              onChangeAttachment={onChangeAttachment}
              type={options.type}
              description={description}
              attachments={attachments}
              item={item}
              onChangeField={onChangeField}
              options={options}
              assignedUserIds={assignedUserIds}
              onBlurFields={onBlurFields}
            />
          </LeftContainer>

          <StageForm
            item={item}
            onChangeExtraField={this.onChangeExtraField}
            save={saveFormSubmission}
            formSubmissions={formSubmissions}
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
