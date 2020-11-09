import { COLORS } from 'modules/boards/constants';
import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { colors } from 'modules/common/styles';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { getRandomNumber } from 'modules/common/utils';
import { ITag } from 'modules/tags/types';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import styled from 'styled-components';

const ColorPick = styled.div`
  margin-top: 10px;
  border-radius: 4px;
  padding: 2px;
  border: 1px solid ${colors.borderDarker};
  cursor: pointer;
`;

const ColorPicker = styled.div`
  width: 100%;
  height: 20px;
  border-radius: 2px;
`;

type Props = {
  tag?: ITag;
  type: string;
  afterSave: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal?: () => void;
};

type State = {
  colorCode: string;
};

class FormComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { tag } = this.props;

    this.state = {
      colorCode: tag ? tag.colorCode : COLORS[getRandomNumber(7)]
    };
  }

  onColorChange = e => {
    this.setState({ colorCode: e.hex });
  };

  generateDoc = (values: { _id?: string; name: string }) => {
    const { tag, type } = this.props;
    const finalValues = values;

    if (tag) {
      finalValues._id = tag._id;
    }

    return {
      _id: finalValues._id,
      name: finalValues.name,
      colorCode: this.state.colorCode,
      type
    };
  };

  renderContent = (formProps: IFormProps) => {
    const { tag, closeModal, afterSave, renderButton } = this.props;
    const { values, isSubmitted } = formProps;
    const { colorCode } = this.state;
    const object = tag || ({} as ITag);

    const popoverContent = (
      <Popover id="color-picker">
        <TwitterPicker
          width="266px"
          color={colorCode}
          onChange={this.onColorChange}
          colors={COLORS}
        />
      </Popover>
    );

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            defaultValue={object.name}
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Color</ControlLabel>
          <OverlayTrigger
            trigger="click"
            rootClose={true}
            placement="bottom"
            overlay={popoverContent}
          >
            <ColorPick>
              <ColorPicker style={{ backgroundColor: colorCode }} />
            </ColorPick>
          </OverlayTrigger>
        </FormGroup>

        <ModalFooter id={'AddTagButtons'}>
          <Button
            btnStyle="simple"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Cancel
          </Button>

          {renderButton({
            name: 'tag',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal || afterSave,
            object: tag
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default FormComponent;
