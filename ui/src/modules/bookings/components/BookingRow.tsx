import React from 'react';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Label from 'modules/common/components/Label';
import { __ } from 'modules/common/utils';
import Tip from 'modules/common/components/Tip';
import Button from 'modules/common/components/Button';
import WithPermission from 'modules/common/components/WithPermission';
import TextInfo from 'modules/common/components/TextInfo';
import { RowTitle } from 'modules/engage/styles';
import { Link } from 'react-router-dom';
import ActionButtons from 'modules/common/components/ActionButtons';
import { IBookingDocument } from '../types';
import FormControl from 'modules/common/components/form/Control';
import Icon from 'modules/common/components/Icon';
import { Capitalize } from 'modules/settings/permissions/styles';
import dayjs from 'dayjs';
import { DateWrapper } from 'modules/common/styles/main';
import Tags from 'modules/common/components/Tags';
import Manage from './Manage';

type Props = {
  isChecked: boolean;
  booking: IBookingDocument;
  toggleBulk: (booking: IBookingDocument, checked: boolean) => void;
  remove: (bookingId: string) => void;
  refetch: () => void;
};

function Row({ isChecked, toggleBulk, booking, remove }: Props) {
  const tags = booking.tags || [];

  const createdUser = booking.createdUser || {
    _id: '',
    details: {
      fullName: ''
    }
  };

  const onChange = e => {
    if (toggleBulk) {
      toggleBulk(booking, e.target.checked);
    }
  };

  const manageAction = bookingDetail => {
    return (
      <Link to={`/bookings/edit/${bookingDetail._id}`}>
        <Button id="skill-edit-skill" btnStyle="link">
          <Tip text={__('Manage')} placement="bottom">
            <Icon icon="edit-3" />
          </Tip>
        </Button>
      </Link>
    );
  };

  const renderRemoveAction = () => {
    const onClick = () => remove(booking._id);

    return (
      <WithPermission action="bookingsRemove">
        <Tip text={__('Delete')} placement="top">
          <Button
            id="bookingDelete"
            btnStyle="link"
            onClick={onClick}
            icon="times-circle"
          />
        </Tip>
      </WithPermission>
    );
  };

  const renderEditAction = (booking: IBookingDocument) => {
    const trigger = (
      <Button btnStyle="link">
        <Tip text={__('Install code')} placement="top">
          <Icon icon="code" />
        </Tip>
      </Button>
    );

    const content = props => <Manage booking={booking} {...props} />;

    return (
      <ModalTrigger
        title={`Install code of ${booking.name}`}
        size="lg"
        trigger={trigger}
        content={content}
        // isOpen={this.props.showCode}
        isAnimate={true}
      />
    );
  };

  const { mainProductCategory } = booking;
  const status = mainProductCategory && mainProductCategory.status;

  const labelStyle = status === 'active' ? 'success' : 'warning';

  return (
    <tr>
      <td>
        <FormControl
          checked={isChecked}
          componentClass="checkbox"
          onChange={onChange}
        />
      </td>
      <td>
        <RowTitle>
          <Link to={`/bookings/edit/${booking._id}`}>{booking.name}</Link>
        </RowTitle>
      </td>
      <td>
        <TextInfo>{booking.brand && booking.brand.name}</TextInfo>
      </td>

      <td>
        <TextInfo ignoreTrans={true}>{2433}</TextInfo>
      </td>
      <td>
        <Label lblStyle={labelStyle}>{status && status}</Label>
      </td>

      <td>
        <div>
          <Capitalize>
            {createdUser.details && createdUser.details.fullName}
          </Capitalize>
        </div>
      </td>
      <td>
        <Icon icon="calender" />{' '}
        <DateWrapper>{dayjs(booking.createdDate).format('ll')}</DateWrapper>
      </td>

      <td>
        <Tags tags={tags} limit={2} />
      </td>

      <td>
        <ActionButtons>
          {manageAction(booking)}
          {renderEditAction(booking)}
          {renderRemoveAction()}
        </ActionButtons>
      </td>
    </tr>
  );
}

export default Row;
