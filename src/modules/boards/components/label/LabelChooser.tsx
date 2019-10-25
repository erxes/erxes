import { RightButton } from 'modules/boards/styles/item';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { OverlayTrigger } from 'react-bootstrap';
import { ChooseLabelWrapper } from '../../styles/label';
import { IPipelineLabel } from '../../types';
import Overlay from './Overlay';

type Props = {
  pipelineId: string;
  selectedLabelIds: string[];
  labels: IPipelineLabel[];
  type: string;
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
  };

  renderOverlay() {
    const { labels, type, toggleConfirm, pipelineId } = this.props;
    const { selectedLabelIds } = this.state;

    const props = {
      pipelineId,
      selectedLabelIds,
      labels,
      toggleConfirm,
      type,
      onClose: this.onOverlayClose,
      onSelectLabels: this.onSelectLabels
    };

    return <Overlay {...props} />;
  }

  onExit = () => {
    this.props.doLabel(this.state.selectedLabelIds);
  };

  render() {
    return (
      <ChooseLabelWrapper>
        <OverlayTrigger
          ref={overlayTrigger => {
            this.overlayTrigger = overlayTrigger;
          }}
          trigger="click"
          placement="bottom"
          shouldUpdatePosition={true}
          overlay={this.renderOverlay()}
          rootClose={!this.props.isConfirmVisible}
          container={this}
          onExited={this.onExit}
        >
          <RightButton icon="tag">{__('Labels')}</RightButton>
        </OverlayTrigger>
      </ChooseLabelWrapper>
    );
  }
}

export default ChooseLabel;
