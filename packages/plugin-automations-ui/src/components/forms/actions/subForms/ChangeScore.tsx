import React from 'react';
import { __, ControlLabel, FormGroup } from '@erxes/ui/src';
import Common from '@erxes/ui-automations/src/components/forms/actions/Common';
import FormControl from '@erxes/ui/src/components/form/Control';
import { DrawerDetail } from '@erxes/ui-automations/src/styles';

type Props = {
  closeModal: () => void;
  activeAction: any;
  triggerType: string;
  addAction: (action: any, actionId?: string, config?: any) => void;
  common: any;
};

type State = {
  config: any;
};

class ChangeScore extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { config } = this.props.activeAction;
    const fillConfig = config || {};

    this.state = {
      config: fillConfig
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeAction !== this.props.activeAction) {
      this.setState({ config: nextProps.activeAction.config });
    }
  }

  onChangeValue = e => {
    const { config } = this.state;
    config.changeScore = e.target.value;

    this.setState({ config });
  };

  renderContent() {
    const { config } = this.state;

    return (
      <DrawerDetail>
        <FormGroup>
          <ControlLabel>Change Score</ControlLabel>
          <FormControl
            type="number"
            onChange={this.onChangeValue}
            value={config.changeScore}
          />
        </FormGroup>
      </DrawerDetail>
    );
  }

  render() {
    return (
      <Common config={this.state.config} {...this.props}>
        {this.renderContent()}
      </Common>
    );
  }
}

export default ChangeScore;
