import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import ForumSelect from '../../containers/common/DiscussionSelect';
import {
  MoveContainer,
  MoveFormContainer,
  PipelineName,
  PipelinePopoverContent
} from 'modules/boards/styles/item';

type Props = {
  onChangeConnection: (discussionId: string) => void;
  queryParams: any;
  history: any;
};

type State = {
  show: boolean;
};

class ItemChooser extends React.Component<Props, State> {
  private ref;

  constructor(props) {
    super(props);

    this.ref = React.createRef();

    this.state = {
      show: false
    };
  }

  toggleForm = () => {
    this.setState({ show: !this.state.show });
  };

  renderForumSelect() {
    const { onChangeConnection, queryParams, history } = this.props;

    return (
      <Popover id="pipeline-popover">
        <PipelinePopoverContent>
          <ForumSelect
            callback={this.toggleForm}
            onChangeConnection={onChangeConnection}
            queryParams={queryParams}
            history={history}
          />
        </PipelinePopoverContent>
      </Popover>
    );
  }

  renderMoveOut() {
    return (
      <MoveFormContainer innerRef={this.ref}>
        <OverlayTrigger
          trigger="click"
          placement="bottom-start"
          overlay={this.renderForumSelect()}
          rootClose={true}
          container={this.ref.current}
        >
          <PipelineName onClick={this.toggleForm}>
            {__('Choose discussion')}
            <Icon icon="angle-down" />
          </PipelineName>
        </OverlayTrigger>
      </MoveFormContainer>
    );
  }
  render() {
    return <MoveContainer>{this.renderMoveOut()}</MoveContainer>;
  }
}
export default ItemChooser;
