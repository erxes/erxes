import {
  AddContainer,
  FormFooter,
  HeaderContent,
  HeaderRow
} from 'modules/boards/styles/item';
import { IItem, IOptions } from 'modules/boards/types';
import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import ControlLabel from 'modules/common/components/form/Label';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { IChecklistDoc } from '../types';

type IProps = {
  item: IItem;
  options: IOptions;
  add: (doc: IChecklistDoc, callback: () => void) => void;
  afterSave?: () => void;
};

type State = {
  disabled: boolean;
  title: string;
};

class AddChecklistForm extends React.Component<IProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      disabled: false,
      title: 'Checklist'
    };
  }

  onChangeTitle = e =>
    this.setState({ title: (e.currentTarget as HTMLInputElement).value });

  close = () => {
    const { afterSave } = this.props;

    if (afterSave) {
      afterSave();
    }
  };

  onSubmit = e => {
    e.preventDefault();

    const { title } = this.state;
    const { add, options, item } = this.props;

    if (!title) {
      return Alert.error('Enter title');
    }

    // before save, disable save button
    this.setState({ disabled: true });

    const doc = {
      title,
      contentType: options.type,
      contentTypeId: item._id
    };

    add(doc, () => {
      // after save, enable save button
      this.setState({ disabled: false });

      this.close();
    });
  };

  handleFocus = event => event.target.select();

  render() {
    return (
      <AddContainer onSubmit={this.onSubmit}>
        <HeaderRow>
          <HeaderContent>
            <ControlLabel required={true}>Name</ControlLabel>
            <FormControl
              autoFocus={true}
              onChange={this.onChangeTitle}
              value={this.state.title}
              placeholder="Checklist"
              onFocus={this.handleFocus}
            />
          </HeaderContent>
        </HeaderRow>
        <FormFooter>
          <Button
            btnStyle="simple"
            icon="cancel-1"
            onClick={this.close}
            size="small"
          >
            Close
          </Button>

          <Button
            disabled={this.state.disabled}
            btnStyle="success"
            icon="checked-1"
            type="submit"
            size="small"
          >
            Save
          </Button>
        </FormFooter>
      </AddContainer>
    );
  }
}

export default AddChecklistForm;
