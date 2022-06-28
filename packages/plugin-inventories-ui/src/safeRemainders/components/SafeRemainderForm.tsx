import React from 'react';
import Select from 'react-select-plus';
import SelectCompanies from '@erxes/ui/src/companies/containers/SelectCompanies';
import Button from '@erxes/ui/src/components/Button';
import EditorCK from '@erxes/ui/src/components/EditorCK';
import FormControl from '@erxes/ui/src/components/form/Control';
import CommonForm from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Uploader from '@erxes/ui/src/components/Uploader';
import {
  ModalFooter,
  FormColumn,
  FormWrapper
} from '@erxes/ui/src/styles/main';
import {
  IAttachment,
  IButtonMutateProps,
  IFormProps
} from '@erxes/ui/src/types';
import {
  extractAttachment,
  generateCategoryOptions,
  __
} from '@erxes/ui/src/utils';
import { Row } from '@erxes/ui-settings/src/integrations/styles';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import Datetime from '@nateradebaugh/react-datetime';
import SelectProductCategory from '@erxes/ui-products/src/containers/SelectProductCategory';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  branchId: string;
  departmentId: string;
  date: Date;
  description: string;
  productCategoryId: string;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      branchId: '',
      departmentId: '',
      date: new Date(),
      description: '',
      productCategoryId: ''
    };
  }

  generateDoc = (values: {}) => {
    const finalValues = values;
    const {
      branchId,
      departmentId,
      date,
      description,
      productCategoryId
    } = this.state;

    return {
      ...finalValues,
      branchId,
      departmentId,
      date,
      description,
      productCategoryId
    };
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal } = this.props;
    const { values, isSubmitted } = formProps;

    const {
      branchId,
      departmentId,
      date,
      description,
      productCategoryId
    } = this.state;

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>{__('Date')}</ControlLabel>
              <Datetime
                inputProps={{ placeholder: 'Click to select a date' }}
                dateFormat="YYYY-MM-DD"
                timeFormat="HH:mm"
                value={date}
                closeOnSelect={true}
                utc={true}
                input={true}
                onChange={date =>
                  this.setState({ date: new Date(date || new Date()) })
                }
                viewMode={'days'}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel required={true}>Description</ControlLabel>
              <FormControl
                {...formProps}
                name="description"
                defaultValue={description}
                onChange={e =>
                  this.setState({
                    description: (e.currentTarget as HTMLButtonElement).value
                  })
                }
                autoFocus={true}
                required={true}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>{__('Branch')}</ControlLabel>
              <SelectBranches
                label="Choose branch"
                name="selectedBranchIds"
                initialValue={branchId}
                onSelect={branchId =>
                  this.setState({ branchId: String(branchId) })
                }
                multi={false}
                customOption={{ value: '', label: 'All branches' }}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('Department')}</ControlLabel>
              <SelectDepartments
                label="Choose department"
                name="selectedDepartmentIds"
                initialValue={departmentId}
                onSelect={departmentId =>
                  this.setState({ departmentId: String(departmentId) })
                }
                multi={false}
                customOption={{ value: '', label: 'All departments' }}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('Product Categories')}</ControlLabel>
              <SelectProductCategory
                label="Choose product category"
                name="selectedProductCategoryId"
                initialValue={productCategoryId}
                onSelect={productCategoryId =>
                  this.setState({
                    productCategoryId: productCategoryId as string
                  })
                }
                multi={false}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Close
          </Button>

          {renderButton({
            name: 'product and service',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default Form;
