import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import { __ } from '@erxes/ui/src/utils';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { isEnabled } from '@erxes/ui/src/utils/core';

const ManageColumns = asyncComponent(() =>
  import(
    /* webpackChunkName: "ManageColumns" */ '@erxes/ui-forms/src/settings/properties/containers/ManageColumns'
  )
);

type Props = {
  currentType: string;
};

class ColumnChooser extends React.Component<Props> {
  render() {
    if (!isEnabled('forms')) return null;

    const manageColumns = props => {
      return (
        <ManageColumns
          {...props}
          contentType={this.props.currentType}
          type={'import'}
          isImport={true}
        />
      );
    };

    const editColumns = <span>{__(`Download template`)}</span>;

    return (
      <ModalTrigger
        title="Select Columns"
        trigger={editColumns}
        content={manageColumns}
        autoOpenKey="showManageColumnsModal"
      />
    );
  }
}

export default ColumnChooser;
