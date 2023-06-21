import { IAddress } from '@erxes/ui-contacts/src/customers/types';
import { ControlLabel, Form, FormControl } from '@erxes/ui/src/components/form';
import { Formgroup } from '@erxes/ui/src/components/form/styles';
import { IFormProps } from '@erxes/ui/src/types';
import { __, loadDynamicComponent } from '@erxes/ui/src/utils/core';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Select from 'react-select-plus';

import { AddressDetailWrapper } from '../styles';
import List from './List';

type Props = {
  addresses: IAddress[];
  searchResult: IAddress[];
  searchLoading: boolean;
  searchAddress: (query: string) => void;
  reverseGeoJson: (
    location: { lat: number; lng: number },
    callback: any
  ) => void;

  onSave: (addresses: IAddress[]) => void;
  closeModal: () => void;
};

const AddressesEdit = (props: Props) => {
  const { closeModal } = props;
  const [addresses, setAddresses] = useState(props.addresses || []);
  const [center, setCenter] = useState({ lat: 0, lng: 0 });
  const [searchValue, setSearchValue] = useState<string>('');

  useEffect(() => {
    let timeoutId: any = null;

    if (searchValue && searchValue.length > 2) {
      timeoutId = setTimeout(() => {
        props.searchAddress(searchValue);
      }, 1500);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [searchValue]);

  const primary = useMemo(() => addresses.find(address => address.isPrimary), [
    addresses
  ]);

  const [currentAddress, setCurrentAddress] = useState<IAddress | undefined>(
    primary ? primary : addresses[0] && addresses[0]
  );

  const onSelectAddress = useCallback(
    (e: any) => {
      const { value } = e;
      const selectedAddress = props.searchResult.find(a => a.osmId === value);

      if (selectedAddress) {
        if (!currentAddress) {
          setAddresses([...addresses, selectedAddress]);
        } else {
          const prevIndex = addresses.findIndex(
            a => a.osmId === currentAddress.osmId
          );
          const updatedAddresses = [...addresses];
          updatedAddresses[prevIndex] = selectedAddress;
          setAddresses(updatedAddresses);
        }
        setCurrentAddress(selectedAddress);
      }
    },
    [props.searchResult]
  );

  const onChangeAddresses = (updatedAddresses: IAddress[]) => {
    if (updatedAddresses.length === 0) {
      setCurrentAddress(undefined);
    } else {
      setCurrentAddress(updatedAddresses[0]);
    }

    setAddresses(updatedAddresses);
  };

  const onSelectRow = useCallback((address: IAddress) => {
    setCurrentAddress(address);
  }, []);

  const onAddNew = () => {
    const newAddress: any = {
      fullAddress: 'move pin to set address',
      osmId: 'temp',
      lat: center.lat,
      lng: center.lng,
      isPrimary: false
    };

    setAddresses([...addresses, newAddress]);
    setCurrentAddress(newAddress);
  };

  const reverseGeocode = ({ lat, lng }) => {
    if (!currentAddress) {
      return;
    }

    props.reverseGeoJson({ lat, lng }, fetchedAddress => {
      const previousOsmId = currentAddress.osmId;
      const updatedAddress = { ...currentAddress };

      for (const key in fetchedAddress) {
        if (fetchedAddress.hasOwnProperty(key)) {
          const value = fetchedAddress[key];
          if (value) {
            updatedAddress[key] = value;
          }
        }
      }

      setCurrentAddress(updatedAddress);

      setAddresses(
        addresses.map(a => {
          if (a.osmId === previousOsmId) {
            return updatedAddress;
          }
          return a;
        })
      );
    });
  };

  const submit = useCallback(() => {
    props.onSave(addresses);
    closeModal();
  }, [addresses]);

  const renderSearch = () => {
    const options = props.searchResult.map(a => ({
      value: a.osmId,
      label: a.fullAddress
    }));

    return (
      <Formgroup>
        <Select
          placeholder={__('search address')}
          onChange={onSelectAddress}
          isLoading={props.searchLoading}
          onInputChange={setSearchValue}
          options={options}
          multi={false}
        />
      </Formgroup>
    );
  };

  const renderDetail = () => {
    const getCenter = () => {
      if (currentAddress) {
        return { lat: currentAddress.lat, lng: currentAddress.lng };
      }
    };

    const onChangeMarker = (marker: any) => {
      if (!currentAddress) {
        return;
      }

      setCurrentAddress({
        ...currentAddress,
        lat: marker.position.lat,
        lng: marker.position.lng
      });

      reverseGeocode({ ...marker.position });
    };

    const onChangeCenter = (position: any) => {
      setCenter({ lat: position.lat, lng: position.lng });
    };

    const markers: any = [];

    if (currentAddress) {
      markers[0] = {
        position: { lat: currentAddress.lat, lng: currentAddress.lng },
        selected: false
      };
    }

    const mapProps = {
      id: `contactAddressDetail`,
      width: '100%',
      height: '300px',
      zoom: 15,
      center: getCenter(),
      markers,
      editable: true,
      onChangeMarker,
      onChangeCenter
    };

    return (
      <>
        {renderSearch()}

        {loadDynamicComponent('osMap', mapProps)}

        {currentAddress && (
          <>
            <Formgroup>
              <ControlLabel>{__('Address')}</ControlLabel>
              <FormControl
                name="fullAddress"
                value={currentAddress?.fullAddress || ''}
                disabled={true}
              />
            </Formgroup>

            <Formgroup>
              <ControlLabel>{__('Address detail')}</ControlLabel>
              <FormControl
                name="address"
                value={currentAddress?.description || ''}
                placeholder=""
                onChange={(e: any) => {
                  setCurrentAddress({
                    ...currentAddress,
                    description: e.target.value
                  });

                  setAddresses(
                    addresses.map(a => {
                      if (a.osmId === currentAddress.osmId) {
                        return {
                          ...a,
                          description: e.target.value
                        };
                      }
                      return a;
                    })
                  );
                }}
              />
            </Formgroup>

            <Formgroup>
              <ControlLabel>{__('Default')}</ControlLabel>
              <FormControl
                name="isPrimary"
                componentClass="checkbox"
                checked={currentAddress?.isPrimary}
                onChange={(e: any) => {
                  setCurrentAddress({
                    ...currentAddress,
                    isPrimary: e.target.checked
                  });

                  setAddresses(
                    addresses.map(a => {
                      if (a.osmId === currentAddress.osmId) {
                        return {
                          ...a,
                          isPrimary: e.target.checked
                        };
                      }
                      return a;
                    })
                  );
                }}
              />
            </Formgroup>
          </>
        )}
      </>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    return (
      <AddressDetailWrapper>
        <div style={{ width: '40%' }}>
          <List
            onAddNew={onAddNew}
            addresses={addresses}
            currentAddress={currentAddress}
            onChange={onChangeAddresses}
            onSelect={onSelectRow}
            close={closeModal}
            onSave={submit}
          />
        </div>
        <div style={{ width: '60%' }}>{renderDetail()}</div>
      </AddressDetailWrapper>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default AddressesEdit;
