import { IBoard } from 'modules/boards/types';
import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import CommonForm from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __, generateRandomColorCode } from 'modules/common/utils';
import { FlexContent, FlexItem } from 'modules/layout/styles';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import {
  IEvent,
  IField,
  ISegment,
  ISegmentWithConditionDoc
} from 'modules/segments/types';
import ConditionsList from './ConditionsList';

import { ColorPick, ColorPicker } from 'modules/settings/styles';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { SegmentWrapper } from 'modules/segmentsOld/components/styles';

type Props = {
  contentType: string;
  fields: IField[];
  events: IEvent[];
  boards?: IBoard[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  edit?: (params: { _id: string; doc: ISegmentWithConditionDoc }) => void;
  segment?: ISegment;
  headSegments: ISegment[];
  segments: ISegment[];
  isForm?: boolean;
  closeModal?: () => void;
  afterSave?: () => void;
  fetchFields?: (pipelineId?: string) => void;

  isModal?: boolean;
};

type State = {
  _id?: string;
  name: string;
  description: string;
  subOf: string;
  color: string;

  segments: ISegment[];
};

class SegmentFormAutomations extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const segment: ISegment = props.segment || {
      name: '',
      description: '',
      subOf: '',
      color: generateRandomColorCode(),
      getConditionSegments: [
        {
          contentType: props.contentType || 'customer',
          conditionsConjunction: 'and'
        }
      ]
    };

    const segments = segment.getConditionSegments.map((item: ISegment) => ({
      key: Math.random().toString(),
      ...item
    }));

    this.state = { ...segment, segments };
  }

  renderSubOf(formProps: IFormProps) {
    const onChange = (e: React.FormEvent) =>
      this.handleChange('subOf', (e.currentTarget as HTMLInputElement).value);

    return (
      <FormGroup>
        <ControlLabel>Sub segment of</ControlLabel>
        <FormControl
          {...formProps}
          name="subOf"
          componentClass="select"
          value={this.state.subOf || ''}
          onChange={onChange}
        >
          <option value="">{__('Not selected')}</option>
          {this.props.headSegments.map(segment => (
            <option value={segment._id} key={segment._id}>
              {segment.name}
            </option>
          ))}
        </FormControl>
      </FormGroup>
    );
  }

  handleChange = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState(({ [name]: value } as unknown) as Pick<State, keyof State>);
  };

  renderDetailForm = (formProps: IFormProps) => {
    const { name, description, color } = this.state;

    const popoverTop = (
      <Popover id="color-picker">
        <TwitterPicker triangle="hide" />
      </Popover>
    );

    const nameOnChange = (e: React.FormEvent) =>
      this.handleChange('name', (e.currentTarget as HTMLInputElement).value);

    const descOnChange = (e: React.FormEvent) =>
      this.handleChange(
        'description',
        (e.currentTarget as HTMLInputElement).value
      );

    return (
      <>
        <FlexContent>
          <FlexItem count={5}>
            <FormGroup>
              <ControlLabel required={true}>Segment Name</ControlLabel>
              <FormControl
                {...formProps}
                name="name"
                value={name}
                onChange={nameOnChange}
                required={true}
                autoFocus={true}
              />
            </FormGroup>
          </FlexItem>
          <FlexItem count={3} hasSpace={true}>
            {this.renderSubOf(formProps)}
          </FlexItem>
        </FlexContent>
        <FlexContent>
          <FlexItem count={7}>
            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl
                {...formProps}
                name="description"
                value={description}
                onChange={descOnChange}
              />
            </FormGroup>
          </FlexItem>
          <FlexItem hasSpace={true}>
            <FormGroup>
              <ControlLabel>Color</ControlLabel>
              <div id="segment-color">
                <OverlayTrigger
                  trigger="click"
                  rootClose={true}
                  placement="bottom"
                  overlay={popoverTop}
                >
                  <ColorPick>
                    <ColorPicker style={{ backgroundColor: color }} />
                  </ColorPick>
                </OverlayTrigger>
              </div>
            </FormGroup>
          </FlexItem>
        </FlexContent>
      </>
    );
  };

  renderConditionsList = () => {
    const { contentType } = this.props;
    const { segments } = this.state;

    return segments.map((segment, index) => {
      return (
        <ConditionsList
          contentType={contentType}
          index={index}
          segment={segment}
        ></ConditionsList>
      );
    });
  };

  renderForm = (formProps: IFormProps) => {
    const { segment, renderButton, afterSave, closeModal } = this.props;

    const { isSubmitted } = formProps;

    return (
      <>
        {this.renderDetailForm(formProps)}
        {this.renderConditionsList()}

        <ModalFooter id="button-group">
          <Button.Group>
            <Button
              btnStyle="simple"
              type="button"
              icon="times-circle"
              onClick={closeModal}
            >
              Cancel
            </Button>

            {renderButton({
              name: 'segment',
              values: '',
              callback: closeModal || afterSave,
              isSubmitted,
              object: segment
            })}
          </Button.Group>
        </ModalFooter>
      </>
    );
  };

  render() {
    return (
      <SegmentWrapper>
        <CommonForm renderContent={this.renderForm} />
      </SegmentWrapper>
    );
  }
}

export default SegmentFormAutomations;
