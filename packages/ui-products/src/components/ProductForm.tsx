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
  generateCategoryOptions
} from '@erxes/ui/src/utils';
import { TYPES, PRODUCT_SUPPLY } from '../constants';
import CategoryForm from '../containers/CategoryForm';
import { Row } from '@erxes/ui-settings/src/integrations/styles';
import { IProduct, IProductCategory, IUom, IConfigsMap } from '../types';

type Props = {
  product?: IProduct;
  productCategories: IProductCategory[];
  uoms?: IUom[];
  configsMap?: IConfigsMap;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  disabled: boolean;
  productCount: number;
  minimiumCount: number;
  attachment?: IAttachment;
  attachmentMore?: IAttachment[];
  vendorId: string;
  description: string;
  uomId: string;
  subUoms: any[];
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const product = props.product || ({} as IProduct);
    const {
      attachment,
      attachmentMore,
      supply,
      productCount,
      minimiumCount,
      vendorId,
      description,
      uomId,
      subUoms
    } = product;

    const defaultUom = props.configsMap.default_uom || '';

    this.state = {
      disabled: supply === 'limited' ? false : true,
      productCount: productCount ? productCount : 0,
      minimiumCount: minimiumCount ? minimiumCount : 0,
      attachment: attachment ? attachment : undefined,
      attachmentMore: attachmentMore ? attachmentMore : undefined,
      vendorId: vendorId ? vendorId : '',
      description: description ? description : '',
      uomId: uomId ? uomId : defaultUom,
      subUoms: subUoms ? subUoms : []
    };
  }

  generateDoc = (values: {
    _id?: string;
    attachment?: IAttachment;
    attachmentMore?: IAttachment[];
    productCount: number;
    minimiumCount: number;
    vendorId: string;
    description: string;
    uomId: string;
    subUoms: [];
  }) => {
    const { product } = this.props;
    const finalValues = values;
    const {
      attachment,
      attachmentMore,
      productCount,
      minimiumCount,
      vendorId,
      description,
      uomId,
      subUoms
    } = this.state;

    if (product) {
      finalValues._id = product._id;
    }

    finalValues.attachment = attachment;

    return {
      ...finalValues,
      attachment,
      attachmentMore,
      productCount,
      minimiumCount,
      vendorId,
      description,
      uomId,
      subUoms
    };
  };

  renderFormTrigger(trigger: React.ReactNode) {
    const content = props => (
      <CategoryForm {...props} categories={this.props.productCategories} />
    );

    return (
      <ModalTrigger title="Add category" trigger={trigger} content={content} />
    );
  }

  renderSubUoms(uoms) {
    const subUoms = this.state.subUoms;
    return subUoms.map(subUom => (
      <>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Sub UOM</ControlLabel>
              <Select
                value={subUom.uomId}
                onChange={this.updateUoms.bind(this, 'subUomId', subUom._id)}
                options={uoms.map(e => ({ value: e._id, label: e.name }))}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Ratio</ControlLabel>
              <Row>
                <FormControl
                  value={subUom.ratio}
                  onChange={this.updateUoms.bind(this, 'ratio', subUom._id)}
                  type="number"
                />
                <Button
                  btnStyle="simple"
                  uppercase={false}
                  icon="cancel-1"
                  onClick={this.onClickMinusSub.bind(this, subUom._id)}
                />
              </Row>
            </FormGroup>
          </FormColumn>
        </FormWrapper>
      </>
    ));
  }

  onComboEvent = (variable: string, e) => {
    let value = '';

    switch (variable) {
      case 'vendorId':
        value = e;
        break;
      case 'uomId':
        value = e ? e.value : '';
        break;
      default:
        value = e.target.value;
    }

    this.setState({ [variable]: value } as any);
  };

  updateUoms = (type, id, e) => {
    const { subUoms } = this.state;
    const condition = type === 'ratio';
    const value = condition ? e.target.value : e.value;

    let chosen = subUoms.find(sub => sub._id === id);
    const uomId = condition ? chosen.uomId : value;
    const ratio = condition ? value : chosen.ratio;

    chosen = { uomId, ratio, _id: id };

    const others = subUoms.filter(sub => sub._id !== id);

    others.push(chosen);
    this.setState({ subUoms: others });
  };

  onClickAddSub = () => {
    const subUoms = this.state.subUoms;
    const count = subUoms.length;

    subUoms.push({ uomId: '', ratio: 0, _id: count + 1 });
    this.setState({ subUoms });
  };

  onClickMinusSub = counter => {
    const subUoms = this.state.subUoms;
    const filteredUoms = subUoms.filter(sub => sub._id !== counter);

    this.setState({ subUoms: filteredUoms });
  };

  onChangeDescription = e => {
    this.setState({ description: e.editor.getData() });
  };

  onChangeAttachment = (files: IAttachment[]) => {
    this.setState({ attachment: files.length ? files[0] : undefined });
  };

  onChangeAttachmentMore = (files: IAttachment[]) => {
    this.setState({ attachmentMore: files ? files : undefined });
  };

  onSupplyChange = e => {
    const { productCount, minimiumCount } = this.state;
    const islimited = e.target.value === 'limited';
    const isUnique = e.target.value === 'unique';

    this.setState({
      disabled: islimited ? false : true,
      productCount: islimited ? productCount : isUnique ? 1 : 0,
      minimiumCount: islimited ? minimiumCount : 0
    });
  };

  renderContent = (formProps: IFormProps) => {
    const {
      renderButton,
      closeModal,
      product,
      productCategories,
      configsMap,
      uoms
    } = this.props;
    const { values, isSubmitted } = formProps;
    const object = product || ({} as IProduct);

    const trigger = (
      <Button btnStyle="primary" uppercase={false} icon="plus-circle">
        Add category
      </Button>
    );

    const attachments =
      (object.attachment && extractAttachment([object.attachment])) || [];

    const attachmentsMore =
      (object.attachmentMore && extractAttachment(object.attachmentMore)) || [];

    const {
      vendorId,
      description,
      productCount,
      disabled,
      minimiumCount,
      subUoms
    } = this.state;

    const isUom = configsMap.isReqiureUOM || false;

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Name</ControlLabel>
              <FormControl
                {...formProps}
                name="name"
                defaultValue={object.name}
                autoFocus={true}
                required={true}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel required={true}>Type</ControlLabel>
              <FormControl
                {...formProps}
                name="type"
                componentClass="select"
                defaultValue={object.type}
                required={true}
              >
                {Object.keys(TYPES).map((typeName, index) => (
                  <option key={index} value={TYPES[typeName]}>
                    {typeName}
                  </option>
                ))}
              </FormControl>
            </FormGroup>

            <FormGroup>
              <ControlLabel required={true}>Code</ControlLabel>
              <p>
                Depending on your business type, you may type in a barcode or
                any other UPC (Universal Product Code). If you don't use UPC,
                type in any numeric value to differentiate your products.
              </p>
              <FormControl
                {...formProps}
                name="code"
                defaultValue={object.code}
                required={true}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel required={true}>Category</ControlLabel>
              <Row>
                <FormControl
                  {...formProps}
                  name="categoryId"
                  componentClass="select"
                  defaultValue={object.categoryId}
                  required={true}
                >
                  {generateCategoryOptions(productCategories)}
                </FormControl>

                {this.renderFormTrigger(trigger)}
              </Row>
            </FormGroup>

            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <EditorCK
                content={description}
                onChange={this.onChangeDescription}
                height={150}
                isSubmitted={formProps.isSaved}
                name={`product_description_${description}`}
                toolbar={[
                  {
                    name: 'basicstyles',
                    items: [
                      'Bold',
                      'Italic',
                      'NumberedList',
                      'BulletedList',
                      'Link',
                      'Unlink',
                      '-',
                      'Image',
                      'EmojiPanel'
                    ]
                  }
                ]}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel required={true}>Unit price</ControlLabel>
              <p>
                Please ensure you have set the default currency in the{' '}
                <a href="/settings/general"> {'General Settings'}</a> of the
                System Configuration.
              </p>
              <FormControl
                {...formProps}
                type="number"
                name="unitPrice"
                defaultValue={object.unitPrice}
                required={true}
                min={0}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Product supply</ControlLabel>

              <FormControl
                {...formProps}
                name="supply"
                componentClass="select"
                onChange={this.onSupplyChange}
                defaultValue={object.supply}
                options={PRODUCT_SUPPLY}
              />
            </FormGroup>

            <FormWrapper>
              <FormColumn>
                <FormGroup>
                  <ControlLabel>Product count</ControlLabel>

                  <FormControl
                    {...formProps}
                    name="productCount"
                    value={productCount}
                    disabled={disabled}
                    onChange={this.onComboEvent.bind(this, 'productCount')}
                    type="number"
                  />
                </FormGroup>
              </FormColumn>
              <FormColumn>
                <FormGroup>
                  <ControlLabel>Minimium count</ControlLabel>

                  <FormControl
                    {...formProps}
                    name="minimiumCount"
                    value={minimiumCount}
                    disabled={disabled}
                    onChange={this.onComboEvent.bind(this, 'minimiumCount')}
                    type="number"
                  />
                </FormGroup>
              </FormColumn>
            </FormWrapper>

            <FormGroup>
              <ControlLabel>Featured image</ControlLabel>

              <Uploader
                defaultFileList={attachments}
                onChange={this.onChangeAttachment}
                multiple={false}
                single={true}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Secondary Images</ControlLabel>

              <Uploader
                defaultFileList={attachmentsMore}
                onChange={this.onChangeAttachmentMore}
                multiple={true}
                single={false}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Vendor</ControlLabel>
              <SelectCompanies
                label="Choose an vendor"
                name="vendorId"
                customOption={{ value: '', label: 'No vendor chosen' }}
                initialValue={vendorId}
                onSelect={this.onComboEvent.bind(this, 'vendorId')}
                multi={false}
              />
            </FormGroup>

            {!isUom && (
              <FormGroup>
                <ControlLabel>SKU</ControlLabel>
                <FormControl
                  {...formProps}
                  name="sku"
                  defaultValue={object.sku}
                />
              </FormGroup>
            )}

            {isUom && (
              <>
                <FormGroup>
                  <ControlLabel>UOM</ControlLabel>
                  <Row>
                    <Select
                      value={this.state.uomId}
                      onChange={this.onComboEvent.bind(this, 'uomId')}
                      options={uoms.map(e => ({ value: e._id, label: e.name }))}
                    />
                    <Button
                      btnStyle="primary"
                      uppercase={false}
                      icon="plus-circle"
                      onClick={this.onClickAddSub}
                    >
                      {' '}
                      Add sub
                    </Button>
                  </Row>
                </FormGroup>

                {this.renderSubUoms(uoms)}
              </>
            )}
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
            callback: closeModal,
            object: product
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
