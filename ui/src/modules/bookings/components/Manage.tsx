import React from 'react';
import { ModalFooter } from 'modules/common/styles/main';
import Button from 'modules/common/components/Button';
import { IBookingDocument } from '../types';
import { getEnv } from 'modules/common/utils';

type Props = {
  booking: IBookingDocument;
  closeModal: () => void;
};

function Manage(props: Props) {
  const onSimulate = () => {
    const { REACT_APP_CDN_HOST } = getEnv();
    const booking = props.booking;

    window.open(
      `${REACT_APP_CDN_HOST}/test?type=booking&booking_id=${booking._id}`,
      'bookingWindow',
      'width=800,height=800'
    );
  };
  return (
    <>
      <ModalFooter>
        <Button btnStyle="primary" icon="plus-circle" onClick={onSimulate}>
          Simulate
        </Button>

        <Button
          btnStyle="simple"
          icon="times-circle"
          onClick={props.closeModal}
        >
          Close
        </Button>
      </ModalFooter>
    </>
  );
}

export default Manage;
