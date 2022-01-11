import { IUser } from 'modules/auth/types';
import DueDateChanger from 'modules/boards/components/DueDateChanger';
import EditForm from 'modules/boards/components/editForm/EditForm';
import {
  FlexContent,
  HeaderContentSmall,
  LeftContainer
} from 'modules/boards/styles/item';
import { IEditFormContent, IOptions } from 'modules/boards/types';
import { ControlLabel } from 'modules/common/components/form';
import { IFormSubmission } from 'modules/forms/types';
import React from 'react';
import { GrowthHackFieldName, IGrowthHack, IGrowthHackParams } from '../types';
import { Left, StageForm, Top } from './editForm/';
import Actions from './editForm/Actions';
import Score from './Score';

const reactiveFields = ['priority', 'hackStages', 'labels'];

type Props = {
  options: IOptions;
  item: IGrowthHack;
  users: IUser[];
  addItem: (doc: IGrowthHackParams, callback: () => void) => void;
  copyItem: (itemId: string, callback: () => void) => void;
  saveFormSubmission: (doc: IFormSubmission) => void;
  saveItem: (doc: IGrowthHackParams, callback?: (item) => void) => void;
  onUpdate: (item, prevStageId?: string) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  beforePopupClose: () => void;
  sendToBoard?: (item: any) => void;
};

type State = {
  refresh: boolean;
};

export default class GrowthHackEditForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      refresh: false
    };
  }

  onChangeExtraField = <T extends keyof IGrowthHack>(
    name: T,
    value: IGrowthHack[GrowthHackFieldName]
  ) => {
    if (reactiveFields.includes(name)) {
      this.props.saveItem({ [name]: value }, updatedItem => {
        this.props.onUpdate(updatedItem);
      });
    }
  };

  onChangeRefresh = () => {
    this.setState({
      refresh: !this.state.refresh
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
    const { saveItem, item } = this.props;

    const onChange = e => {
      const value = Number((e.target as HTMLInputElement).value);

      const confirmedValue = value > 10 ? 10 : value;

      const changedValue = { [e.target.name]: confirmedValue };

      saveItem(changedValue, updatedItem => {
        this.props.onUpdate(updatedItem);
      });
    };

    return (
      <Score
        reach={item.reach || 0}
        impact={item.impact || 0}
        confidence={item.confidence || 0}
        ease={item.ease || 0}
        onChange={onChange}
        scoringType={item.scoringType || 'ice'}
      />
    );
  };

  renderNumber = () => {
    const { item } = this.props;

    const { number } = item;

    if (!number) {
      return null;
    }

    return (
      <HeaderContentSmall>
        <ControlLabel>Number</ControlLabel>
        <p>{number}</p>
      </HeaderContentSmall>
    );
  };

  renderFormContent = ({
    copy,
    remove,
    saveItem,
    onChangeStage
  }: IEditFormContent) => {
    const {
      item,
      options,
      saveFormSubmission,
      onUpdate,
      addItem,
      sendToBoard
    } = this.props;

    const dateOnChange = date => saveItem({ closeDate: date });

    return (
      <>
        <Top
          options={options}
          item={item}
          saveItem={saveItem}
          dueDate={this.renderDueDate(item.closeDate, dateOnChange)}
          score={this.renderScore}
          onChangeStage={onChangeStage}
          number={this.renderNumber}
        />

        <FlexContent>
          <LeftContainer>
            <Actions
              onChangeField={this.onChangeExtraField}
              dateOnChange={dateOnChange}
              item={item}
              options={options}
              copy={copy}
              removeItem={remove}
              onUpdate={onUpdate}
              sendToBoard={sendToBoard}
              saveItem={saveItem}
              onChangeStage={onChangeStage}
              onChangeRefresh={this.onChangeRefresh}
            />
            <Left
              type={options.type}
              item={item}
              saveItem={saveItem}
              options={options}
              addItem={addItem}
            />
          </LeftContainer>

          <StageForm
            item={item}
            onChangeExtraField={this.onChangeExtraField}
            save={saveFormSubmission}
          />
        </FlexContent>
      </>
    );
  };

  render() {
    const extendedProps = {
      ...this.props,
      formContent: this.renderFormContent,
      extraFields: this.state,
      refresh: this.state.refresh
    };

    return <EditForm {...extendedProps} />;
  }
}
