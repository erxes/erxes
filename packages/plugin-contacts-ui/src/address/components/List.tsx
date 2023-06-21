import React, { useState } from 'react';

import { IAddress } from '@erxes/ui-contacts/src/customers/types';
import { ActionButtons, SidebarListItem } from '@erxes/ui-settings/src/styles';
// import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import { FieldStyle, SidebarList } from '@erxes/ui/src/layout/styles';
import { TopHeader } from '@erxes/ui/src/styles/main';
import { Alert, confirm } from '@erxes/ui/src/utils';

type Props = {
  addresses: IAddress[];
  currentAddress: IAddress | undefined;
  onChange: (addresses: IAddress[]) => void;
  onSelect: (address: IAddress) => void;
  onAddNew: () => void;
  onSave: () => void;
  close: () => void;
};

const List = (props: Props) => {
  const [addresses, setAddresses] = useState(props.addresses || []);

  React.useEffect(() => {
    setAddresses(props.addresses);
  }, [props.addresses]);

  const onChangeStatus = (index: number, isChecked: boolean) => {
    const updatedAddresses = addresses.map((address, i) => ({
      ...address,
      isPrimary: i === index
    }));
    setAddresses(updatedAddresses);
  };

  const onRemove = (index: number) => {
    confirm().then(() => {
      const updatedAddresses = addresses.filter((_address, i) => i !== index);
      setAddresses(updatedAddresses);
      props.onChange(updatedAddresses);

      Alert.success('Address removed successfully');
    });
  };

  const renderRow = () => {
    return (addresses || []).map((address, index) => (
      <SidebarListItem
        onClick={() => props.onSelect(address)}
        key={index}
        isActive={address.osmId === props.currentAddress?.osmId}
      >
        <a>
          <FieldStyle>
            {address.fullAddress}
            <p>{address.description}</p>
          </FieldStyle>
        </a>
        <ActionButtons>
          <Button
            btnStyle="link"
            onClick={() => onRemove(index)}
            icon="cancel-1"
          />
        </ActionButtons>
      </SidebarListItem>
    ));
  };

  const renderSidebarHeader = () => {
    return (
      <TopHeader>
        <Button
          btnStyle="success"
          block={true}
          uppercase={false}
          icon="plus-circle"
          onClick={() => {
            props.onAddNew();
          }}
        >
          Add New Address
        </Button>
      </TopHeader>
    );
  };

  const renderSidebarFooter = () => {
    return (
      <TopHeader>
        <div style={{ display: 'flex' }}>
          <Button
            btnStyle="danger"
            block={true}
            uppercase={false}
            icon="cancel-1"
            onClick={() => {
              props.close();
            }}
          >
            Cancel
          </Button>
          <Button
            btnStyle="success"
            block={true}
            uppercase={false}
            icon="plus-circle"
            onClick={() => {
              props.onSave();
              props.close();
            }}
          >
            Save
          </Button>
        </div>
      </TopHeader>
    );
  };

  return (
    <LeftSidebar
      wide={true}
      hasBorder={true}
      header={renderSidebarHeader()}
      footer={renderSidebarFooter()}
    >
      <SidebarList noTextColor={true} noBackground={true} id={'address'}>
        {renderRow()}
      </SidebarList>
    </LeftSidebar>
  );
};

export default List;
