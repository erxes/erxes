import React from 'react';
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
import ModalTrigger from 'modules/common/components/ModalTrigger';
import BookingForm from './BookingForm';

type Props = {
  isChecked: boolean;
  booking: IBookingDocument;
  toggleBulk: (booking: IBookingDocument, checked: boolean) => void;
  remove: (bookingId: string) => void;
  refetch: () => void;
};

function Row({ isChecked, toggleBulk, booking, remove, refetch }: Props) {
  const onChange = e => {
    if (toggleBulk) {
      toggleBulk(booking, e.target.checked);
    }
  };

  const renderForm = formProps => {
    return <BookingForm {...formProps} booking={booking} refetch={refetch} />;
  };

  const renderEditAction = () => {
    const trigger = (
      <Button id="skill-edit-skill" btnStyle="link">
        <Tip text={__('Edit')} placement="bottom">
          <Icon icon="edit-3" />
        </Tip>
      </Button>
    );

    return (
      <ModalTrigger
        title="Edit Booking"
        trigger={trigger}
        content={renderForm}
      />
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
        <TextInfo>{booking.size || '3D'}</TextInfo>
      </td>
      <td>
        <ActionButtons>
          {renderEditAction()}
          {renderRemoveAction()}
        </ActionButtons>
      </td>
    </tr>
  );
}

export default Row;
