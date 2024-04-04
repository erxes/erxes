import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import FileFormContainer from '../../containers/file/FileForm';
import FormControl from '@erxes/ui/src/components/form/Control';
import Icon from '@erxes/ui/src/components/Icon';
import { ItemName } from '../../styles';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from 'coreui/utils';
import dayjs from 'dayjs';
import { renderFileIcon } from '../../utils';

type Props = {
  item: any;
  queryParams: any;
  remove?: (fileId: string) => void;
  isFolder?: boolean;
  isChecked?: boolean;
  toggleBulk?: (target: any, toAdd: boolean) => void;
};

const FileRow = ({
  item,
  remove,
  isChecked,
  isFolder,
  queryParams,
  toggleBulk
}: Props) => {
  const { name, size, type } = item.info || ({} as any);

  const onChange = e => {
    if (toggleBulk) {
      toggleBulk(item, e.target.checked);
    }
  };

  const onClick = e => {
    e.stopPropagation();
  };

  const onRemove = () => {
    if (remove) {
      remove(item._id);
    }
  };

  const renderEditAction = () => {
    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    const content = props => (
      <FileFormContainer {...props} queryParams={queryParams} file={item} />
    );

    return (
      <ModalTrigger title="Edit File" trigger={editTrigger} content={content} />
    );
  };

  return (
    <tr key={item._id} className="crow">
      <td id="customersCheckBox" style={{ width: '20px' }} onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentClass="checkbox"
          onChange={onChange}
        />
      </td>
      <td style={{ paddingLeft: '0' }}>
        <ItemName>
          <a
            href={
              isFolder
                ? `/filemanager/folder/details/${item._id}`
                : `/filemanager/details/${queryParams._id}/${item._id}`
            }
          >
            {isFolder ? (
              <img src="/images/folder.png" alt="folder" />
            ) : (
              renderFileIcon(item.type === 'dynamic' ? 'aaa.dynamic' : name)
            )}
            {isFolder || item.contentType ? item.name : name}
          </a>
        </ItemName>
      </td>
      <td>{dayjs(item.createdAt).format('MMMM D, YYYY h:mm A')}</td>
      <td>{size && `${Math.round(size / 1000)} Kb`}</td>
      <td>
        <ActionButtons>
          {/* {item.contentType && renderEditAction()} */}
          {remove && (
            <Tip text={__('Delete')} placement="bottom">
              <Button btnStyle="link" onClick={onRemove} icon="cancel-1" />
            </Tip>
          )}
        </ActionButtons>
      </td>
    </tr>
  );
};

export default FileRow;
