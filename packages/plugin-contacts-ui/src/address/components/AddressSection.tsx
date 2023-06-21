import Box from '@erxes/ui/src/components/Box';
import Icon from '@erxes/ui/src/components/Icon';
import { __, loadDynamicComponent } from '@erxes/ui/src/utils/core';

import React from 'react';

import { IAddress } from '@erxes/ui-contacts/src/customers/types';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { ButtonRelated } from '@erxes/ui/src/styles/main';
import EditForm from '../containers/EditForm';

export type Props = {
  _id: string;
  type: 'customer' | 'company';
  addresses: IAddress[];
  save: (addresses: IAddress[]) => void;
};

export default function Component(props: Props) {
  const { _id, type } = props;
  const [addresses, setAddresses] = React.useState<IAddress[]>(
    props.addresses || []
  );

  const [defaultAddress] = React.useState<IAddress | null>(
    addresses.find(address => address.isPrimary) || null
  );

  const onFormSave = (updatedAddresses: IAddress[]) => {
    setAddresses(updatedAddresses);
    props.save(updatedAddresses);
  };

  const renderBody = () => {
    if (addresses.length === 0) {
      const addTrigger = (
        <ButtonRelated>
          <span>{__('Add address')}</span>
        </ButtonRelated>
      );

      const quickButton = (
        <ModalTrigger
          title="Add new address"
          trigger={addTrigger}
          size="xl"
          content={manageContent}
        />
      );

      return (
        <>
          <EmptyState
            text={__('No address')}
            size={'small'}
            icon={'building'}
          />
          {quickButton}
        </>
      );
    }

    const markers = addresses.map(address => {
      return {
        position: { lat: address.lat, lng: address.lng },
        name: `${address.fullAddress} \r\n ${address.description}`,
        selected: address.isPrimary
      };
    });

    const mapProps = {
      id: `contactAddress-${_id}`,
      width: '100%',
      height: '300px',
      zoom: 15,
      markers,
      fitBounds: true,
      editable: false
    };

    return (
      <>
        {loadDynamicComponent('osMap', mapProps)}
        {defaultAddress && (
          <span>
            {`Default address`}
            <br />
            {`${defaultAddress.fullAddress} - ${defaultAddress.description}`}
          </span>
        )}
      </>
    );
  };

  const manageContent = formProps => (
    <EditForm
      addresses={addresses}
      onSave={onFormSave}
      closeModal={formProps.closeModal}
    />
  );

  const extraButtons = (
    <>
      <ModalTrigger
        title="Address"
        size="xl"
        trigger={
          <button>
            <Icon icon="edit-3" />
          </button>
        }
        content={manageContent}
      />
    </>
  );

  return (
    <Box
      title={__('Address')}
      extraButtons={extraButtons}
      isOpen={true}
      name="address"
    >
      {renderBody()}
    </Box>
  );
}
