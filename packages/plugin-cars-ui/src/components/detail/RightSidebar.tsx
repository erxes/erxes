import Box from '@erxes/ui/src/components/Box';
import { ICar } from '../../types';
import { List } from '../../styles';
import React from 'react';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { __ } from 'coreui/utils';
import dayjs from 'dayjs';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Icon from '@erxes/ui/src/components/Icon';
import SelectCustomers from '@erxes/ui-contacts/src/customers/containers/SelectCustomers';
import { MainStyleModalFooter as ModalFooter, Button } from '@erxes/ui/src';
import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import { SectionBodyItem } from '@erxes/ui/src/layout/styles';
import { Link } from 'react-router-dom';

type Props = {
  car: ICar;
  editCar: (values: any) => void;
};

type State = {
  customerIds: string[];
  companyIds: string[];
};

class RightSidebar extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      customerIds: [],
      companyIds: []
    };
  }

  renderPlan(car) {
    if (!car.plan) {
      return null;
    }
    return (
      <li>
        <div>{__('Plan')}: </div>
        <span>{car.plan}</span>
      </li>
    );
  }

  render() {
    const { car, editCar } = this.props;
    const customerContent = (
      <div>
        {car.customerIds?.map(customer => (
          <SectionBodyItem>
            <Link to={`/contacts/details/${customer}`}>
              {customer || 'Unknown'}
            </Link>
          </SectionBodyItem>
        ))}
        {car.customerIds?.length === 0 && (
          <EmptyState icon="building" text="No company" />
        )}
      </div>
    );
    const companyContent = (
      <div>
        {car.companyIds?.map(company => (
          <SectionBodyItem>
            <Link to={`/companies/details/${company}`}>
              {company || 'Unknown'}
            </Link>
          </SectionBodyItem>
        ))}
        {car.companyIds?.length === 0 && (
          <EmptyState icon="building" text="No company" />
        )}
      </div>
    );

    const handleGeneralOptions = value => {
      this.setState({
        customerIds: value
      });
    };
    const onSelectCompanies = value => {
      this.setState({
        companyIds: value
      });
    };
    const saveCustomer = closeModal => {
      editCar({
        customerIds: this.state.customerIds
      });
      closeModal();
    };

    const saveCompany = closeModal => {
      editCar({
        companyIds: this.state.companyIds
      });
      closeModal();
    };

    const customerChooser = props => {
      const { closeModal } = props;
      return (
        <>
          <SelectCustomers
            label="Choose Customer"
            name="customerId"
            onSelect={handleGeneralOptions}
            multi={true}
            initialValue={car.customerIds}
          ></SelectCustomers>

          <ModalFooter>
            <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
              Close
            </Button>

            <Button
              btnStyle="success"
              onClick={() => saveCustomer(closeModal())}
              icon="check-circle"
            >
              Save
            </Button>
          </ModalFooter>
        </>
      );
    };
    const companyChooser = props => {
      const { closeModal } = props;
      return (
        <>
          <SelectCompanies
            label="Choose Company"
            name="chooseCompany"
            initialValue={car.companyIds}
            onSelect={onSelectCompanies}
            multi={false}
          />

          <ModalFooter>
            <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
              Close
            </Button>

            <Button
              btnStyle="success"
              onClick={() => saveCompany(closeModal())}
              icon="check-circle"
            >
              Save
            </Button>
          </ModalFooter>
        </>
      );
    };
    const extraCustomerButtons = (
      <ModalTrigger
        title="Associate"
        trigger={
          <button>
            <Icon icon="plus-circle" />
          </button>
        }
        content={customerChooser}
      />
    );
    const extraCompanyButtons = (
      <ModalTrigger
        title="Associate"
        trigger={
          <button>
            <Icon icon="plus-circle" />
          </button>
        }
        content={companyChooser}
      />
    );

    return (
      <Sidebar>
        <>
          <Box
            title={__('Customers')}
            name="showCustomers "
            extraButtons={extraCustomerButtons}
            isOpen={true}
          >
            {customerContent}
          </Box>
          <Box
            title={__('Companies')}
            name="showCompanies "
            extraButtons={extraCompanyButtons}
            isOpen={true}
          >
            {companyContent}
          </Box>
        </>

        <Box title={__('Other')} name="showOthers">
          <List>
            <li>
              <div>{__('Created at')}: </div>{' '}
              <span>{dayjs(car.createdAt).format('lll')}</span>
            </li>
            <li>
              <div>{__('Modified at')}: </div>{' '}
              <span>{dayjs(car.modifiedAt).format('lll')}</span>
            </li>
            {this.renderPlan(car)}
          </List>
        </Box>
      </Sidebar>
    );
  }
}

export default RightSidebar;
