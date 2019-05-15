import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { StepFormWrapper } from 'modules/engage/styles';
import * as React from 'react';

type Props = {
  create: (params: { doc: { name: string; description: string } }) => void;
  createBrand: (value: boolean) => void;
};

type State = {
  name: string;
  description: string;
};

class BrandForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      description: ''
    };
  }

  save = e => {
    e.preventDefault();

    const { create, createBrand } = this.props;
    const { name, description } = this.state;

    if (name.length === 0) {
      return Alert.error('Please insert a brand name');
    }

    if (description.length === 0) {
      return Alert.error('Please insert a description');
    }

    create(this.generateDoc());
    createBrand(false);
  };

  generateDoc = () => {
    return {
      doc: {
        name: (document.getElementById('brand-name') as HTMLInputElement).value,
        description: (document.getElementById(
          'brand-description'
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

    return (
      <div>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl
            id="brand-name"
            type="text"
            required={true}
            onChange={onChangeName}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>

          <FormControl
            id="brand-description"
            componentClass="textarea"
            onChange={onChangeDesc}
            rows={5}
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

export default BrandForm;
