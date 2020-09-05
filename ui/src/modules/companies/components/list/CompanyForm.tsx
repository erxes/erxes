import AvatarUpload from 'modules/common/components/AvatarUpload';
import Button from 'modules/common/components/Button';
import CollapseContent from 'modules/common/components/CollapseContent';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import ModifiableSelect from 'modules/common/components/ModifiableSelect';
import {
  FormColumn,
  FormWrapper,
  ModalFooter,
  ScrollWrapper
} from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __, getConstantFromStore } from 'modules/common/utils';
import SelectCompanies from 'modules/companies/containers/SelectCompanies';
import { isValidPhone } from 'modules/customers/utils';
import SelectTeamMembers from 'modules/settings/team/containers/SelectTeamMembers';
import React from 'react';
import Select from 'react-select-plus';
import validator from 'validator';
import { IUser } from '../../../auth/types';
import {
  COMPANY_BUSINESS_TYPES,
  COMPANY_INDUSTRY_TYPES
} from '../../constants';
import { ICompany, ICompanyDoc, ICompanyLinks } from '../../types';

type Props = {
  currentUser: IUser;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  company: ICompany;
  closeModal: () => void;
};

type State = {
  parentCompanyId?: string;
  ownerId?: string;
  companies?: ICompany[];
  doNotDisturb?: string;
  users?: IUser[];
  avatar?: string;

  names?: string[];
  emails?: string[];
  phones?: string[];
  primaryName?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  industry?: string;
  businessType?: string;
};

class CompanyForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { company = {} } = props;
    const companies: ICompany[] = [];
    const userId = props.currentUser ? props.currentUser._id : '';

    if (company.parentCompany) {
      companies.push(company.parentCompany);
    }

    this.state = {
      parentCompanyId: company.parentCompanyId || '',
      ownerId: company.ownerId || userId,
      companies,
      doNotDisturb: company.doNotDisturb || 'No',
      users: [],
      avatar: company.avatar,
      industry: company.industry || '',
      businessType: company.businessType || ''
    };
  }

  generateDoc = (
    values: { _id: string; size?: number } & ICompanyDoc & ICompanyLinks
  ) => {
    const { company } = this.props;

    const finalValues = values;

    if (company) {
      finalValues._id = company._id;
    }

    const links = {};

    getConstantFromStore('social_links').forEach(link => {
      links[link.value] = finalValues[link.value];
    });

    return {
      _id: finalValues._id,
      ...this.state,
      size: Number(finalValues.size),
      description: finalValues.description,
      code: finalValues.code,
      links
    };
  };

  onAvatarUpload = (url: string) => {
    this.setState({ avatar: url });
  };

  generateConstantParams(constants) {
    return constants.map(constant => ({
      value: constant,
      label: constant
    }));
  }

  handleSelect = <T extends keyof State>(selectedOption: string, name: T) => {
    this.setState({
      [name]: selectedOption
    } as Pick<State, keyof State>);
  };

  renderFormGroup = (label, props) => {
    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <FormControl {...props} />
      </FormGroup>
    );
  };

  onIndustryChange = option => {
    this.setState({ industry: option.value });
  };

  onBusinessChange = option => {
    this.setState({ businessType: option.value });
  };

  onChange = (
    optionsName: string,
    optionName: string,
    { options, selectedOption }: { options: string[]; selectedOption: string }
  ) => {
    this.setState({ [optionsName]: options, [optionName]: selectedOption });
  };

  renderLink(formProps, link) {
    const { company } = this.props;
    const links = (company ? company.links : {}) || {};

    return this.renderFormGroup(link.label, {
      ...formProps,
      name: link.value,
      defaultValue: links[link.value] || '',
      type: 'url'
    });
  }

  renderContent = (formProps: IFormProps) => {
    const company = this.props.company || ({} as ICompany);
    const { closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    const {
      primaryName,
      names,
      primaryPhone,
      phones,
      primaryEmail,
      emails
    } = company;

    const { parentCompanyId, ownerId } = this.state;

    const onSelectOwner = value => {
      return this.handleSelect(value, 'ownerId');
    };

    const onSelectParentCompany = value => {
      return this.handleSelect(value, 'parentCompanyId');
    };

    return (
      <>
        <ScrollWrapper>
          <CollapseContent
            title={__('General information')}
            compact={true}
            open={true}
          >
            <FormWrapper>
              <FormColumn>
                <AvatarUpload
                  avatar={company.avatar}
                  onAvatarUpload={this.onAvatarUpload}
                  defaultAvatar="/images/integrations/company.png"
                />
              </FormColumn>

              <FormColumn>
                {this.renderFormGroup('Code', {
                  ...formProps,
                  name: 'code',
                  defaultValue: company.code || ''
                })}

                <FormGroup>
                  <ControlLabel>Owner</ControlLabel>
                  <SelectTeamMembers
                    label="Choose an owner"
                    name="ownerId"
                    value={ownerId}
                    onSelect={onSelectOwner}
                    multi={false}
                  />
                </FormGroup>
              </FormColumn>
            </FormWrapper>
            <FormWrapper>
              <FormColumn>
                <FormGroup>
                  <ControlLabel required={true}>Name</ControlLabel>
                  <ModifiableSelect
                    value={primaryName}
                    options={names || []}
                    name="Name"
                    required={true}
                    onChange={this.onChange.bind(this, 'names', 'primaryName')}
                  />
                </FormGroup>

                <FormGroup>
                  <ControlLabel>Industry</ControlLabel>
                  <Select
                    value={this.state.industry}
                    onChange={this.onIndustryChange}
                    options={this.generateConstantParams(
                      COMPANY_INDUSTRY_TYPES()
                    )}
                    clearable={false}
                  />
                </FormGroup>

                <FormGroup>
                  <ControlLabel>Email</ControlLabel>
                  <ModifiableSelect
                    value={primaryEmail}
                    options={emails || []}
                    name="Email"
                    onChange={this.onChange.bind(
                      this,
                      'emails',
                      'primaryEmail'
                    )}
                    checkFormat={validator.isEmail}
                  />
                </FormGroup>

                <FormGroup>
                  <ControlLabel>Description</ControlLabel>
                  <FormControl
                    {...formProps}
                    max={140}
                    name="description"
                    componentClass="textarea"
                    defaultValue={company.description || ''}
                  />
                </FormGroup>
              </FormColumn>
              <FormColumn>
                <FormGroup>
                  <ControlLabel>Parent Company</ControlLabel>
                  <SelectCompanies
                    label="Choose parent company"
                    name="parentCompanyId"
                    value={parentCompanyId}
                    onSelect={onSelectParentCompany}
                    multi={false}
                  />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Business Type</ControlLabel>
                  <Select
                    value={this.state.businessType}
                    onChange={this.onBusinessChange}
                    options={this.generateConstantParams(
                      COMPANY_BUSINESS_TYPES
                    )}
                    placeholder={__('Select')}
                    clearable={false}
                  />
                </FormGroup>

                <FormGroup>
                  <ControlLabel>Phone</ControlLabel>
                  <ModifiableSelect
                    value={primaryPhone}
                    options={phones || []}
                    name="Phone"
                    onChange={this.onChange.bind(
                      this,
                      'phones',
                      'primaryPhone'
                    )}
                    checkFormat={isValidPhone}
                  />
                </FormGroup>

                {this.renderFormGroup('Size', {
                  ...formProps,
                  name: 'size',
                  type: 'number',
                  defaultValue: company.size || 0
                })}

                {this.renderFormGroup('Do not disturb', {
                  componentClass: 'radio',
                  options: [
                    {
                      childNode: 'Yes',
                      value: 'Yes',
                      checked: this.state.doNotDisturb === 'Yes',
                      onChange: e =>
                        this.setState({ doNotDisturb: e.target.value })
                    },
                    {
                      childNode: 'No',
                      value: 'No',
                      checked: this.state.doNotDisturb === 'No',
                      onChange: e =>
                        this.setState({ doNotDisturb: e.target.value })
                    }
                  ]
                })}
              </FormColumn>
            </FormWrapper>
          </CollapseContent>
          <CollapseContent title={__('Links')} compact={true} open={true}>
            <FormWrapper>
              <FormColumn>
                {getConstantFromStore('social_links').map(link =>
                  this.renderLink(formProps, link)
                )}
              </FormColumn>
            </FormWrapper>
          </CollapseContent>
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            Close
          </Button>

          {renderButton({
            name: 'company',
            values: this.generateDoc(values),
            isSubmitted,
            object: this.props.company
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default CompanyForm;
