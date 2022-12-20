import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import {
  Button,
  ControlLabel,
  extractAttachment,
  Form as CommonForm,
  FormControl,
  FormGroup,
  ModalTrigger,
  Tabs,
  TabTitle,
  Uploader
} from '@erxes/ui/src';
import EditorCK from '@erxes/ui/src/components/EditorCK';
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
import { isEnabled } from '@erxes/ui/src/utils/core';
import React from 'react';
import { IAsset, IAssetCategoryTypes } from '../../common/types';
import { SelectWithAssetCategory, SelectWithAssets } from '../../common/utils';
import { TabContainer, TabContent, TriggerTabs } from '../../style';
import CategoryForm from '../category/containers/Form';

type Props = {
  asset?: IAsset;
  assets: IAsset[];
  categories: IAssetCategoryTypes[];
  queryParams: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};
type State = {
  assetCount: number;
  minimiumCount: number;
  attachment?: IAttachment;
  attachmentMore?: IAttachment[];
  vendorId: string;
  parentId: string;
  categoryId: string;
  description: string;
  currentTab: string;
};
class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    const asset = props.asset || ({} as IAsset);
    const {
      attachment,
      attachmentMore,
      assetCount,
      minimiumCount,
      vendorId,
      parentId,
      categoryId,
      description
    } = asset;

    this.state = {
      assetCount: assetCount ? assetCount : 0,
      minimiumCount: minimiumCount ? minimiumCount : 0,
      attachment: attachment ? attachment : undefined,
      attachmentMore: attachmentMore ? attachmentMore : undefined,
      vendorId: vendorId ? vendorId : '',
      categoryId: categoryId ? categoryId : '',
      parentId: parentId ? parentId : '',
      description: description ? description : '',
      currentTab: parentId ? 'Parent' : 'Category'
    };

    this.renderContent = this.renderContent.bind(this);
  }

  generateDoc = (values: {
    _id?: string;
    attachment?: IAttachment;
    attachmentMore?: IAttachment[];
    assetCount: number;
    minimiumCount: number;
    vendorId: string;
    description: string;
  }) => {
    const { asset } = this.props;
    const finalValues = values;
    const {
      attachment,
      attachmentMore,
      assetCount,
      minimiumCount,
      vendorId,
      description,
      parentId,
      categoryId
    } = this.state;

    if (asset) {
      finalValues._id = asset._id;
    }

    finalValues.attachment = attachment;

    return {
      ...finalValues,
      attachment,
      attachmentMore,
      assetCount,
      minimiumCount,
      vendorId,
      description,
      parentId,
      categoryId
    };
  };

  renderFormTrigger(trigger: React.ReactNode) {
    const content = props => (
      <CategoryForm {...props} categories={this.props.categories} />
    );

    return (
      <ModalTrigger
        title="Add Asset Category"
        trigger={trigger}
        content={content}
      />
    );
  }
  onChangeDescription = e => {
    this.setState({ description: e.editor.getData() });
  };

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
  onChangeAttachment = (files: IAttachment[]) => {
    this.setState({ attachment: files.length ? files[0] : undefined });
  };

  onChangeAttachmentMore = (files: IAttachment[]) => {
    this.setState({ attachmentMore: files ? files : undefined });
  };

  onChangeCurrentTab = selecteTab => {
    switch (selecteTab) {
      case 'Parent':
        this.setState({ categoryId: '', currentTab: selecteTab });
        break;
      case 'Category':
        this.setState({ parentId: '', currentTab: selecteTab });
        break;
    }
  };

  renderContent(formProps: IFormProps) {
    const { asset, queryParams, closeModal, renderButton } = this.props;

    const { description, vendorId } = this.state;

    const { values, isSubmitted } = formProps;

    const object = asset || ({} as IAsset);

    const attachments =
      (object.attachment && extractAttachment([object.attachment])) || [];

    const attachmentsMore =
      (object.attachmentMore && extractAttachment(object.attachmentMore)) || [];

    const addCategoryTrigger = (
      <Button btnStyle="primary" uppercase={false} icon="plus-circle">
        Add category
      </Button>
    );

    const currentTabItem = () => {
      const { currentTab } = this.state;

      const handleSelect = (value, name) => {
        this.setState({ [name]: value } as Pick<State, keyof State>);
      };

      if (currentTab === 'Parent') {
        return (
          <FormGroup>
            <ControlLabel required={true}>Parent</ControlLabel>
            <SelectWithAssets
              label="Choose Asset"
              name="parentId"
              multi={false}
              initialValue={object.parentId}
              onSelect={handleSelect}
              customOption={{ value: '', label: 'Choose Asset' }}
            />
          </FormGroup>
        );
      }

      const categoryDefaultValue = () => {
        if (object?.categoryId) {
          return object.categoryId;
        }
        if (queryParams?.categoryId) {
          return queryParams.categoryId;
        }
        return undefined;
      };

      return (
        <FormGroup>
          <ControlLabel required={true}>Category</ControlLabel>
          <FormWrapper>
            <FormColumn>
              <SelectWithAssetCategory
                label="Choose Asset Category"
                name="categoryId"
                multi={false}
                initialValue={categoryDefaultValue()}
                onSelect={handleSelect}
                customOption={{ value: '', label: 'Choose Asset Category' }}
              />
            </FormColumn>
            {this.renderFormTrigger(addCategoryTrigger)}
          </FormWrapper>
        </FormGroup>
      );
    };

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
              <ControlLabel required={true}>Code</ControlLabel>
              <p>
                Depending on your business type, you may type in a barcode or
                any other UPC (Universal Asset Code). If you don't use UPC, type
                in any numeric value to differentiate your assets.
              </p>
              <FormControl
                {...formProps}
                name="code"
                defaultValue={object.code}
                required={true}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
        <TabContainer>
          <TriggerTabs>
            <Tabs full>
              {['Category', 'Parent'].map(item => (
                <TabTitle
                  className={this.state.currentTab === item ? 'active' : ''}
                  key={item}
                  onClick={this.onChangeCurrentTab.bind(this, item)}
                >
                  {item}
                </TabTitle>
              ))}
            </Tabs>
          </TriggerTabs>
          <TabContent>{currentTabItem()}</TabContent>
        </TabContainer>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <EditorCK
                content={description}
                onChange={this.onChangeDescription}
                height={150}
                isSubmitted={formProps.isSaved}
                name={`asset_description_${description}`}
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
            text: 'asset and movements',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: asset
          })}
        </ModalFooter>
      </>
    );
  }

  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default Form;
