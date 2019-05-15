import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { Alert, generateRandomColorCode } from 'modules/common/utils';
import { StepFormWrapper } from 'modules/engage/styles';
import * as React from 'react';

type Props = {
  create: (
    params: {
      doc: {
        name: string;
        description: string;
        colorCode: string;
      };
    }
  ) => void;
  createTag: (value: boolean) => void;
};

type State = {
  name: string;
  description: string;
  colorCode: string;
};

class TagsForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      description: '',
      colorCode: generateRandomColorCode() || ''
    };
  }

  save = e => {
    e.preventDefault();

    const { create, createTag } = this.props;
    const { name, description, colorCode } = this.state;

    if (name.length === 0) {
      return Alert.error('Please insert a tag name');
    }

    if (description.length === 0) {
      return Alert.error('Please insert a tag description');
    }

    if (colorCode.length === 0) {
      return Alert.error('Please choose a tag color code');
    }

    create(this.generateDoc());
    createTag(false);
  };

  generateDoc = () => {
    return {
      doc: {
        name: (document.getElementById('tag-name') as HTMLInputElement).value,
        description: (document.getElementById(
          'tag-description'
        ) as HTMLInputElement).value,
        colorCode: (document.getElementById(
          'tag-colorCode'
        ) as HTMLInputElement).value
      }
    };
  };

  handleChange = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  renderContent() {
    const onChangeName = e =>
      this.handleChange('name', (e.target as HTMLInputElement).value);

    const onChangeDesc = e =>
      this.handleChange('description', (e.target as HTMLInputElement).value);

    const onChangeColor = e =>
      this.handleChange('colorCode', (e.target as HTMLInputElement).value);

    return (
      <div>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl
            id="tag-name"
            type="text"
            required={true}
            onChange={onChangeName}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>

          <FormControl
            id="tag-description"
            componentClass="textarea"
            onChange={onChangeDesc}
            rows={5}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Color code</ControlLabel>
          <FormControl
            type="color"
            onChange={onChangeColor}
            id="tag-colorCode"
          />
        </FormGroup>
      </div>
    );
  }

  renderForm() {
    return (
      <form onSubmit={this.save}>
        {this.renderContent()}
        <Button btnStyle="success" icon="checked-1" type="submit">
          Save
        </Button>
      </form>
    );
  }

  render() {
    return <StepFormWrapper>{this.renderForm()}</StepFormWrapper>;
  }
}

export default TagsForm;
