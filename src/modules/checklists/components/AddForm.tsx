import {
  FormFooter,
  HeaderContent,
  HeaderRow
} from 'modules/boards/styles/item';
import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import ControlLabel from 'modules/common/components/form/Label';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import * as React from 'react';

type IProps = {
  itemId: string;
  type: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  afterSave?: () => void;
};

type State = {
  title: string;
};

class AddForm extends React.Component<IProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      title: 'Checklist'
    };
  }

  generateDoc = (values: {
    title: string;
    contentType: string;
    contentTypeId: string;
  }) => {
    const { itemId, type } = this.props;
    const { title } = this.state;

    const finalValues = values;

    return {
      title: finalValues.title || title,
      contentType: type,
      contentTypeId: itemId
    };
  };

  onChangeTitle = e =>
    this.setState({ title: (e.currentTarget as HTMLInputElement).value });

  close = () => {
    const { afterSave } = this.props;

    if (afterSave) {
      afterSave();
    }
  };

  handleFocus = event => event.target.select();

  renderContent = (formProps: IFormProps) => {
    const { renderButton } = this.props;
    const { isSubmitted, values } = formProps;

    return (
      <>
        <HeaderRow>
          <HeaderContent>
            <ControlLabel required={true}>Name</ControlLabel>
            <FormControl
              {...formProps}
              autoFocus={true}
              onChange={this.onChangeTitle}
              value={this.state.title}
              placeholder="Checklist"
              onFocus={this.handleFocus}
              name="title"
              required={true}
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

          {renderButton({
            values: this.generateDoc(values),
            isSubmitted,
            callback: this.close
          })}
        </FormFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default AddForm;
