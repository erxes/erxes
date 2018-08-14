import React from 'react';
import Select from 'react-select-plus';
import PropTypes from 'prop-types';
import { ModalTrigger, EmptyState } from 'modules/common/components';

const propTypes = {
  onSave: PropTypes.func.isRequired,
  object: PropTypes.object.isRequired,
  searchObject: PropTypes.func,
  mergeForm: PropTypes.node,
  options: PropTypes.array,
  generateOptions: PropTypes.func
};

class TargetMergeModal extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      objects: [],
      selectedObject: {}
    };

    this.onSelect = this.onSelect.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }

  handleSearch(value) {
    this.props.searchObject(value, objects => this.setState({ objects }));
  }

  onSelect(option) {
    this.setState({ selectedObject: JSON.parse(option.value) });
  }

  renderMerger() {
    const { object, onSave, mergeForm } = this.props;
    const { selectedObject } = this.state;

    if (!selectedObject._id)
      return <EmptyState icon="search" text="Please select one to merge" />;

    const MergeForm = mergeForm;

    return <MergeForm objects={[object, selectedObject]} save={onSave} />;
  }

  renderSelect() {
    const { objects } = this.state;
    const { generateOptions } = this.props;

    return (
      <Select
        placeholder="Search"
        onInputChange={this.handleSearch}
        onFocus={() => objects.length < 1 && this.handleSearch('')}
        onChange={this.onSelect}
        options={generateOptions(objects)}
      />
    );
  }

  render() {
    const { __ } = this.context;

    return (
      <ModalTrigger
        title={__('Merge')}
        trigger={<a>{__('Merge')}</a>}
        size="lg"
      >
        {this.renderSelect()}
        <br />
        {this.renderMerger()}
      </ModalTrigger>
    );
  }
}

TargetMergeModal.propTypes = propTypes;
TargetMergeModal.contextTypes = {
  __: PropTypes.func
};

export default TargetMergeModal;
