import FilterableList from 'modules/common/components/filterableList/FilterableList';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import Popover from 'react-bootstrap/Popover';
import Form from '../../containers/label/Form';
import {
  Container,
  CreateButton,
  LabelWrapper,
  PipelineLabelList,
  Title
} from '../../styles/label';
import { IPipelineLabel } from '../../types';

type IOverlayProps = {
  selectedLabelIds: string[];
  labels: IPipelineLabel[];
  pipelineId: string;
  toggleConfirm: (callback?: () => void) => void;
  onSelectLabels: (selectedLabelIds: string[]) => void;
  onClose: () => void;
};

type IOverlayState = {
  showForm: boolean;
  labelId?: string;
};

export default class Overlay extends React.Component<
  IOverlayProps,
  IOverlayState
> {
  constructor(props: IOverlayProps) {
    super(props);

    this.state = {
      showForm: false
    };
  }

  onChangeForm = () => {
    this.setState({ showForm: !this.state.showForm });
  };

  onEdit = (labelId: string) => {
    this.setState({ labelId, showForm: true });
  };

  onCreate = () => {
    this.setState({ labelId: undefined, showForm: true });
  };

  onClose = () => {
    this.setState({ showForm: false }, this.props.onClose);
  };

  generateLabelsParams() {
    const { labels = [], selectedLabelIds } = this.props;

    return labels.map(({ _id, name, colorCode }) => {
      const count = (selectedLabelIds || []).includes(_id || '') ? 1 : 0;

      return {
        _id,
        title: name,
        style: { backgroundColor: colorCode },
        selectedBy: count === 1 ? 'all' : 'none',
        additionalIconOnClick: this.onEdit,
        additionalIconClass: 'edit'
      };
    });
  }

  onLabelClick = labels => {
    const selectedLabelIds: string[] = labels
      .filter(t => t.selectedBy === 'all')
      .map(t => t._id);

    this.props.onSelectLabels(selectedLabelIds);
  };

  renderList() {
    const props = {
      selectable: true,
      items: this.generateLabelsParams(),
      onClick: this.onLabelClick
    };

    return (
      <PipelineLabelList>
        <FilterableList {...props} />
      </PipelineLabelList>
    );
  }

  componentDidMount() {
    const elm = document.getElementById('filter-label');

    if (elm) {
      elm.className = 'popover bottom';
      elm.style.marginTop = '35px';
      elm.style.left = '-110px';
    }
  }

  renderPopover() {
    const { showForm, labelId } = this.state;
    const {
      pipelineId,
      toggleConfirm,
      selectedLabelIds,
      onSelectLabels
    } = this.props;

    return (
      <>
        <Container showForm={showForm}>
          <Form
            selectedLabelIds={selectedLabelIds}
            onSelectLabels={onSelectLabels}
            showForm={showForm}
            pipelineId={pipelineId}
            afterSave={this.onChangeForm}
            labelId={labelId}
            toggleConfirm={toggleConfirm}
          />
        </Container>

        <Container showForm={!showForm}>
          {this.renderList()}
          <CreateButton onClick={this.onCreate}>
            Create a new label
          </CreateButton>
        </Container>
      </>
    );
  }

  render() {
    const { labelId, showForm } = this.state;
    const title = labelId ? 'Edit label' : 'Create label';

    return (
      <Popover id="filter-label">
        <Title>
          {showForm && <Icon icon="leftarrow-3" onClick={this.onChangeForm} />}
          {showForm ? __(title) : __('Labels')}
          <Icon icon="cancel" onClick={this.onClose} />
        </Title>

        <LabelWrapper>{this.renderPopover()}</LabelWrapper>
      </Popover>
    );
  }
}
