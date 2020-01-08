import { ColorButton } from 'modules/boards/styles/common';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { ChooseLabelWrapper } from '../../styles/label';
import { IPipelineLabel } from '../../types';
import Overlay from './Overlay';

type Props = {
  pipelineId: string;
  selectedLabelIds: string[];
  labels: IPipelineLabel[];
  doLabel: (labelIds: string[]) => void;
  isConfirmVisible: boolean;
  toggleConfirm: (callback?: () => void) => void;
};

class ChooseLabel extends React.Component<
  Props,
  { selectedLabelIds: string[] }
> {
  private overlayTrigger;

  constructor(props) {
    super(props);

    this.state = { selectedLabelIds: props.selectedLabelIds };
  }

  componentWillReceiveProps(nextProps: Props) {
    if (
      this.props.selectedLabelIds.toString() !==
      nextProps.selectedLabelIds.toString()
    ) {
      this.setState({ selectedLabelIds: nextProps.selectedLabelIds });
    }
  }

  onOverlayClose = () => {
    this.overlayTrigger.hide();
  };

  onSelectLabels = (selectedLabelIds: string[]) => {
    this.setState({ selectedLabelIds });

    this.props.doLabel(selectedLabelIds);
  };

  renderOverlay() {
    const { labels, toggleConfirm, pipelineId } = this.props;
    const { selectedLabelIds } = this.state;

    const props = {
      pipelineId,
      selectedLabelIds,
      labels,
      toggleConfirm,
      onClose: this.onOverlayClose,
      onSelectLabels: this.onSelectLabels
    };

    return <Overlay {...props} />;
  }

  render() {
    return (
      <ChooseLabelWrapper>
        <OverlayTrigger
          ref={overlayTrigger => {
            this.overlayTrigger = overlayTrigger;
          }}
          trigger="click"
          placement="bottom"
          overlay={this.renderOverlay()}
          rootClose={!this.props.isConfirmVisible}
          container={this}
        >
          <ColorButton>
            <Icon icon="tag-alt" />
            {__('Labels')}
          </ColorButton>
        </OverlayTrigger>
      </ChooseLabelWrapper>
    );
  }
}

export default ChooseLabel;
