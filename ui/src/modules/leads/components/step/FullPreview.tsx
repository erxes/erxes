import Icon from 'modules/common/components/Icon';
import { Tabs, TabTitle } from 'modules/common/components/tabs';

import { __ } from 'modules/common/utils';
import FieldForm from 'modules/forms/components/FieldForm';
import FieldsPreview from 'modules/forms/components/FieldsPreview';
import { IFormData } from 'modules/forms/types';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import CalloutPreview from './preview/CalloutPreview';
import FormPreview from './preview/FormPreview';
import SuccessPreview from './preview/SuccessPreview';
import {
  CarouselInner,
  CarouselSteps,
  DesktopPreview,
  FlexItem,
  FullPreview,
  MobilePreview,
  TabletPreview
} from './style';

type Props = {
  formData: IFormData;
  type: string;
  calloutTitle?: string;
  calloutBtnText?: string;
  bodyValue?: string;
  color: string;
  theme: string;
  image?: string;
  onChange: (name: 'carousel', value: string) => void;
  onDocChange?: (doc: IFormData) => void;
  carousel: string;
  thankTitle?: string;
  thankContent?: string;
  skip?: boolean;
};

type State = {
  currentTab: string;
  currentMode: 'create' | 'update' | undefined;
  currentField?: IField;
  fields: IField[];
};

class FullPreviewStep extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      currentTab: 'desktop',
      currentMode: undefined,
      currentField: undefined,
      fields: (props.formData && props.formData.fields) || []
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    this.setState({ fields: nextProps.formData.fields || [] });
  }

  carouseItems = (name: string, value: string) => {
    const onClick = () => this.onChangePreview(value);

    return (
      <CarouselInner selected={this.props.carousel === value}>
        <li>
          <span onClick={onClick} />
        </li>
        <span>{__(name)}</span>
      </CarouselInner>
    );
  };

  onChangeTab = (currentTab: string) => {
    this.setState({ currentTab });
  };

  onFieldClick = (field: IField) => {
    this.setState({ currentMode: 'update', currentField: field });
  };

  onFieldSubmit = (field: IField) => {
    const { fields, currentMode } = this.state;

    let selector = { fields, currentField: undefined };

    if (currentMode === 'create') {
      selector = {
        fields: [...fields, field],
        currentField: undefined
      };
    }

    this.setState(selector, () => {
      this.renderReturnValues(fields);
    });
  };

  onFieldDelete = (field: IField) => {
    // remove field from state
    const fields = this.state.fields.filter(f => f._id !== field._id);

    this.setState({ fields, currentField: undefined }, () => {
      this.renderReturnValues(fields);
    });
  };

  onFieldFormCancel = () => {
    this.setState({ currentField: undefined });
  };

  onChangeFieldsOrder = fields => {
    this.setState({ fields }, () => {
      this.renderReturnValues(fields);
    });
  };

  onChangePreview = (value: string) => {
    return this.props.onChange('carousel', value);
  };

  renderReturnValues(fields) {
    const { onDocChange, formData } = this.props;

    if (onDocChange) {
      onDocChange({
        fields,
        title: formData.title,
        desc: formData.desc,
        btnText: formData.btnText,
        type: formData.type
      });
    }
  }

  renderPreview() {
    const { carousel, formData } = this.props;
    const { currentMode, currentField, fields } = this.state;

    if (carousel === 'callout') {
      return <CalloutPreview {...this.props} />;
    }

    if (carousel === 'form') {
      const { desc } = formData;

      if (currentField) {
        return (
          <FieldForm
            mode={currentMode || 'create'}
            field={currentField}
            onSubmit={this.onFieldSubmit}
            onDelete={this.onFieldDelete}
            onCancel={this.onFieldFormCancel}
          />
        );
      }

      const previewRenderer = () => (
        <FieldsPreview
          fields={fields || []}
          formDesc={desc}
          onFieldClick={this.onFieldClick}
          onChangeFieldsOrder={this.onChangeFieldsOrder}
        />
      );

      return (
        <FormPreview
          {...this.props}
          title={formData.title}
          btnText={formData.btnText}
          previewRenderer={previewRenderer}
        />
      );
    }

    return <SuccessPreview {...this.props} />;
  }

  renderResolutionPreview() {
    const { currentTab } = this.state;

    if (currentTab === 'desktop') {
      return <DesktopPreview>{this.renderPreview()}</DesktopPreview>;
    }

    if (currentTab === 'tablet') {
      return <TabletPreview>{this.renderPreview()}</TabletPreview>;
    }

    return <MobilePreview>{this.renderPreview()}</MobilePreview>;
  }

  render() {
    const { currentTab } = this.state;

    return (
      <FlexItem>
        <FullPreview>
          <Tabs full={true}>
            <TabTitle
              className={currentTab === 'desktop' ? 'active' : ''}
              onClick={this.onChangeTab.bind(this, 'desktop')}
            >
              <Icon icon="monitor-1" /> {__('Desktop')}
            </TabTitle>
            <TabTitle
              className={currentTab === 'tablet' ? 'active' : ''}
              onClick={this.onChangeTab.bind(this, 'tablet')}
            >
              <Icon icon="tablet" /> {__('Tablet')}
            </TabTitle>
            <TabTitle
              className={currentTab === 'mobile' ? 'active' : ''}
              onClick={this.onChangeTab.bind(this, 'mobile')}
            >
              <Icon icon="mobile-android" /> {__('Mobile')}
            </TabTitle>
          </Tabs>
          {this.renderResolutionPreview()}

          <CarouselSteps>
            {!this.props.skip && this.carouseItems('CallOut', 'callout')}
            {this.carouseItems('Form', 'form')}
            {this.carouseItems('Success', 'success')}
          </CarouselSteps>
        </FullPreview>
      </FlexItem>
    );
  }
}

export default FullPreviewStep;
