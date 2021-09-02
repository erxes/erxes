import React, { useState } from 'react';
import FormControl from 'modules/common/components/form/Control';
import Button from 'modules/common/components/Button';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { mutations } from '../graphql';
import { IBookingDocument } from '../types';
import { Alert } from 'erxes-ui';
import Select from 'react-select-plus';

type Props = {
  refetch: any;
  closeModal: () => void;
  booking: IBookingDocument;
};

function BookingForm({
  refetch,
  closeModal,
  booking = {} as IBookingDocument
}: Props) {
  const [isSubmitted, setSubmitted] = useState(false);
  const [name, setName] = useState(booking.name || '');
  const [size, setSize] = useState(booking.size || '3D');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (name.length === 0) {
      return Alert.error('Please enter a name');
    }

    return setSubmitted(true);
  }

  const getVariables = () => {
    const doc: { [key: string]: string | string[] } = {
      name,
      size,
      ...(booking ? { _id: booking._id } : {})
    };

    return doc;
  };

  const generateSizes = () => {
    return [{ value: '3D' }, { value: '2D' }].map(op => {
      return { label: op.value, value: op.value };
    });
  };

  function renderContent() {
    const handleNameChange = e => setName(e.target.value);
    const handleSizeSelect = option => setSize(option.value);

    return (
      <>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl
            required={true}
            autoFocus={true}
            defaultValue={name}
            onChange={handleNameChange}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>Size</ControlLabel>
          <Select
            placeholder={'Choose a size'}
            value={size}
            options={generateSizes()}
            onChange={handleSizeSelect}
          />
        </FormGroup>
      </>
    );
  }

  const mutateProps = {
    mutation: booking._id ? mutations.bookingsEdit : mutations.bookingsAdd,
    successMessage: `You successfully ${
      booking._id ? 'updated' : 'added'
    } a booking.`
  };

  return (
    <form onSubmit={handleSubmit}>
      {renderContent()}
      <ModalFooter>
        <Button
          btnStyle="simple"
          onClick={closeModal}
          icon="times-circle"
          type="button"
        >
          Cancel
        </Button>
        <ButtonMutate
          {...mutateProps}
          variables={getVariables()}
          callback={closeModal}
          refetchQueries={refetch}
          isSubmitted={isSubmitted}
          type="submit"
        />
      </ModalFooter>
    </form>
  );
}

export default BookingForm;
