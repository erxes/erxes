import * as React from 'react';
import { Label, LabelList } from '../../styles/label';
import { IPipelineLabel } from '../../types';

type IProps = {
  labels: IPipelineLabel[];
  indicator?: boolean;
};

class Labels extends React.Component<IProps> {
  renderContent(label: IPipelineLabel) {
    const { indicator } = this.props;

    return (
      <Label key={label._id} color={label.colorCode} isIndicator={indicator}>
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
