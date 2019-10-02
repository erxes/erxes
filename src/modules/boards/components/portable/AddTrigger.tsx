import AddForm from 'modules/boards/containers/portable/AddForm';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import React from 'react';
import { IOptions } from '../../types';

type Props = {
  relType: string;
  relTypeIds?: string[];
  assignedUserIds?: string[];
  options: IOptions;
  refetch?: () => void;
};

export default (props: Props) => {
  const { relType, relTypeIds, options, refetch, assignedUserIds } = props;

  const trigger = <a href="#title">{options.texts.addText}</a>;

  const content = formProps => (
    <AddForm
      options={options}
      {...formProps}
      refetch={refetch}
      relType={relType}
      relTypeIds={relTypeIds}
      assignedUserIds={assignedUserIds}
      showSelect={true}
    />
  );

  return (
    <ModalTrigger
      title={options.texts.addText}
      trigger={trigger}
      content={content}
    />
  );
};
