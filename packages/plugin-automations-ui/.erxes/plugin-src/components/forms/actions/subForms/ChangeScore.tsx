import React from 'react';
import { __, ControlLabel, FormGroup } from '@erxes/ui/src';
import styled from 'styled-components';
import { dimensions, colors } from '@erxes/ui/src/styles';
import Common from '../Common';
import FormControl from '@erxes/ui/src/components/form/Control';

export const DrawerDetail = styled.div`
  padding: ${dimensions.coreSpacing}px;
  border: 1px solid ${colors.borderPrimary};
  border-radius: 5px;
`;

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
      config: fillConfig,
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
