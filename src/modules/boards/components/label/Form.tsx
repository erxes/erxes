import { COLORS } from 'modules/boards/constants';
import Button from 'modules/common/components/Button';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components/form';
import Form from 'modules/common/components/form/Form';
import Icon from 'modules/common/components/Icon';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { BackgroundSelector } from 'modules/leads/components/step/style';
import * as React from 'react';
import { ChooseColor, FormContainer } from '../../styles/label';
import { IPipelineLabel } from '../../types';

type IProps = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  afterSave: () => void;
  remove: (id: string) => void;
  label?: IPipelineLabel;
  showForm: boolean;
};

type State = {
  label: IPipelineLabel;
};

class FormComponent extends React.Component<IProps, State> {
  static getDerivedStateFromProps(nextProps, prevState) {
    const { label } = nextProps;
    const prevLabel = prevState.label;

    const defaultLabel = { colorCode: COLORS[0], name: '' };

    if (
      (label && label._id !== prevLabel._id) ||
      (!label && prevLabel === defaultLabel)
    ) {
      return {
        label: nextProps.label || {
          colorCode: COLORS[0],
          name: ''
        }
      };
    }

    return null;
  }

  constructor(props: IProps) {
    super(props);

    const { label } = props;

    this.state = {
      label: label ? { ...label } : this.getDefaultLabel()
    };
  }

  getDefaultLabel() {
    return { colorCode: COLORS[0], name: '' };
  }

  componentDidUpdate(prevProps) {
    const { label } = this.props;

    if (prevProps.label !== label && label) {
      this.setState({ label });
    }

    // clear form if form hide
    if (prevProps.showForm !== this.props.showForm) {
      this.setState({ label: this.getDefaultLabel() });
    }
  }

  onChangeColorCode = (colorCode: string) => {
    const { label } = this.state;

    label.colorCode = colorCode;

    this.setState({ label });
  };

  onNameChange = (e: React.FormEvent<HTMLElement>) => {
    const label = { ...this.state.label };

    label.name = (e.currentTarget as HTMLButtonElement).value;

    this.setState({ label });
  };

  onRemove = () => {
    const { remove, label } = this.props;

    if (label && label._id) {
      remove(label._id);
    }
  };

  renderColors(colorCode: string) {
    const onClick = () => this.onChangeColorCode(colorCode);
    const { label } = this.state;

    return (
      <BackgroundSelector
        key={colorCode}
        selected={label.colorCode === colorCode}
        onClick={onClick}
      >
        <div style={{ backgroundColor: colorCode }}>
          <Icon icon="check" />
        </div>
      </BackgroundSelector>
    );
  }

  renderContent = (formProps: IFormProps) => {
    const { renderButton, afterSave } = this.props;
    const { label } = this.state;
    const { isSubmitted } = formProps;

    return (
      <FormContainer>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            value={label ? label.name : ''}
            onChange={this.onNameChange}
            required={true}
            autoFocus={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>Select a color</ControlLabel>
          <ChooseColor>
            {COLORS.map(colorCode => this.renderColors(colorCode))}
          </ChooseColor>
        </FormGroup>
        <ModalFooter>
          {label._id && (
            <Button
              btnStyle="danger"
              type="button"
              size="small"
              icon="cancel-1"
              onClick={this.onRemove}
            >
              Delete
            </Button>
          )}

          {renderButton({
            name: 'label',
            values: {
              name: label.name,
              colorCode: label.colorCode
            },
            isSubmitted,
            callback: afterSave,
            object: label || {}
          })}
        </ModalFooter>
      </FormContainer>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default FormComponent;
