import {
  FormColumn,
  FormWrapper,
  ModalFooter
} from '@erxes/ui/src/styles/main';
import {
  IAttachment,
  IButtonMutateProps,
  IFormProps
} from '@erxes/ui/src/types';
import { IProduct, IProductCategory, IUom } from '../types';
import { TAX_TYPES, TYPES } from '../constants';
import { BarcodeContainer, BarcodeItem } from '../styles';
import {
  extractAttachment,
  generateCategoryOptions
} from '@erxes/ui/src/utils';

import Button from '@erxes/ui/src/components/Button';
import CategoryForm from '../containers/CategoryForm';
import CommonForm from '@erxes/ui/src/components/form/Form';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import EditorCK from '@erxes/ui/src/components/EditorCK';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import { Row } from '@erxes/ui-inbox/src/settings/integrations/styles';
import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import Uploader from '@erxes/ui/src/components/Uploader';
import AutoCompletionSelect from '@erxes/ui/src/components/AutoCompletionSelect';
import { queries } from '../graphql';

type Props = {
  product?: IProduct;
  productCategories: IProductCategory[];
  uoms?: IUom[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  barcodes: string[];
  barcodeInput: string;
  barcodeDescription: string;
  attachment?: IAttachment;
  attachmentMore?: IAttachment[];
  vendorId: string;
  description: string;
  uom: string;
  subUoms: any[];
  taxType: string;
  taxCode: string;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const product = props.product || ({} as IProduct);
    const {
      attachment,
      attachmentMore,
      barcodes,
      barcodeDescription,
      vendorId,
      description,
      uom,
      subUoms,
      taxType,
      taxCode
    } = product;

    this.state = {
      barcodes: barcodes ? barcodes : [],
      barcodeInput: '',
      barcodeDescription: barcodeDescription ? barcodeDescription : '',
      attachment: attachment ? attachment : undefined,
      attachmentMore: attachmentMore ? attachmentMore : undefined,
      vendorId: vendorId ? vendorId : '',
      description: description ? description : '',
      uom,
      subUoms: subUoms ? subUoms : [],
      taxType,
      taxCode
    };
  }

  generateDoc = (values: {
    _id?: string;
    barcodes?: string[];
    attachment?: IAttachment;
    attachmentMore?: IAttachment[];
    productCount: number;
    minimiumCount: number;
    vendorId: string;
    description: string;
    uom: string;
    subUoms: [];
  }) => {
    const { product } = this.props;
    const finalValues = values;
    const {
      attachment,
      attachmentMore,
      barcodes,
      barcodeDescription,
      vendorId,
      description,
      uom,
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
      barcodes,
      barcodeDescription,
      vendorId,
      description,
      uom,
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

  renderSubUoms() {
    const { uoms } = this.props;
    const { subUoms } = this.state;

    return subUoms.map(subUom => {
      const updateUoms = (key, value) => {
        const { subUoms } = this.state;
        subUom[key] = value;
        this.setState({
          subUoms: subUoms.map(su => (su._id === subUom._id ? subUom : su))
        });
      };

      const onChangeUom = ({ selectedOption }) => {
        updateUoms('uom', selectedOption);
      };

      const onChangeRatio = e => {
        const name = e.currentTarget.name;
        let value = e.currentTarget.value;
        if (name === 'inverse') {
          value = 1 / e.currentTarget.value || 1;
        }
        updateUoms('ratio', value);
      };

      return (
        <FormWrapper key={subUom._id}>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Sub UOM</ControlLabel>
              <AutoCompletionSelect
                defaultValue={subUom.uom}
                defaultOptions={(uoms || []).map(e => e.code)}
                autoCompletionType="uoms"
                placeholder="Enter an uom"
                queryName="uoms"
                query={queries.uoms}
                onChange={onChangeUom}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Ratio</ControlLabel>
              <Row>
                <FormControl
                  name="ratio"
                  value={subUom.ratio}
                  onChange={onChangeRatio}
                  type="number"
                />
              </Row>
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel>~Inverse Ratio</ControlLabel>
              <Row>
                <FormControl
                  name="inverse"
                  value={Math.round((1 / (subUom.ratio || 1)) * 100) / 100}
                  onChange={onChangeRatio}
                  type="number"
                />
              </Row>
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <Row>
              <Button
                btnStyle="simple"
                uppercase={false}
                icon="cancel-1"
                onClick={this.onClickMinusSub.bind(this, subUom._id)}
              />
            </Row>
          </FormColumn>
        </FormWrapper>
      );
    });
  }

  onComboEvent = (variable: string, e) => {
    let value = '';

    switch (variable) {
      case 'vendorId':
        value = e;
        break;
      default:
        value = e.target.value;
    }

    this.setState({ [variable]: value } as any);
  };

  onChangeUom = ({ selectedOption }) => {
    this.setState({ uom: selectedOption });
  };

  updateBarcodes = (barcode?: string) => {
    const value = barcode || this.state.barcodeInput || '';
    if (!value) {
      return;
    }

    const { barcodes } = this.state;

    if (barcodes.includes(value)) {
      return;
    }

    barcodes.unshift(value);

    this.setState({ barcodes, barcodeInput: '' });
  };

  onClickAddSub = () => {
    const subUoms = this.state.subUoms;

    subUoms.push({ uom: '', ratio: 0, _id: Math.random().toString() });
    this.setState({ subUoms });
  };

  onClickMinusSub = id => {
    const subUoms = this.state.subUoms;
    const filteredUoms = subUoms.filter(sub => sub._id !== id);

    this.setState({ subUoms: filteredUoms });
  };

  onChangeDescription = e => {
    this.setState({ description: e.editor.getData() });
  };

  onChangeBarcodeDescription = e => {
    this.setState({ barcodeDescription: e.editor.getData() });
  };

  onChangeAttachment = (files: IAttachment[]) => {
    this.setState({ attachment: files.length ? files[0] : undefined });
  };

  onChangeAttachmentMore = (files: IAttachment[]) => {
    this.setState({ attachmentMore: files ? files : undefined });
  };

  onChangeBarcodeInput = e => {
    this.setState({ barcodeInput: e.target.value });

    if (e.target.value.length - this.state.barcodeInput.length > 1)
      this.updateBarcodes(e.target.value);
  };

  onKeyDownBarcodeInput = e => {
    if (e.key === 'Enter') {
      e.preventDefault();

      this.updateBarcodes();
    }
  };

  onClickBarcode = (index: number) => {
    const splicedBarcodes = [...this.state.barcodes];
    splicedBarcodes.splice(index, 1);
    this.setState({ barcodes: [...splicedBarcodes] });
  };

  onTaxChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    } as any);
  };

  renderContent = (formProps: IFormProps) => {
    const {
      renderButton,
      closeModal,
      product,
      productCategories,
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
      barcodeDescription,
      taxType,
      taxCode
    } = this.state;

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
                autoComplete="off"
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
            <FormGroup>
              <ControlLabel>Tax Type</ControlLabel>
              <FormControl
                {...formProps}
                name="taxType"
                componentClass="select"
                onChange={this.onTaxChange}
                defaultValue={taxType}
                options={[
                  { value: '', label: 'default' },
                  ...Object.keys(TAX_TYPES).map(type => ({
                    value: type,
                    label: TAX_TYPES[type].label
                  }))
                ]}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Tax Code</ControlLabel>

              <FormControl
                {...formProps}
                name="taxCode"
                componentClass="select"
                onChange={this.onTaxChange}
                defaultValue={taxCode}
                options={(TAX_TYPES[taxType || ''] || {}).options || []}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
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
              <ControlLabel>Barcodes</ControlLabel>
              <Row>
                <FormControl
                  {...formProps}
                  name="barcodes"
                  value={this.state.barcodeInput}
                  autoComplete="off"
                  onChange={this.onChangeBarcodeInput}
                  onKeyDown={this.onKeyDownBarcodeInput}
                />
                <Button
                  btnStyle="primary"
                  icon="plus-circle"
                  onClick={() => this.updateBarcodes()}
                >
                  Add barcode
                </Button>
              </Row>
              <BarcodeContainer>
                {this.state.barcodes.map((item: any, index: number) => {
                  return (
                    <BarcodeItem
                      key={index}
                      onClick={() => this.onClickBarcode(index)}
                    >
                      {item}
                    </BarcodeItem>
                  );
                })}
              </BarcodeContainer>
            </FormGroup>

            <FormGroup>
              <ControlLabel>Barcode Description</ControlLabel>
              <EditorCK
                content={barcodeDescription}
                onChange={this.onChangeBarcodeDescription}
                height={150}
                isSubmitted={formProps.isSaved}
                name={`product_barcode_description_${barcodeDescription}`}
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
              <ControlLabel>UOM</ControlLabel>
              <Row>
                <AutoCompletionSelect
                  defaultValue={this.state.uom}
                  defaultOptions={(uoms || []).map(e => e.code)}
                  autoCompletionType="uoms"
                  placeholder="Enter an uom"
                  queryName="uoms"
                  query={queries.uoms}
                  onChange={this.onChangeUom}
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

            {this.renderSubUoms()}
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
