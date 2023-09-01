import React from 'react';

import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import CommonForm from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Uploader from '@erxes/ui/src/components/Uploader';
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
import {
  extractAttachment,
  generateCategoryOptions
} from '@erxes/ui/src/utils';
import { IProductCategory } from '../types';
import { PRODUCT_CATEGORY_STATUSES } from '../constants';
import { ICategory } from '@erxes/ui/src/utils/categories';
import CategoryMask from '../containers/CategoryMask';
import { __ } from '@erxes/ui/src/utils/core';

type Props = {
  categories: IProductCategory[];
  category?: IProductCategory;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  attachment?: IAttachment;
  maskType?: string;
  mask: any;
  parentId: string;
  code: string;
};

class CategoryForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const category = props.category || ({} as ICategory);
    const attachment = category.attachment || undefined;

    this.state = {
      attachment,
      maskType: category.maskType || '',
      mask: category.mask || {},
      parentId: category.parentId || '',
      code: category.code || ''
    };
  }

  generateDoc = (values: { _id?: string; attachment?: IAttachment }) => {
    const { category, categories } = this.props;
    const finalValues = values;
    const { attachment, maskType, mask, parentId, code } = this.state;

    if (category) {
      finalValues._id = category._id;
    }

    let genMaskType = maskType;
    let genMask = mask;

    const parentCategory = categories.find(c => c._id === parentId);
    if (parentCategory && parentCategory.maskType === 'hard') {
      genMaskType = parentCategory.maskType;
      genMask = parentCategory.mask;
    }

    if (parentCategory && parentCategory.maskType === 'soft') {
      if (mask.isSimilar) {
        genMaskType = parentCategory.maskType;
        genMask = parentCategory.mask;
      }
    }

    return {
      ...finalValues,
      maskType: genMaskType,
      mask: genMask,
      parentId,
      code,
      attachment
    };
  };

  onChangeAttachment = (files: IAttachment[]) => {
    this.setState({ attachment: files ? files[0] : undefined });
  };

  onChange = e => {
    const { categories } = this.props;

    const name = e.target.name;
    const value = e.target.value;

    const initMask = code => {
      const { mask } = this.state;
      const values = (mask?.values || []).filter(v => v.title !== 'category');
      values.unshift({
        id: 'category',
        title: 'category',
        len: code.length,
        static: code
      });
      this.setState({ mask: { ...mask, values } });
    };

    const { maskType, parentId } = this.state;
    const parentCategory = categories.find(c => c._id === value);
    this.setState(
      {
        [name]: value
      } as any,
      () => {
        if (name === 'parentId') {
          this.setState({
            maskType: parentCategory?.maskType || '',
            mask: parentCategory?.mask || {}
          });
        }
        if (['code', 'maskType'].includes(name) && maskType) {
          if (
            !(parentId && parentCategory && parentCategory.maskType === 'hard')
          ) {
            initMask(name === 'code' ? value : this.state.code);
          } else {
            this.setState({ mask: parentCategory?.mask || {} });
          }
        }
      }
    );
  };

  generateMaskTypes = () => {
    const { categories } = this.props;
    const { parentId } = this.state;
    const parentCategory = categories.find(c => c._id === parentId);

    if (parentCategory?.maskType === 'hard') {
      return <option value="hard">{__('Hard: Заавал удамших')}</option>;
    }

    if (parentCategory?.maskType === 'soft') {
      return (
        <>
          <option value="soft">{__('Soft: Удамших албагүй')}</option>
          <option value="hard">{__('Hard: Заавал удамших')}</option>
        </>
      );
    }

    return (
      <>
        <option value="">{__('Any: No mask')}</option>
        <option value="soft">{__('Soft: Удамших албагүй')}</option>
        <option value="hard">{__('Hard: Заавал удамших')}</option>
      </>
    );
  };

  renderMask = () => {
    const { categories, category } = this.props;
    const { maskType, mask, parentId, code } = this.state;

    if (!maskType) {
      return null;
    }

    const parentCategory = categories.find(c => c._id === parentId);

    const changeCode = (code: string) => {
      this.setState({ code });
    };

    const changeMask = (mask: any) => {
      this.setState({ mask });
    };

    return (
      <>
        {(parentCategory && parentCategory.maskType === 'soft' && (
          <>
            <ControlLabel>Is similar of parent</ControlLabel>
            <FormControl
              name="isSimilar"
              componentClass="checkbox"
              defaultChecked={mask.isSimilar}
              onChange={(e: any) =>
                this.setState({
                  mask: { ...mask, isSimilar: e.target.checked }
                })
              }
            />
          </>
        )) || <></>}
        <CategoryMask
          parentCategory={parentCategory}
          categoryId={category?._id}
          code={code}
          maskType={maskType}
          mask={mask}
          changeCode={changeCode}
          changeMask={changeMask}
        />
      </>
    );
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal, category, categories } = this.props;
    const { maskType, parentId } = this.state;
    const { values, isSubmitted } = formProps;
    const object = category || ({} as IProductCategory);

    const attachments =
      (object.attachment && extractAttachment([object.attachment])) || [];

    return (
      <>
        <FormGroup>
          <ControlLabel>Parent Category</ControlLabel>

          <FormControl
            {...formProps}
            name="parentId"
            componentClass="select"
            defaultValue={parentId}
            onChange={this.onChange}
          >
            <option value="" />
            {generateCategoryOptions(categories, object._id, true)}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Code</ControlLabel>
          <FormControl
            {...formProps}
            name="code"
            defaultValue={object.code}
            required={true}
            onChange={this.onChange}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Mask type</ControlLabel>
          <FormControl
            {...formProps}
            componentClass="select"
            name="maskType"
            defaultValue={maskType}
            onChange={this.onChange}
          >
            {this.generateMaskTypes()}
          </FormControl>
        </FormGroup>

        {this.renderMask()}

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
          <ControlLabel>Meta</ControlLabel>
          <FormControl {...formProps} name="meta" defaultValue={object.meta} />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            componentClass="textarea"
            rows={5}
            defaultValue={object.description}
          />
        </FormGroup>

        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>State</ControlLabel>

              <FormControl
                {...formProps}
                name="status"
                componentClass="select"
                defaultValue={object.status}
                options={PRODUCT_CATEGORY_STATUSES}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Image</ControlLabel>

              <Uploader
                defaultFileList={attachments}
                onChange={this.onChangeAttachment}
                multiple={false}
                single={true}
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
            name: 'product & service category',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: category
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default CategoryForm;
