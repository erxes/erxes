import { IUser } from 'modules/auth/types';
import EditForm from 'modules/boards/components/editForm/EditForm';
import { FlexContent } from 'modules/boards/styles/item';
import { IEditFormContent, IOptions } from 'modules/boards/types';
import React from 'react';
import { IFormField, IGrowthHack, IGrowthHackParams } from '../types';
import { Left, Right, Top } from './editForm/';

type Props = {
  options: IOptions;
  item: IGrowthHack;
  users: IUser[];
  addItem: (doc: IGrowthHackParams, callback: () => void, msg?: string) => void;
  saveItem: (doc: IGrowthHackParams, callback: () => void) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  closeModal: () => void;
};

type State = {
  hackDescription: string;
  goal: string;
  formFields: IFormField;
};

export default class GrowthHackEditForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const item = props.item;

    this.state = {
      hackDescription: item.hackDescription || '',
      goal: item.goal || '',
      formFields: item.formFields || {}
    };
  }

  onChangeExtraField = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  renderFormContent = ({
    state,
    onChangeAttachment,
    onChangeField,
    copy,
    remove
  }: IEditFormContent) => {
    const { item, users, options } = this.props;
    const { hackDescription, goal, formFields } = this.state;

    const { name, stageId, description, closeDate, attachments } = state;

    return (
      <>
        <Top
          options={options}
          name={name}
          closeDate={closeDate}
          users={users}
          stageId={stageId}
          description={description}
          item={item}
          onChangeField={onChangeField}
        />

        <FlexContent>
          <Left
            onChangeAttachment={onChangeAttachment}
            type={options.type}
            description={description}
            attachments={attachments}
            item={item}
            onChangeField={onChangeField}
            onChangeExtraField={this.onChangeExtraField}
            hackDescription={hackDescription}
            goal={goal}
          />

          <Right
            options={options}
            item={item}
            copyItem={copy}
            removeItem={remove}
            onChangeExtraField={this.onChangeExtraField}
            formFields={formFields}
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
