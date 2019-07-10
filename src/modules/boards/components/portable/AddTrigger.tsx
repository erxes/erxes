import AddForm from 'modules/boards/containers/portable/AddForm';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import React from 'react';
import { IOptions } from '../../types';

type Props = {
  customerIds?: string[];
  options: IOptions;
};

export default (props: Props) => {
  const { customerIds, options } = props;

  const trigger = <a href="#title">{options.title}</a>;

  const content = formProps => (
    <AddForm
      options={options}
      {...formProps}
      customerIds={customerIds}
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
