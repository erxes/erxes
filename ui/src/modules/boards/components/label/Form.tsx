import Button from 'modules/common/components/Button';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components/form';
import Form from 'modules/common/components/form/Form';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import * as React from 'react';
import { IPipelineLabel } from '../../types';
import TwitterPicker from 'react-color/lib/Twitter';
import { ColorChooserWrapper } from 'modules/boards/styles/label';
import { COLORS } from 'modules/boards/constants';

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

  onChangeColorCode = (e: any) => {
    const { label } = this.state;

    label.colorCode = e.hex;

    this.setState({ label });
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, afterSave } = this.props;
    const { label } = this.state;
    const { isSubmitted } = formProps;

    return (
      <>
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
          <ColorChooserWrapper>
            <TwitterPicker
              colors={COLORS}
              onChange={this.onChangeColorCode}
              triangle="hide"
            />
          </ColorChooserWrapper>
        </FormGroup>

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
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default FormComponent;
