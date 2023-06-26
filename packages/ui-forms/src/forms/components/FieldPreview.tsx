import { IField, ILocationOption } from '@erxes/ui/src/types';

import { FieldItem } from '../styles';
import GenerateField from '@erxes/ui-forms/src/settings/properties/components/GenerateField';
import React from 'react';
import { isEnabled } from '@erxes/ui/src/utils/core';

type Props = {
  field: IField;
  onClick?: (field: IField) => void;
  onChangeLocationOptions?: (locationOptions: ILocationOption[]) => void;
};

class FieldPreview extends React.Component<Props, {}> {
  render() {
    const { field, onClick, onChangeLocationOptions } = this.props;
    const hasLogic = field.logics ? field.logics.length > 0 : false;

    const onClickItem = () => {
      if (onClick) {
        onClick(field);
      }
    };

    if (field.type === 'productCategory' && !isEnabled('products')) {
      return <p>Products service is not enabled</p>;
    }

    return (
      <FieldItem
        hasLogic={hasLogic}
        selectType={field.type === 'select' || field.type === 'multiSelect'}
        onClick={onClickItem}
      >
        <GenerateField
          field={field}
          hasLogic={hasLogic}
          currentLocation={{ lat: 0, lng: 0 }}
          isPreview={true}
          onChangeLocationOptions={onChangeLocationOptions}
        />
      </FieldItem>
    );
  }
}

export default FieldPreview;
