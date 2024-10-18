import React, { useState } from 'react';

import EmptyState from '@erxes/ui/src/components/EmptyState';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Select from 'react-select';
import { __ } from '@erxes/ui/src/utils';
import debounce from 'lodash/debounce';

type Props = {
  object: any;
  searchObject: (value: string, callback: (objects: any[]) => void) => void;
  mergeForm: any;
  generateOptions: (objects: any[]) => void;
  onSave: (doc: { ids: string[]; data: any }) => void;
};

const TargetMergeModal: React.FC<Props> = ({
  object,
  searchObject,
  mergeForm,
  generateOptions,
  onSave,
}) => {
  const [objects, setObjects] = useState<any[]>([]);
  const [selectedObject, setSelectedObject] = useState<any>({});

  const handleSearch = (value: string) => {
    debounce(() => {
      searchObject(value, (objs) => setObjects(objs));
    }, 1000)();
  };

  const onSelect = (option: any) => {
    setSelectedObject(JSON.parse(option.value));
  };

  const renderMerger = ({ closeModal }: { closeModal: () => void }) => {
    if (!selectedObject._id) {
      return <EmptyState icon="search" text="Please select one to merge" />;
    }

    const MergeForm = mergeForm;

    return (
      <MergeForm
        objects={[object, selectedObject]}
        save={onSave}
        closeModal={closeModal}
      />
    );
  };

  const handleChildClick = (event) => {
    event.stopPropagation();
  };

  const renderSelect = () => {
    return (
      <Select
        placeholder="Search"
        onInputChange={(value) => handleSearch(value)}
        onKeyDown={(event) => handleChildClick(event)}
        onFocus={() => handleSearch('')}
        onChange={onSelect}
        isClearable={true}
        options={generateOptions(objects) as any}
      />
    );
  };

  const modalContent = (props: { closeModal: () => void }) => {
    return (
      <React.Fragment>
        {renderSelect()}
        <br />
        {renderMerger(props)}
      </React.Fragment>
    );
  };

  return (
    <ModalTrigger
      title={__('Merge')}
      trigger={<a>{__('Merge')}</a>}
      size="lg"
      content={modalContent}
    />
  );
};

export default TargetMergeModal;
