import {
  Button,
  Form as CommonForm,
  ControlLabel,
  DateControl,
  FormControl,
  FormGroup,
  Uploader,
} from '@erxes/ui/src/components';
import { RichTextEditor } from '@erxes/ui/src/components/richTextEditor/TEditor';
import { TabTitle, Tabs } from '@erxes/ui/src/components/tabs';
import {
  DateContainer,
  FormColumn,
  FormWrapper,
  ModalFooter,
} from '@erxes/ui/src/styles/main';
import {
  IAttachment,
  IButtonMutateProps,
  IFormProps,
} from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import { extractAttachment } from '@erxes/ui/src/utils/core';
import React, { useState } from 'react';
import Select from 'react-select';
import { COUPON_APPLY_TYPES } from '../../../loyalties/coupons/constants';
import { IConfig, ICouponCampaign } from '../types';
import CodeRuleForm from './CodeForm';
import RestrictionForm from './RestrictionForm';

type Props = {
  couponCampaign: ICouponCampaign;
  queryParams: any;
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

const Form = (props: Props) => {
  const { queryParams, couponCampaign, renderButton, closeModal } = props;

  const [currentTab, setCurrentTab] = useState('campaign');
  const [campaignState, setCampaignState] = useState(couponCampaign || {});

  const generateDoc = (values: {
    _id?: string;
    attachment?: IAttachment;
    description: string;
  }) => {
    const finalValues = values;

    if (campaignState._id) {
      finalValues._id = campaignState._id;
    }

    const { buyScore = 0 } = campaignState;

    return {
      ...finalValues,
      ...campaignState,
      buyScore: Number(buyScore),
    };
  };

  const handleOnChange = ({
    files,
    content,
    event,
    dateType,
    date,
    rule,
    restrictions,
  }: {
    files?: IAttachment[];
    content?: string;
    event?: React.FormEvent<HTMLElement>;
    dateType?: string;
    date?: React.FormEvent<HTMLElement>;
    rule?: IConfig;
    restrictions?: any;
  }) => {
    setCampaignState((prevState) => {
      const updatedCampaign = { ...prevState };

      if (files) {
        updatedCampaign.attachment = files.length > 0 ? files[0] : undefined;
      }

      if (content) {
        updatedCampaign.description = content;
      }

      if (event) {
        const { name, value, type } = event.target as
          | HTMLInputElement
          | HTMLTextAreaElement;
        updatedCampaign[name] = type === 'number' ? Number(value) : value;
      }

      if (dateType && date) {
        updatedCampaign[dateType] = date;
      }

      if (rule) {
        updatedCampaign.codeRule = {
          ...updatedCampaign.codeRule,
          ...rule,
        };
      }

      if (restrictions) {
        updatedCampaign.restrictions = {
          ...updatedCampaign.restrictions,
          ...restrictions,
        };
      }

      return updatedCampaign;
    });
  };

  const renderDefaultContent = (formProps) => {
    const attachments =
      (campaignState.attachment &&
        extractAttachment([campaignState.attachment])) ||
      [];

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Title</ControlLabel>
              <FormControl
                {...formProps}
                name="title"
                defaultValue={campaignState.title}
                autoFocus={true}
                onChange={(event) => handleOnChange({ event })}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Buy Score</ControlLabel>
              <FormControl
                {...formProps}
                name="buyScore"
                type="number"
                min={0}
                required={false}
                defaultValue={campaignState.buyScore}
                onChange={(event) => handleOnChange({ event })}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Type</ControlLabel>
              <Select
                options={COUPON_APPLY_TYPES}
                value={COUPON_APPLY_TYPES.find(
                  (type) => type.value === campaignState.kind,
                )}
                onChange={(option) => {
                  handleOnChange({
                    event: {
                      target: { name: 'kind', value: option?.value },
                    } as any,
                  });

                  handleOnChange({
                    event: {
                      target: { name: 'value', value: 0 },
                    } as any,
                  });
                }}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Count</ControlLabel>
              <FormControl
                {...formProps}
                name="value"
                type="number"
                min={0}
                required={false}
                value={campaignState.value}
                onChange={(event) => handleOnChange({ event })}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Start Date</ControlLabel>
              <DateContainer>
                <DateControl
                  {...formProps}
                  name="startDate"
                  placeholder={__('Start date')}
                  value={campaignState.startDate}
                  onChange={(date) =>
                    handleOnChange({ dateType: 'startDate', date })
                  }
                />
              </DateContainer>
            </FormGroup>
          </FormColumn>

          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>End Date</ControlLabel>
              <DateContainer>
                <DateControl
                  {...formProps}
                  name="endDate"
                  placeholder={__('End date')}
                  value={campaignState.endDate}
                  onChange={(date) =>
                    handleOnChange({ dateType: 'endDate', date })
                  }
                />
              </DateContainer>
            </FormGroup>
          </FormColumn>

          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Finish Date of Use</ControlLabel>
              <DateContainer>
                <DateControl
                  {...formProps}
                  name="finishDateOfUse"
                  placeholder={__('Finish Date of Use')}
                  value={campaignState.finishDateOfUse}
                  onChange={(date) =>
                    handleOnChange({ dateType: 'finishDateOfUse', date })
                  }
                />
              </DateContainer>
            </FormGroup>
          </FormColumn>
        </FormWrapper>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <RichTextEditor
            content={campaignState.description || ''}
            onChange={(content) => handleOnChange({ content })}
            height={150}
            isSubmitted={formProps.isSaved}
            name="couponCampaign_description"
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
          <ControlLabel>Featured image</ControlLabel>

          <Uploader
            defaultFileList={attachments}
            onChange={(files) => handleOnChange({ files })}
            multiple={false}
            single={true}
          />
        </FormGroup>
      </>
    );
  };

  const renderRestrictionContent = (formProps) => {
    return (
      <RestrictionForm
        restrictions={campaignState.restrictions || {}}
        onChange={(restrictions) => handleOnChange({ restrictions })}
      />
    );
  };

  const renderCodeContent = (formProps) => {
    return (
      <CodeRuleForm
        queryParams={queryParams}
        formProps={formProps}
        codeRule={campaignState.codeRule || {}}
        onChange={(codeRule) => handleOnChange({ rule: codeRule })}
      />
    );
  };

  const renderTabContent = (formProps) => {
    const { values, isSubmitted } = formProps;

    let content;

    if (['', 'campaign'].includes(currentTab)) {
      content = renderDefaultContent(formProps);
    }

    if ('restriction' === currentTab) {
      content = renderRestrictionContent(formProps);
    }

    if ('code' === currentTab) {
      content = renderCodeContent(formProps);
    }

    if (content) {
      return (
        <>
          {content}
          <ModalFooter>
            <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
              Close
            </Button>

            {renderButton({
              name: 'codeConfig',
              values: generateDoc(values),
              isSubmitted,
              object: couponCampaign,
            })}
          </ModalFooter>
        </>
      );
    }

    return null;
  };

  const renderContent = (formProps: IFormProps) => {
    return (
      <>
        <Tabs full={true}>
          <TabTitle
            onClick={() => setCurrentTab('campaign')}
            className={['', 'campaign'].includes(currentTab) ? 'active' : ''}
          >
            {__('Campaign')}
          </TabTitle>
          <TabTitle
            onClick={() => setCurrentTab('restriction')}
            className={currentTab === 'restriction' ? 'active' : ''}
          >
            {__('Restriction')}
          </TabTitle>
          <TabTitle
            onClick={() => setCurrentTab('code')}
            className={currentTab === 'code' ? 'active' : ''}
          >
            {__('Code rule')}
          </TabTitle>
        </Tabs>
        <br />
        {renderTabContent(formProps)}
      </>
    );
  };

  return <CommonForm renderContent={renderContent} />;
};

export default Form;
