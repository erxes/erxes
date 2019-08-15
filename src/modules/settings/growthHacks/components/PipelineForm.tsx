import { IPipeline, IStage } from 'modules/boards/types';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import PipelineForm from 'modules/settings/boards/components/PipelineForm';
import React from 'react';

type Props = {
  type: string;
  show: boolean;
  boardId: string;
  pipeline?: IPipeline;
  stages?: IStage[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  options?: any;
};

type State = {
  hackScoringType: string;
};

class GrowthHackPipelineForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { pipeline } = this.props;

    this.state = {
      hackScoringType: pipeline ? pipeline.hackScoringType : ''
    };
  }

  onChangeType = (e: React.FormEvent<HTMLElement>) => {
    this.setState({
      hackScoringType: (e.currentTarget as HTMLInputElement).value
    });
  };

  render() {
    const renderExtraFields = (formProps: IFormProps) => {
      return (
        <FormGroup>
          <ControlLabel required={true}>Type</ControlLabel>
          <FormControl
            {...formProps}
            name="hackScoringType"
            componentClass="select"
            value={this.state.hackScoringType}
            onChange={this.onChangeType}
          >
            <option value="ice">{__('Ice')}</option>
            <option value="rice">{__('Rice')}</option>
          </FormControl>
        </FormGroup>
      );
    };

    const extendedProps = {
      ...this.props,
      renderExtraFields,
      extraFields: this.state
    };

    return <PipelineForm {...extendedProps} />;
  }
}

export default GrowthHackPipelineForm;
