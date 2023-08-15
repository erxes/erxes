import Box from '@erxes/ui/src/components/Box';
import Button from '@erxes/ui/src/components/Button';
import CommonForm from '@erxes/ui/src/components/form/Form';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import moment from 'moment';
import React from 'react';
import { __ } from 'coreui/utils';
import {
  DateContainer,
  FormColumn,
  FormWrapper,
  ModalFooter
} from '@erxes/ui/src/styles/main';
import {
  FieldStyle,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { IWork, IWorkDocument } from '../types';
import { IProductsData } from '../../types';
import { JOB_TYPE_CHOISES } from '../../constants';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';
import SelectJobRefer from '../../job/containers/refer/SelectJobRefer';
import client from '@erxes/ui/src/apolloClient';
import { gql } from '@apollo/client';
import jobQueries from '../../job/graphql/queries';
import Alert from '@erxes/ui/src/utils/Alert';
import productQueries from '@erxes/ui-products/src/graphql/queries';
import { FLOWJOB_TYPES } from '../../flow/constants';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  work?: IWorkDocument;
};

type State = {
  workInfo: IWork;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { work } = this.props;

    this.state = {
      workInfo: work || {
        name: '',
        status: 'new',
        dueDate: new Date(),
        startAt: new Date(),
        endAt: new Date(),
        type: '',
        typeId: '',
        origin: 'handle',
        count: 1,
        inBranchId: '',
        inDepartmentId: '',
        outBranchId: '',
        outDepartmentId: '',
        needProducts: [],
        resultProducts: []
      }
    };
  }

  generateDoc = (values: {
    _id?: string;
    needProducts: IProductsData[];
    resultProducts: IProductsData[];
  }) => {
    const { work } = this.props;

    const finalValues = values;
    const { workInfo } = this.state;

    if (work) {
      finalValues._id = work._id;
    }

    return {
      ...(work || {}),
      ...finalValues,
      ...workInfo
    };
  };

  renderView = (name: string, variable: number, uom: string) => {
    return (
      <li key={Math.random()}>
        <FieldStyle>{__(name)}</FieldStyle>
        <SidebarCounter>
          {variable || 0} /${uom}/
        </SidebarCounter>
      </li>
    );
  };

  renderProducts = (name: string, products: any[]) => {
    const result: React.ReactNode[] = [];

    result.push(
      <li key={Math.random()}>
        <FieldStyle>{__(name)}</FieldStyle>
        <SidebarCounter>{(products || []).length}</SidebarCounter>
      </li>
    );

    const { workInfo } = this.state;

    for (const product of products) {
      const { uom } = product;
      const productName = product.product ? product.product.name : 'not name';

      result.push(
        this.renderView(productName, product.quantity * workInfo.count, uom)
      );
    }

    return result;
  };

  renderDetailNeed() {
    const { workInfo } = this.state;
    const { needProducts } = workInfo;

    return (
      <SidebarList className="no-link">
        {this.renderProducts('NeedProducts', needProducts || [])}
      </SidebarList>
    );
  }

  renderDetailResult() {
    const { workInfo } = this.state;
    const { resultProducts } = workInfo;

    return (
      <SidebarList className="no-link">
        {this.renderProducts('ResultProducts', resultProducts || [])}
      </SidebarList>
    );
  }

  onChange = e => {
    const { workInfo } = this.state;
    const count = Number(e.target.value);

    this.setState({
      workInfo: { ...workInfo, count }
    });
  };

  onSelectDate = (value, name) => {
    const { workInfo } = this.state;
    this.setState({
      workInfo: { ...workInfo, [name]: value }
    });
  };

  onSelectChange = (name, value) => {
    const { workInfo } = this.state;

    this.setState({
      workInfo: { ...workInfo, [name]: value }
    });
  };

  renderLoc(obj) {
    if (!obj) {
      return 'unknown';
    }

    return `${obj.code} - ${obj.title}`;
  }

  renderType() {
    const { workInfo } = this.state;

    if (!workInfo.type) {
      return '';
    }

    if (['end', 'job'].includes(workInfo.type)) {
      const onSelectJobRefer = jobReferId => {
        this.setState({
          workInfo: {
            ...workInfo,
            typeId: jobReferId
          }
        });

        client
          .query({
            query: gql(jobQueries.jobReferDetail),
            variables: { id: jobReferId }
          })
          .then(({ data }: any) => {
            if (data.jobReferDetail) {
              const detail = data.jobReferDetail;
              this.setState({
                workInfo: {
                  ...workInfo,
                  name: detail.name,
                  typeId: jobReferId,
                  needProducts: detail.needProducts,
                  resultProducts: detail.resultProducts
                }
              });
            }
          })
          .catch(e => {
            Alert.error(e.message);
          });
      };

      return (
        <>
          {(workInfo.type === 'end' && (
            <FormGroup>
              <ControlLabel>Job Refer</ControlLabel>
              <SelectJobRefer
                key={'jobReferEnds'}
                label="Choose jobRefer"
                name="jobReferId"
                initialValue={workInfo.typeId || ''}
                customOption={{
                  value: '',
                  label: '...Clear jobRefer filter'
                }}
                onSelect={onSelectJobRefer}
                filterParams={{ types: ['end'] }}
                multi={false}
              />
            </FormGroup>
          )) || (
            <FormGroup>
              <ControlLabel>Job Refer</ControlLabel>
              <SelectJobRefer
                key={'jobReferJobs'}
                label="Choose jobRefer"
                name="jobReferId"
                initialValue={workInfo.typeId || ''}
                customOption={{
                  value: '',
                  label: '...Clear jobRefer filter'
                }}
                onSelect={onSelectJobRefer}
                filterParams={{ types: ['job'] }}
                multi={false}
              />
            </FormGroup>
          )}
        </>
      );
    }

    const onSelectProduct = productId => {
      this.setState({
        workInfo: {
          ...workInfo,
          typeId: productId
        }
      });

      client
        .query({
          query: gql(productQueries.productDetail),
          variables: { _id: productId }
        })
        .then(({ data }: any) => {
          if (data.productDetail) {
            const product = data.productDetail;
            const productsData: IProductsData = {
              _id: Math.random().toString(),
              productId,
              uom: product.uom,
              quantity: 1,
              product
            };
            let needProducts: IProductsData[] = [];
            let resultProducts: IProductsData[] = [];

            switch (workInfo.type) {
              case FLOWJOB_TYPES.INCOME:
                needProducts = [];
                resultProducts = [productsData];
                break;
              case FLOWJOB_TYPES.OUTLET:
                needProducts = [productsData];
                resultProducts = [];
                break;
              default:
                needProducts = [productsData];
                resultProducts = [productsData];
            }

            this.setState({
              workInfo: {
                ...workInfo,
                name: product.name,
                typeId: productId,
                needProducts,
                resultProducts
              }
            });
          }
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };
    return (
      <>
        <FormGroup>
          <ControlLabel>Product</ControlLabel>
          <SelectProducts
            label="Choose product"
            name="productId"
            initialValue={workInfo.typeId || ''}
            customOption={{
              value: '',
              label: '...Clear product filter'
            }}
            onSelect={onSelectProduct}
            multi={false}
          />
        </FormGroup>
      </>
    );
  }

  renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton, work } = this.props;
    const { values, isSubmitted } = formProps;
    const { workInfo } = this.state;
    const {
      count,
      startAt,
      inBranchId,
      outBranchId,
      inDepartmentId,
      outDepartmentId
    } = workInfo;

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>{__(`Due Date`)}</ControlLabel>
              <DateContainer>
                <DateControl
                  name="startAt"
                  dateFormat="YYYY/MM/DD"
                  timeFormat={true}
                  placeholder="Choose date"
                  value={startAt}
                  onChange={value => this.onSelectDate(value, 'dueDate')}
                />
              </DateContainer>
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>{__(`Count`)}</ControlLabel>
              <FormControl
                name="count"
                defaultValue={count}
                type="number"
                autoFocus={true}
                required={true}
                onChange={this.onChange}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Type</ControlLabel>
              <FormControl
                name="type"
                componentClass="select"
                value={workInfo.type}
                required={false}
                onChange={e =>
                  this.onSelectChange(
                    'type',
                    (e.currentTarget as HTMLInputElement).value
                  )
                }
              >
                <option value="">All type</option>
                {Object.keys(JOB_TYPE_CHOISES).map(jt => (
                  <option value={jt} key={Math.random()}>
                    {JOB_TYPE_CHOISES[jt]}
                  </option>
                ))}
              </FormControl>
            </FormGroup>
          </FormColumn>
        </FormWrapper>
        <FormWrapper>
          <FormColumn>{this.renderType()}</FormColumn>
        </FormWrapper>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>{__(`Spend Branch`)}</ControlLabel>
              <SelectBranches
                label="Choose branch"
                name="inBranchId"
                initialValue={inBranchId || ''}
                customOption={{
                  value: '',
                  label: '...Clear branch filter'
                }}
                onSelect={branchId =>
                  this.onSelectChange('inBranchId', branchId)
                }
                multi={false}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__(`Spend Department`)}</ControlLabel>
              <SelectDepartments
                label="Choose department"
                name="inDepartmentId"
                initialValue={inDepartmentId || ''}
                customOption={{
                  value: '',
                  label: '...Clear department filter'
                }}
                onSelect={departmentId =>
                  this.onSelectChange('inDepartmentId', departmentId)
                }
                multi={false}
              />
            </FormGroup>
          </FormColumn>

          <FormColumn>
            <FormGroup>
              <ControlLabel>{__(`Receipt Branch`)}</ControlLabel>
              <SelectBranches
                label="Choose branch"
                name="outBranchId"
                initialValue={outBranchId || ''}
                customOption={{
                  value: '',
                  label: '...Clear branch filter'
                }}
                onSelect={branchId =>
                  this.onSelectChange('outBranchId', branchId)
                }
                multi={false}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__(`Receipt Department`)}</ControlLabel>
              <SelectDepartments
                label="Choose department"
                name="outDepartmentId"
                initialValue={outDepartmentId || ''}
                customOption={{
                  value: '',
                  label: '...Clear department filter'
                }}
                onSelect={departmentId =>
                  this.onSelectChange('outDepartmentId', departmentId)
                }
                multi={false}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>

        <Box title={'Plan Details:'}>
          <FormWrapper>
            <FormColumn>{this.renderDetailNeed()}</FormColumn>
            <FormColumn>{this.renderDetailResult()}</FormColumn>
          </FormWrapper>
        </Box>

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
            name: 'Performance',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: work
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
