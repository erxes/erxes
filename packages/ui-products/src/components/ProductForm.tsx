import { BarcodeItem, TableBarcode } from "../styles";
import {
  FormColumn,
  FormWrapper,
  ModalFooter,
} from "@erxes/ui/src/styles/main";
import {
  IAttachment,
  IButtonMutateProps,
  IFormProps,
  IPdfAttachment,
} from "@erxes/ui/src/types";
import { IProduct, IProductCategory, IUom, IVariant } from "../types";
import React, { useEffect, useState } from "react";
import { TYPES } from "../constants";
import { __, router } from "@erxes/ui/src/utils/core";

import ActionButtons from "@erxes/ui/src/components/ActionButtons";
import AutoCompletionSelect from "@erxes/ui/src/components/AutoCompletionSelect";
import Button from "@erxes/ui/src/components/Button";
import CategoryForm from "../containers/CategoryForm";
import CommonForm from "@erxes/ui/src/components/form/Form";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import Icon from "@erxes/ui/src/components/Icon";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import { RichTextEditor } from "@erxes/ui/src/components/richTextEditor/TEditor";
import { Row } from "../styles";
import Select from "react-select";
import SelectBrands from "@erxes/ui/src/brands/containers/SelectBrands";
import SelectCompanies from "@erxes/ui-contacts/src/companies/containers/SelectCompanies";
import Tip from "@erxes/ui/src/components/Tip";
import Uploader from "@erxes/ui/src/components/Uploader";
import { extractAttachment } from "@erxes/ui/src/utils";
import { queries } from "../graphql";
import { useLocation } from "react-router-dom";
import PdfUploader from "@erxes/ui/src/components/PdfUploader";

type Props = {
  product?: IProduct;
  productCategories: IProductCategory[];
  uoms?: IUom[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  barcodes: string[];
  variants: IVariant;
  barcodeInput: string;
  barcodeDescription: string;
  attachment?: IAttachment;
  attachmentMore?: IAttachment[];
  pdfAttachment?: IPdfAttachment;
  vendorId: string;
  description: string;
  uom: string;
  subUoms: { _id: string; uom: string; ratio: number }[];
  scopeBrandIds: string[];
  categoryId: string;
  code: string;
  category?: IProductCategory;
  maskStr?: string;
  type: string;
};

const Form = (props: Props) => {
  const location = useLocation();
  const product = props.product || ({} as IProduct);
  const {
    attachment,
    attachmentMore,
    barcodes,
    variants,
    barcodeDescription,
    vendorId,
    description,
    uom,
    subUoms,
    scopeBrandIds,
    code,
    categoryId,
  } = product;

  const paramCategoryId = router.getParam(location, "categoryId");
  const fixVariants = {};

  for (const barcode of barcodes || []) {
    fixVariants[barcode] = (variants || {})[barcode] || {};
  }

  const [state, setState] = useState<State>({
    ...product,
    barcodes: barcodes || [],
    variants: fixVariants,
    barcodeInput: "",
    barcodeDescription: barcodeDescription || "",
    attachment: attachment,
    attachmentMore: attachmentMore,
    vendorId: vendorId || "",
    description: description || "",
    uom: uom || "",
    subUoms: subUoms || [],
    scopeBrandIds,
    code: code || "",
    categoryId: categoryId || paramCategoryId,
    type: product.type || "",
    pdfAttachment: product.pdfAttachment || undefined,
  });

  useEffect(() => {
    if (!state.categoryId && props.productCategories.length > 0) {
      setState({
        ...state,
        categoryId: props.productCategories[0]._id,
      });
    }
  }, [state.categoryId, props.productCategories]);

  const getMaskStr = (categoryId) => {
    const { code } = state;
    const { productCategories } = props;

    const category = productCategories.find((pc) => pc._id === categoryId);
    let maskStr = "";

    if (category && category.maskType && category.mask) {
      const maskList: any[] = [];
      for (const value of category.mask.values || []) {
        if (value.static) {
          maskList.push(value.static);
          continue;
        }

        if (value.type === "char") {
          maskList.push(value.char);
        }

        if (value.type === "customField" && value.matches) {
          maskList.push(`(${Object.values(value.matches).join("|")})`);
        }
      }
      maskStr = `${maskList.join("")}\w+`;

      if (maskList.length && !code) {
        setState((prevState) => ({ ...prevState, code: maskList[0] }));
      }
    }
    setState((prevState) => ({ ...prevState, maskStr }));

    return category;
  };

  const generateDoc = (values: {
    _id?: string;
    barcodes?: string[];
    variants?: IVariant;
    attachment?: IAttachment;
    attachmentMore?: IAttachment[];
    productCount: number;
    minimiumCount: number;
    vendorId: string;
    description: string;
    uom: string;
    subUoms: [];
  }) => {
    const { product } = props;
    const finalValues = values;
    const {
      attachment,
      attachmentMore,
      barcodes,
      variants,
      barcodeDescription,
      vendorId,
      description,
      uom,
      subUoms,
      scopeBrandIds,
      code,
      categoryId
    } = state;

    if (product) {
      finalValues._id = product._id;
    }

    finalValues.attachment = attachment;

    const pdfAttachment: any = { ...state.pdfAttachment };

    if (pdfAttachment && pdfAttachment.__typename) {
      delete pdfAttachment.__typename;
    }

    if (pdfAttachment.pdf && pdfAttachment.pdf.__typename) {
      delete pdfAttachment.pdf.__typename;
    }

    pdfAttachment.pages = pdfAttachment.pages?.map((p) => {
      const page = { ...p };
      if (page && page.__typename) {
        delete page.__typename;
      }
      return page;
    });

    return {
      ...product,
      ...finalValues,
      code,
      categoryId,
      scopeBrandIds,
      attachment,
      attachmentMore,
      barcodes,
      variants,
      barcodeDescription,
      vendorId,
      description,
      pdfAttachment,
      uom,
      subUoms: (subUoms || [])
        .filter((su) => su.uom)
        .map((su) => ({
          ...su,
          ratio: Math.abs(Number(su.ratio)) || 1,
        })),
    };
  };

  const getUoms = (uoms?: IUom[]) =>
    (uoms || [])
      .filter(({ isForSubscription }) =>
        state.type === TYPES.SUBSCRIPTION
          ? isForSubscription
          : !isForSubscription
      )
      .map((e) => e.code);

  const renderFormTrigger = (trigger: React.ReactNode) => {
    const content = (formProps) => (
      <CategoryForm {...formProps} categories={props.productCategories || []} />
    );

    return (
      <ModalTrigger title="Add category" trigger={trigger} content={content} />
    );
  };

  const renderSubUoms = () => {
    const { uoms } = props;
    const { subUoms = [] } = state;

    return subUoms.map((subUom) => {
      const updateUoms = (key, value) => {
        const { subUoms = [] } = state;

        setState((prevState) => ({
          ...prevState,
          subUoms: subUoms.map((su) => (su._id === subUom._id ? { ...subUom, [key]: value } : su)),
        }));
      };

      const onChangeUom = ({ selectedOption }) => {
        updateUoms("uom", selectedOption);
      };

      const onChangeRatio = (e) => {
        const name = e.currentTarget.name;
        let value = e.currentTarget.value;
        if (name === "inverse") {
          value = Number((1 / e.currentTarget.value || 1).toFixed(13));
        }
        updateUoms("ratio", value);
      };

      return (
        <FormWrapper key={subUom._id}>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Sub UOM</ControlLabel>
              <AutoCompletionSelect
                defaultValue={subUom.uom}
                defaultOptions={getUoms(uoms)}
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
                  min={0}
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
                onClick={onClickMinusSub.bind(this, subUom._id)}
              />
            </Row>
          </FormColumn>
        </FormWrapper>
      );
    });
  };

  const onComboEvent = (variable: string, e) => {
    let value = "";

    switch (variable) {
      case "vendorId":
        value = e;
        break;
      default:
        value = e.target.value;
    }

    setState((prevState) => ({ ...prevState, [variable]: value }));
  };

  const onChangeUom = ({ selectedOption }) => {
    setState((prevState) => ({ ...prevState, uom: selectedOption }));
  };

  const updateBarcodes = (barcode?: string) => {
    const value = barcode || state.barcodeInput || "";
    if (!value) {
      return;
    }

    const tempBarcodes = [...state.barcodes || []]

    if (barcodes.includes(value)) {
      return;
    }

    tempBarcodes.unshift(value);

    setState((prevState) => ({ ...prevState, barcodes: tempBarcodes, barcodeInput: "" }));
  };

  const onClickAddSub = () => {
    const subUoms = [...(state.subUoms || [])];

    subUoms.push({ uom: "", ratio: 1, _id: Math.random().toString() });
    setState((prevState) => ({ ...prevState, subUoms }));
  };

  const onClickMinusSub = (id) => {
    const subUoms = state.subUoms;
    const filteredUoms = subUoms.filter((sub) => sub._id !== id);

    setState((prevState) => ({ ...prevState, subUoms: filteredUoms }));
  };

  const onChangeDescription = (content: string) => {
    setState((prevState) => ({ ...prevState, description: content }));
  };

  const onChangeBarcodeDescription = (content: string) => {
    setState((prevState) => ({ ...prevState, barcodeDescription: content }));
  };

  const onChangeAttachment = (files: IAttachment[]) => {
    setState((prevState) => ({
      ...prevState,
      attachment: files.length ? files[0] : undefined,
    }));
  };

  const onChangeAttachmentMore = (files: IAttachment[]) => {
    setState((prevState) => ({
      ...prevState,
      attachmentMore: files ? files : undefined,
    }));
  };

  const onChangeBarcodeInput = (e) => {
    setState((prevState) => ({ ...prevState, barcodeInput: e.target.value }));

    if (e.target.value.length - state.barcodeInput.length > 1)
      updateBarcodes(e.target.value);
  };

  const onKeyDownBarcodeInput = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      updateBarcodes();
    }
  };

  const onClickBarcode = (value: string) => {
    setState((prevState) => ({
      ...prevState,
      barcodes: state.barcodes.filter((b) => b !== value),
    }));
  };

  const onChangeCateogry = (option) => {
    const value = option.value;

    setState((prevState) => ({
      ...prevState,
      categoryId: value,
      category: getMaskStr(value),
    }));
  };

  const onChangeBrand = (brandIds: string[]) => {
    setState((prevState) => ({ ...prevState, scopeBrandIds: brandIds }));
  };

  const renderBarcodes = () => {
    const { barcodes, variants, attachmentMore } = state;
    if (!barcodes?.length) {
      return <></>;
    }

    const onChangePerImage = (item, e) => {
      const value = e.target.value;
      setState((prevState) => ({
        ...prevState,
        variants: {
          ...variants,
          [item]: {
            ...variants[item],
            image: (attachmentMore || []).find((a) => a.url === value),
          },
        },
      }));
    };

    return (
      <TableBarcode>
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Image</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {barcodes.map((item: any) => (
            <tr>
              <td>
                <BarcodeItem key={item} onClick={() => onClickBarcode(item)}>
                  {item}
                </BarcodeItem>
              </td>
              <td>
                <FormControl
                  name="name"
                  value={(variants[item] || {}).name || ""}
                  onChange={(e) =>
                    setState((prevState) => ({
                      ...prevState,
                      variants: {
                        ...variants,
                        [item]: {
                          ...variants[item],
                          name: (e.target as any).value,
                        },
                      },
                    }))
                  }
                />
              </td>
              <td>
                <FormControl
                  name="image"
                  componentclass="select"
                  value={((variants[item] || {}).image || {}).url || ""}
                  onChange={onChangePerImage.bind(this, item)}
                >
                  <option key={Math.random()} value="">
                    {" "}
                  </option>
                  {(attachmentMore || []).map((img) => (
                    <option key={img.url} value={img.url}>
                      {img.name}
                    </option>
                  ))}
                </FormControl>
              </td>
              <td>
                <ActionButtons>
                  <Button btnStyle="link" onClick={() => onClickBarcode(item)}>
                    <Tip text={__("Delete")} placement="bottom">
                      <Icon icon="trash" />
                    </Tip>
                  </Button>
                </ActionButtons>
              </td>
            </tr>
          ))}
        </tbody>
      </TableBarcode>
    );
  };

  const renderEditorField = (formProps: IFormProps, addinitionalProps) => {
    const { _id, description } = addinitionalProps

    const finalProps = {
      content: description,
      onChange: onChangeDescription,
      height: 150,
      isSubmitted: formProps.isSaved,
      toolbar: [
        "bold",
        "italic",
        "orderedList",
        "bulletList",
        "link",
        "unlink",
        "|",
        "image",
      ],
      name: `product_description_${_id || 'create'}`
    }

    return (
      <RichTextEditor {...finalProps} />
    )
  }

  const renderContent = (formProps: IFormProps) => {
    let { renderButton, closeModal, product, productCategories, uoms } = props;
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
      (object.attachmentMore &&
        object.attachmentMore.length &&
        extractAttachment(object.attachmentMore)) ||
      [];

    const {
      vendorId,
      description,
      barcodeDescription,
      scopeBrandIds,
      code,
      categoryId,
      maskStr,
    } = state;

    const generateOptions = () => {
      return productCategories.map((item) => ({
        label: item.name,
        value: item._id,
      }));
    };

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Category</ControlLabel>
              <Row>
                <Select
                  {...formProps}
                  placeholder={__('Choose a category')}
                  value={generateOptions().find(
                    (option) => option.value === categoryId
                  )}
                  options={generateOptions()}
                  isClearable={true}
                  onChange={onChangeCateogry}
                />
                {renderFormTrigger(trigger)}
              </Row>
            </FormGroup>

            <FormGroup>
              <ControlLabel required={true}>Code</ControlLabel>
              <p>
                Depending on your business type, you may type in a barcode or
                any other UPC (Universal Product Code). If you don't use UPC,
                type in any numeric value to differentiate your products. With
                pattern {maskStr}
              </p>
              <FormControl
                {...formProps}
                name='code'
                value={code}
                required={true}
                onChange={(e: any) => {
                  setState((prevState) => ({
                    ...prevState,
                    code: e.target.value.replace(/\*/g, ''),
                  }));
                }}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel required={true}>Name</ControlLabel>
              <FormControl
                {...formProps}
                name='name'
                defaultValue={object.name}
                autoFocus={true}
                required={true}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel required={true}>Short name</ControlLabel>
              <FormControl
                {...formProps}
                name='shortName'
                defaultValue={object.shortName}
                required={false}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel required={true}>Type</ControlLabel>
              <FormControl
                {...formProps}
                name='type'
                componentclass='select'
                defaultValue={object.type}
                required={true}
                onChange={(e) =>
                  setState((prevState) => ({
                    ...prevState,
                    type: (e.target as HTMLInputElement).value,
                  }))
                }
              >
                {Object.keys(TYPES)
                  .filter((type) => type !== 'ALL')
                  .map((typeName, index) => (
                    <option key={index} value={TYPES[typeName]}>
                      {typeName}
                    </option>
                  ))}
              </FormControl>
            </FormGroup>

            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              {renderEditorField(formProps, { _id: object._id, description })}
            </FormGroup>

            <FormGroup>
              <ControlLabel required={true}>Unit price</ControlLabel>
              <p>
                Please ensure you have set the default currency in the{' '}
                <a href='/settings/general'> {'General Settings'}</a> of the
                System Configuration.
              </p>
              <FormControl
                {...formProps}
                type='number'
                name='unitPrice'
                defaultValue={object.unitPrice}
                required={true}
                min={0}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Vendor</ControlLabel>
              <SelectCompanies
                label='Choose an vendor'
                name='vendorId'
                customOption={{ value: '', label: 'No vendor chosen' }}
                initialValue={vendorId}
                onSelect={onComboEvent.bind(this, 'vendorId')}
                multi={false}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Brand</ControlLabel>
              <SelectBrands
                label={__('Choose brands')}
                onSelect={(brandIds) => onChangeBrand(brandIds as string[])}
                initialValue={scopeBrandIds}
                multi={true}
                name='selectedBrands'
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Featured image</ControlLabel>
              <Uploader
                defaultFileList={attachments}
                onChange={onChangeAttachment}
                multiple={false}
                single={true}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Secondary Images</ControlLabel>
              <Uploader
                defaultFileList={attachmentsMore}
                onChange={onChangeAttachmentMore}
                multiple={true}
                single={false}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>PDF</ControlLabel>
              <PdfUploader
                attachment={state.pdfAttachment}
                onChange={(attachment?: IPdfAttachment) => {
                  setState((prevState) => ({
                    ...prevState,
                    pdfAttachment: attachment,
                  }));
                }}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Barcodes</ControlLabel>
              <Row>
                <FormControl
                  {...formProps}
                  name='barcodes'
                  value={state.barcodeInput}
                  autoComplete='off'
                  onChange={onChangeBarcodeInput}
                  onKeyDown={onKeyDownBarcodeInput}
                />
                <Button
                  btnStyle='primary'
                  icon='plus-circle'
                  onClick={() => updateBarcodes()}
                >
                  Add barcode
                </Button>
              </Row>
              {renderBarcodes()}
            </FormGroup>

            <FormGroup>
              <ControlLabel>Barcode Description</ControlLabel>
              <RichTextEditor
                content={barcodeDescription}
                onChange={onChangeBarcodeDescription}
                height={150}
                isSubmitted={formProps.isSaved}
                name={`product_barcode_description_${barcodeDescription}`}
                toolbar={[
                  'bold',
                  'italic',
                  'orderedList',
                  'bulletList',
                  'link',
                  'unlink',
                  '|',
                  'image',
                ]}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel required={true}>UOM</ControlLabel>
              <Row>
                <AutoCompletionSelect
                  defaultValue={state.uom}
                  defaultOptions={getUoms(uoms)}
                  autoCompletionType='uoms'
                  placeholder='Enter an uom'
                  queryName='uoms'
                  query={queries.uoms}
                  onChange={onChangeUom}
                  required={true}
                />
                <Button
                  btnStyle='primary'
                  uppercase={false}
                  icon='plus-circle'
                  onClick={onClickAddSub}
                >
                  Add sub
                </Button>
              </Row>
            </FormGroup>

            {renderSubUoms()}
          </FormColumn>
        </FormWrapper>

        <ModalFooter>
          <Button
            btnStyle='simple'
            onClick={closeModal}
            icon='times-circle'
            uppercase={false}
          >
            Close
          </Button>

          {renderButton({
            name: 'product and service',
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: product,
          })}
        </ModalFooter>
      </>
    );
  };

  return <CommonForm renderContent={renderContent} />;
};

export default Form;
