import Box from '@erxes/ui/src/components/Box';
import Button from '@erxes/ui/src/components/Button';
import CommonForm from '@erxes/ui/src/components/form/Form';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import React from 'react';
import { __ } from '@erxes/ui/src/utils';
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
import { IOverallWorkDet, IPerform } from '../types';
import { IProductsData } from '../../types';
import { JOB_TYPE_CHOISES } from '../../constants';

type Props = {
  renderButton: (
    props: IButtonMutateProps & { disabled: boolean }
  ) => JSX.Element;
  closeModal: () => void;
  perform?: IPerform;
  overallWorkDetail: IOverallWorkDet;
  max: number;
};

type State = {
  count: number;
  startAt: Date;
  endAt: Date;
  needProducts: IProductsData[];
  resultProducts: IProductsData[];
  inProducts: IProductsData[];
  outProducts: IProductsData[];
};

class Form extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;

  constructor(props) {
    super(props);

    const { overallWorkDetail, perform } = this.props;
    let startAt = new Date();
    let endAt = new Date();
    const overCount = overallWorkDetail.count;
    let count = 1;
    const needProducts = overallWorkDetail.needProductsData.map(np => ({
      ...np,
      quantity: np.quantity / overCount
    }));
    const resultProducts = overallWorkDetail.resultProductsData.map(rp => ({
      ...rp,
      quantity: rp.quantity / overCount
    }));

    let inProducts = needProducts;
    let outProducts = resultProducts;

    if (perform) {
      startAt = perform.startAt;
      endAt = perform.endAt;
      count = perform ? perform.count : 1;
      inProducts = perform.inProducts;
      outProducts = perform.outProducts;
    }

    this.state = {
      startAt,
      endAt,
      count,
      needProducts,
      resultProducts,
      inProducts,
      outProducts
    };
  }

  generateDoc = (values: {
    _id?: string;
    needProducts: IProductsData[];
    resultProducts: IProductsData[];
  }) => {
    const { perform, overallWorkDetail } = this.props;

    const { key } = overallWorkDetail;
    const {
      type,
      inBranchId,
      inDepartmentId,
      outBranchId,
      outDepartmentId,
      typeId
    } = key;
    const finalValues = values;
    const {
      count,
      startAt,
      endAt,
      inProducts,
      outProducts,
      needProducts,
      resultProducts
    } = this.state;

    if (perform) {
      finalValues._id = perform._id;
    }

    return {
      ...(perform || {}),
      ...finalValues,
      overallWorkId: overallWorkDetail._id,
      overallWorkKey: key,
      startAt,
      endAt,
      type,
      typeId,
      inBranchId,
      inDepartmentId,
      outBranchId,
      outDepartmentId,
      count,
      inProducts,
      outProducts,
      needProducts,
      resultProducts
    };
  };

  renderViewInfo = (name: string, variable: number, uom: string) => {
    return (
      <li key={Math.random()}>
        <FieldStyle>{__(name)}</FieldStyle>
        <SidebarCounter>
          {variable || 0} /${uom}/
        </SidebarCounter>
      </li>
    );
  };

  renderProductsInfo = (name: string, products: any[]) => {
    const { count } = this.state;
    const result: React.ReactNode[] = [];

    result.push(
      <li key={Math.random()}>
        <FieldStyle>{__(name)}</FieldStyle>
        <SidebarCounter>{(products || []).length}</SidebarCounter>
      </li>
    );

    for (const product of products) {
      const { uom } = product;
      const productName = product.product ? product.product.name : 'not name';
      const uomCode = uom ? uom.code : 'not uom';

      result.push(
        this.renderViewInfo(productName, product.quantity * count, uomCode)
      );
    }

    return result;
  };

  renderDetailNeed() {
    const { needProducts } = this.state;

    return (
      <SidebarList className="no-link">
        {this.renderProductsInfo('Need Products', needProducts || [])}
      </SidebarList>
    );
  }

  renderDetailResult() {
    const { resultProducts } = this.state;

    return (
      <SidebarList className="no-link">
        {this.renderProductsInfo('Result Products', resultProducts || [])}
      </SidebarList>
    );
  }

  renderView = (
    name: string,
    variable: number,
    uom: string,
    stateName: 'inProducts' | 'outProducts',
    productId: string
  ) => {
    const onChangePerView = e => {
      if (this.timer) {
        clearTimeout(this.timer);
      }

      const inputVal = e.target.value;

      this.timer = setTimeout(() => {
        const productsData = (stateName === 'inProducts'
          ? this.state.inProducts
          : this.state.outProducts || []
        ).map(pd =>
          pd.productId === productId ? { ...pd, quantity: inputVal } : pd
        );

        this.setState({
          [stateName]: productsData
        } as any);
      }, 500);
    };

    return (
      <li key={Math.random()}>
        <FieldStyle>
          {__(name)} /${uom}/
        </FieldStyle>
        <SidebarCounter>
          <FormControl
            defaultValue={variable}
            type="number"
            required={true}
            onChange={onChangePerView}
          />
        </SidebarCounter>
      </li>
    );
  };

  renderProducts = (
    name: string,
    productsData: any[],
    stateName: 'inProducts' | 'outProducts'
  ) => {
    const result: React.ReactNode[] = [];

    result.push(
      <li key={Math.random()}>
        <FieldStyle>{__(name)}</FieldStyle>
        <SidebarCounter>{(productsData || []).length}</SidebarCounter>
      </li>
    );

    for (const data of productsData) {
      const { uom } = data;
      const productName = data.product ? data.product.name : 'not name';
      const uomCode = uom ? uom.code : 'not uom';

      result.push(
        this.renderView(
          productName,
          data.quantity,
          uomCode,
          stateName,
          data.productId
        )
      );
    }

    return result;
  };

  renderPerformIn() {
    const { inProducts } = this.state;

    return (
      <SidebarList className="no-link">
        {this.renderProducts('In Products', inProducts || [], 'inProducts')}
      </SidebarList>
    );
  }

  renderPerformOut() {
    const { outProducts } = this.state;

    return (
      <SidebarList className="no-link">
        {this.renderProducts('Out Products', outProducts || [], 'outProducts')}
      </SidebarList>
    );
  }

  onChangeCount = e => {
    const { needProducts, resultProducts } = this.state;
    const count = Number(e.target.value);

    this.setState({
      count,
      inProducts: needProducts.map(np => ({
        ...np,
        quantity: np.quantity * count
      })),
      outProducts: resultProducts.map(rp => ({
        ...rp,
        quantity: rp.quantity * count
      }))
    });
  };

  renderLabel = (max?: number) => {
    return max && max > 0 ? `Count /max: ${max}/` : `Count`;
  };

  onSelectDate = (value, name) => {
    this.setState({ [name]: value } as any);
  };

  renderLoc(obj) {
    if (!obj) {
      return 'unknown';
    }

    return `${obj.code} - ${obj.title}`;
  }

  renderContent = (formProps: IFormProps) => {
    const {
      closeModal,
      renderButton,
      max,
      overallWorkDetail,
      perform
    } = this.props;
    const { values, isSubmitted } = formProps;
    const { count, startAt, endAt } = this.state;

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>{__(`Start Date`)}</ControlLabel>
              <DateContainer>
                <DateControl
                  name="startAt"
                  dateFormat="YYYY/MM/DD"
                  timeFormat={true}
                  placeholder="Choose date"
                  value={startAt}
                  onChange={value => this.onSelectDate(value, 'startAt')}
                />
              </DateContainer>
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>
                {this.renderLabel(max)}
              </ControlLabel>
              <FormControl
                name="count"
                defaultValue={count}
                type="number"
                max={overallWorkDetail.type !== 'income' ? max : undefined}
                autoFocus={true}
                required={true}
                onChange={this.onChangeCount}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>{__(`End Date`)}</ControlLabel>
              <DateContainer>
                <DateControl
                  name="endAt"
                  dateFormat="YYYY/MM/DD"
                  timeFormat={true}
                  placeholder="Choose date"
                  value={endAt}
                  onChange={value => this.onSelectDate(value, 'endAt')}
                />
              </DateContainer>
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Type</ControlLabel>
              <FormControl
                name="type"
                componentClass="select"
                value={overallWorkDetail.type}
                required={false}
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
          <FormColumn>
            <FormGroup>
              <ControlLabel>
                {__(`In Branch`)}: {this.renderLoc(overallWorkDetail.inBranch)}
              </ControlLabel>
            </FormGroup>
            <FormGroup>
              <ControlLabel>
                {__(`In Department`)}:{' '}
                {this.renderLoc(overallWorkDetail.inDepartment)}
              </ControlLabel>
            </FormGroup>
          </FormColumn>

          <FormColumn>
            <FormGroup>
              <ControlLabel>
                {__(`Out Branch`)}:{' '}
                {this.renderLoc(overallWorkDetail.outBranch)}
              </ControlLabel>
            </FormGroup>
            <FormGroup>
              <ControlLabel>
                {__(`Out Department`)}:{' '}
                {this.renderLoc(overallWorkDetail.outDepartment)}
              </ControlLabel>
            </FormGroup>
          </FormColumn>
        </FormWrapper>

        <Box title={'Plan Details:'}>
          <FormWrapper>
            <FormColumn>{this.renderDetailNeed()}</FormColumn>
            <FormColumn>{this.renderDetailResult()}</FormColumn>
          </FormWrapper>
        </Box>

        <Box title={'Perform Details:'}>
          <FormWrapper>
            <FormColumn>{this.renderPerformIn()}</FormColumn>
            <FormColumn>{this.renderPerformOut()}</FormColumn>
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
            object: perform,
            disabled:
              overallWorkDetail.type !== 'income' && max < this.state.count
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
