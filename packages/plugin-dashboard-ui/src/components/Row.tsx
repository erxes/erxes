import FormControl from '@erxes/ui/src/components/form/Control';
import React from 'react';
import { IDashboard } from '../types';
import dayjs from 'dayjs';
import Icon from '@erxes/ui/src/components/Icon';
import { DateWrapper } from '@erxes/ui/src/styles/main';
import s from 'underscore.string';
import { FlexCenter } from '@erxes/ui/src/styles/main';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import { Link } from 'react-router-dom';
import Button from '@erxes/ui/src/components/Button';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from 'coreui/utils';
import WithPermission from 'coreui/withPermission';

type Props = {
  dashboard: IDashboard;
  history: any;
  isChecked: boolean;
  toggleBulk: (dashboard: IDashboard, isChecked?: boolean) => void;
  removeDashboards: (dashboards: IDashboard[]) => void;
};

function ActionRow({
  dashboard,
  history,
  isChecked,
  toggleBulk,
  removeDashboards
}: Props) {
  const onChange = e => {
    if (toggleBulk) {
      toggleBulk(dashboard, e.target.checked);
    }
  };

  const onClick = e => {
    e.stopPropagation();
  };

  const onNameClick = () => {
    history.push(`/dashboards/details/${dashboard._id}`);
  };

  const editAction = () => {
    return (
      <Link to={`/dashboards/details/${dashboard._id}`}>
        <Button btnStyle="link">
          <Tip text={__('Edit')} placement="top">
            <Icon icon="edit-3" />
          </Tip>
        </Button>
      </Link>
    );
  };

  const removeAction = () => {
    const onRemove = () => removeDashboards([dashboard]);

    return (
      <WithPermission action="dashboardsRemove">
        <Tip text={__('Delete')} placement="top">
          <Button
            id="dashboardDelete"
            btnStyle="link"
            onClick={onRemove}
            icon="times-circle"
          />
        </Tip>
      </WithPermission>
    );
  };

  const {
    name,
    updatedAt,
    createdAt,
    createdUser,
    updatedUser,
    itemsCount
  } = dashboard;

  return (
    <tr>
      <td id="dashboardsCheckBox" onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentClass="checkbox"
          onChange={onChange}
        />
      </td>
      <td onClick={onNameClick}> {name} </td>

      <td className="text-primary">
        <Icon icon="swatchbook" />
        <b> {s.numberFormat(itemsCount)}</b>
      </td>
      <td>
        <FlexCenter>
          <NameCard user={updatedUser} avatarSize={30} />
        </FlexCenter>
      </td>
      <td>
        <FlexCenter>
          <NameCard user={createdUser} avatarSize={30} />
        </FlexCenter>
      </td>
      <td>
        <Icon icon="calender" /> <DateWrapper>{updatedAt}</DateWrapper>
      </td>
      <td>
        <Icon icon="calender" /> <DateWrapper>{createdAt}</DateWrapper>
      </td>
      <td>
        <ActionButtons>
          {editAction()}
          {removeAction()}
        </ActionButtons>
      </td>
    </tr>
  );
}

export default ActionRow;
