import * as React from 'react';
import { Label, LabelList } from '../../styles/label';
import { IPipelineLabel } from '../../types';

type IProps = {
  labels: IPipelineLabel[];
  indicator?: boolean;
};

class Labels extends React.Component<IProps, { indicator?: boolean }> {
  constructor(props) {
    super(props);

    this.state = {
      indicator: props.indicator || false
    };
  }

  toggleIndicator = () => {
    this.setState({
      indicator: !this.state.indicator
    });
  };

  renderContent(label: IPipelineLabel) {
    const { indicator } = this.state;

    return (
      <Label
        onClick={this.toggleIndicator}
        key={label._id}
        color={label.colorCode}
        isIndicator={indicator}
      >
        {!indicator && label.name}
      </Label>
    );
  }

  render() {
    const { labels } = this.props;

    if (!labels || labels.length === 0) {
      return null;
    }

    return (
      <LabelList>{labels.map(label => this.renderContent(label))}</LabelList>
    );
  }
}

export default Labels;
