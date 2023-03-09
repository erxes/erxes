import FormControl from '@erxes/ui/src/components/form/Control';
import { ItemName } from '../../styles';
import React from 'react';
import { __ } from 'coreui/utils';
import dayjs from 'dayjs';

type Props = {
  item: any;
  isChecked?: boolean;
  toggleBulk?: (target: any, toAdd: boolean) => void;
};

const FileRow = ({ item, isChecked, toggleBulk }: Props) => {
  const onChange = e => {
    if (toggleBulk) {
      toggleBulk(item, e.target.checked);
    }
  };

  const onClick = e => {
    e.stopPropagation();
  };

  return (
    <tr key={item._id} className="crow">
      <td id="customersCheckBox" style={{ width: '50px' }} onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentClass="checkbox"
          onChange={onChange}
        />
      </td>
      <td>
        <ItemName>
          <img src="/images/folder.png" alt="folderImg" />
          {item.name}
        </ItemName>
      </td>
      <td>{dayjs(item.createdAt).format('MMMM D, YYYY h:mm A')}</td>
      <td>100 KB</td>
      <td>action</td>
    </tr>
  );
};

export default FileRow;
