import { EmptyState, ModalTrigger } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { ICustomer } from 'modules/customers/types';
import * as React from 'react';
import Select from 'react-select-plus';

type Props = {
  object: any;
  searchObject: (value: string, callback: (objects: any[]) => void) => void;
  mergeForm: any;
  generateOptions: (objects: any[]) => void;
  onSave: (doc: { ids: string[]; data: ICustomer }) => void;
};

type State = {
  objects: any[];
  selectedObject: any;
};

class TargetMergeModal extends React.Component<Props, State> {
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

  renderMerger({ closeModal }) {
    const { object, onSave, mergeForm } = this.props;
    const { selectedObject } = this.state;

    if (!selectedObject._id)
      return <EmptyState icon="search" text="Please select one to merge" />;

    const MergeForm = mergeForm;

    return (
      <MergeForm
        objects={[object, selectedObject]}
        save={onSave}
        closeModal={closeModal}
      />
    );
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
    return (
      <ModalTrigger
        title={__('Merge')}
        trigger={<a>{__('Merge')}</a>}
        size="lg"
        content={props => {
          return (
            <React.Fragment>
              {this.renderSelect()}
              <br />
              {this.renderMerger(props)}
            </React.Fragment>
          );
        }}
      />
    );
  }
}

export default TargetMergeModal;
