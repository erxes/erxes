import {
  ArticleMeta,
  ArticleTitle,
  AuthorName,
  ReactionCount,
  ReactionCounts,
  RowArticle
} from './styles';
import { __, getUserAvatar } from 'coreui/utils';

import { ActionButtons } from '@erxes/ui-settings/src/styles';
import Button from '@erxes/ui/src/components/Button';
import { Column } from '@erxes/ui/src/styles/main';
import FormControl from '@erxes/ui/src/components/form/Control';
import { IArticle } from '@erxes/ui-knowledgeBase/src/types';
import Icon from '@erxes/ui/src/components/Icon';
import { ItemName } from '../../styles';
import Label from '@erxes/ui/src/components/Label';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
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
