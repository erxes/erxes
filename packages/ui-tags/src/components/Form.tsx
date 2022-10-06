import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import Button from '@erxes/ui/src/components/Button';
import { COLORS } from '@erxes/ui/src/constants/colors';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ITag } from '../types';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import React from 'react';
import TwitterPicker from 'react-color/lib/Twitter';
import { colors } from '@erxes/ui/src/styles';
import { getRandomNumber } from '@erxes/ui/src/utils';
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
  tags: ITag[];
};

type State = {
  colorCode: string;
};

type IItem = {
  order?: string;
  name: string;
  _id: string;
};

class FormComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { tag } = this.props;

    this.state = {
      colorCode: tag ? tag.colorCode || '' : COLORS[getRandomNumber(7)]
    };
  }

  onColorChange = e => {
    this.setState({ colorCode: e.hex });
  };

  generateDoc = (values: { _id?: string; name: string; parentId?: string }) => {
    const { tag, type } = this.props;
    const finalValues = values;

    if (tag) {
      finalValues._id = tag._id;
    }

    return {
      _id: finalValues._id,
      name: finalValues.name,
      colorCode: this.state.colorCode,
      type,
      parentId: finalValues.parentId
    };
  };

  generateTagOptions = (tags: IItem[], currentTagId?: string) => {
    const result: React.ReactNode[] = [];

    for (const tag of tags) {
      const order = tag.order || '';

      const foundedString = order.match(/[/]/gi);

      let space = '';

      if (foundedString) {
        space = '\u00A0 '.repeat(foundedString.length);
      }

      if (currentTagId !== tag._id) {
        result.push(
          <option key={tag._id} value={tag._id}>
            {space}
            {tag.name}
          </option>
        );
      }
    }

    return result;
  };

  renderContent = (formProps: IFormProps) => {
    const { tag, closeModal, afterSave, renderButton, tags } = this.props;
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

        {tags && (
          <FormGroup>
            <ControlLabel>Parent Tag</ControlLabel>

            <FormControl
              {...formProps}
              name="parentId"
              componentClass="select"
              defaultValue={object.parentId}
            >
              <option value="" />
              {this.generateTagOptions(tags, object._id)}
            </FormControl>
          </FormGroup>
        )}

        <ModalFooter id={'AddTagButtons'}>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
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
