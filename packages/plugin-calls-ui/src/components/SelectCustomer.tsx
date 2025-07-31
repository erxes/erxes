import React, { useState } from 'react';
import Button from '@erxes/ui/src/components/Button';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Icon from '@erxes/ui/src/components/Icon';
import styled from 'styled-components';
import colors from '@erxes/ui/src/styles/colors';

interface Customer {
  _id: string;
  primaryPhone: string;
  phones: string[];
  firstName: string;
  lastName: string;
}

interface SelectCustomerModalProps {
  customers: Customer[];
  closeModal?: () => void;
  onSelectCustomer?: (customerId: string) => void;
}

// Styled Components for better UI
const CustomerList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  margin: 0;
  background: white;
`;

const CustomerItem = styled.div<{ selected: boolean }>`
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const CustomerInfo = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const CustomerDetails = styled.div`
  flex: 1;
`;

const CustomerName = styled.h4`
  margin: 0 0 4px 0;
  color: #333;
  font-size: 15px;
  font-weight: 500;
`;

const CustomerPhone = styled.p`
  margin: 0;
  color: #666;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SelectIcon = styled.div<{ selected: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid ${(props) => (props.selected ? '#007bff' : '#ddd')};
  background: ${(props) => (props.selected ? '#007bff' : 'white')};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin-left: 12px;
`;

const SearchContainer = styled.div`
  margin-bottom: 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${colors.colorCoreGray};
`;

const ModalHeader = styled.div`
  padding: 20px 20px 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  margin: -20px -20px 20px -20px;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 500;
`;

const SelectCustomer: React.FC<SelectCustomerModalProps> = ({
  customers,
  closeModal,
  onSelectCustomer,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
  };

  const handleConfirmSelection = () => {
    if (selectedCustomerId && onSelectCustomer) {
      onSelectCustomer(selectedCustomerId);
    }
    if (closeModal) {
      closeModal();
    }
  };

  const handleCancel = () => {
    if (closeModal) {
      closeModal();
    }
  };

  return (
    <>
      <CustomerList>
        {customers.length === 0 ? (
          <EmptyState>
            <Icon icon="users" size={40} color={colors.colorCoreGray} />
            <p>No customers found</p>
          </EmptyState>
        ) : (
          customers.map((customer) => (
            <CustomerItem
              key={customer._id}
              selected={selectedCustomerId === customer._id}
              onClick={() => handleCustomerSelect(customer._id)}
            >
              <CustomerInfo>
                <CustomerDetails>
                  <CustomerName>
                    {customer.lastName} {customer.firstName}
                  </CustomerName>
                  <CustomerPhone>
                    <Icon icon="phone" size={12} />
                    {customer.primaryPhone}
                    {customer.phones?.length > 1 && (
                      <span style={{ color: '#999', fontSize: '12px' }}>
                        +{customer.phones?.length - 1} more
                      </span>
                    )}
                  </CustomerPhone>
                </CustomerDetails>
              </CustomerInfo>
              <SelectIcon selected={selectedCustomerId === customer._id}>
                {selectedCustomerId === customer._id && (
                  <Icon icon="check" size={10} color="white" />
                )}
              </SelectIcon>
            </CustomerItem>
          ))
        )}
      </CustomerList>

      <ModalFooter>
        <Button
          btnStyle="simple"
          type="button"
          icon="times-circle"
          onClick={handleCancel}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          btnStyle="success"
          icon="check-circle"
          onClick={handleConfirmSelection}
          disabled={!selectedCustomerId}
        >
          Select Customer
        </Button>
      </ModalFooter>
    </>
  );
};

export default SelectCustomer;
