import dayjs from 'dayjs';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Icon from '@erxes/ui/src/components/Icon';
import TextInfo from '@erxes/ui/src/components/TextInfo';
import Tip from '@erxes/ui/src/components/Tip';
import { DateWrapper } from '@erxes/ui/src/styles/main';
import { __ } from 'coreui/utils';
import { RowTitle } from '@erxes/ui-engage/src/styles';
import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  contentType: any;
  isChecked: boolean;
  toggleBulk: (contentType: any, checked: boolean) => void;
  remove: (contentTypeId: string) => void;
};

class Row extends React.Component<Props> {
  manageAction(contentType) {
    const { _id } = contentType;

    return (
      <Link to={`contenttypes/edit/${_id}`}>
        <Button btnStyle="link">
          <Tip text={__('Manage')} placement="top">
            <Icon icon="edit-3" />
          </Tip>
        </Button>
      </Link>
    );
  }

  renderRemoveAction() {
    const { contentType, remove } = this.props;

    const onClick = () => remove(contentType._id);

    return (
      <Tip text={__('Delete')} placement="top">
        <Button btnStyle="link" onClick={onClick} icon="times-circle" />
      </Tip>
    );
  }

  render() {
    const { contentType, isChecked, toggleBulk } = this.props;

    return (
      <tr>
        <td>
          <FormControl
            checked={isChecked}
            componentClass="checkbox"
            onChange={() => console.log('hahahah')}
          />
        </td>
        <td>
          <RowTitle>
            <Link to={`contentTypes/edit/${contentType._id}`}>
              {contentType.displayName}
            </Link>
          </RowTitle>
        </td>
        <td>
          <TextInfo>{contentType.code}</TextInfo>
        </td>
        <td>
          <Icon icon="calender" />{' '}
          <DateWrapper>
            {dayjs(contentType.createdDate).format('ll')}
          </DateWrapper>
        </td>
        <td>
          <ActionButtons>
            {this.manageAction(contentType)}
            {this.renderRemoveAction()}
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default Row;
