import {
  Button,
  Form as CommonForm,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
  Spinner,
} from '@erxes/ui/src/components';
import { Label } from '@erxes/ui/src/components/form/styles';
import { MainStyleModalFooter as ModalFooter } from '@erxes/ui/src/styles/eindex';
import { FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React, { useEffect, useState } from 'react';
import { queries } from '../../../configs/couponCampaign/graphql';
import { ICouponCampaign } from '../../../configs/couponCampaign/types';
import SelectCampaigns from '../../containers/SelectCampaigns';

type Props = {
  queryParams: any;
  selectedCouponCampaign?: ICouponCampaign;
  loadingCouponCampaign?: boolean;
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  fetchCouponCampaign: (campaignId: string) => void;
};

type ICouponConfig = {
  campaignId: string;
  customConfig: Array<{
    usageLimit: number;
    redemptionLimitPerUser: number;
  }>;
};

const Form = (props: Props) => {
  const {
    selectedCouponCampaign,
    loadingCouponCampaign,
    closeModal,
    renderButton,
    fetchCouponCampaign,
  } = props;

  const [coupon, setCoupon] = useState<ICouponConfig>({} as ICouponConfig);
  const [showCustomConfig, setShowCustomConfig] = useState<boolean>(false);

  useEffect(() => {
    if (selectedCouponCampaign && selectedCouponCampaign.codeRule) {
      const { size, usageLimit, redemptionLimitPerUser } =
        selectedCouponCampaign.codeRule;

      if (size && showCustomConfig) {
        const customConfig = Array.from({ length: size }, () => ({
          usageLimit: usageLimit || 1,
          redemptionLimitPerUser: redemptionLimitPerUser || 1,
        }));

        setCoupon((prevState) => ({
          ...prevState,
          customConfig,
        }));
      }
    }
  }, [selectedCouponCampaign, showCustomConfig]);

  useEffect(() => {
    if (!showCustomConfig) {
      setCoupon((prevState) => ({
        ...prevState,
        customConfig: [],
      }));
    }
  }, [showCustomConfig]);

  const handleCampaignChange = (campaignId) => {
    setCoupon({ campaignId, customConfig: [] });
    setShowCustomConfig(false);

    fetchCouponCampaign(campaignId);
  };

  const handleCustomConfigChange = (index, event) => {
    const { name, value } = event.target as
      | HTMLInputElement
      | HTMLTextAreaElement;

    setCoupon((prev) => {
      const newCustomConfig = [...prev.customConfig];

      newCustomConfig[index] = {
        ...newCustomConfig[index],
        [name]: Number(value) || 1,
      };

      return {
        ...prev,
        customConfig: newCustomConfig,
      };
    });
  };

  const generateDoc = () => {
    return {
      ...coupon,
    };
  };

  const renderCampaignCustomRule = (formProps) => {
    const { codeRule } = selectedCouponCampaign || {};
    const { size } = codeRule || {};

    if (loadingCouponCampaign) {
      return <Spinner />;
    }

    if (!size) {
      return null;
    }

    return (
      <>
        <Label
          style={{
            cursor: 'pointer',
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
            marginBottom: '20px',
            textTransform: 'uppercase',
            userSelect: 'none',
          }}
          onClick={() => {
            setShowCustomConfig(!showCustomConfig);
          }}
        >
          {showCustomConfig ? (
            <>
              Use campaign config <Icon icon="uparrow" />
            </>
          ) : (
            <>
              Set custom config <Icon icon="downarrow-2" />
            </>
          )}
        </Label>
        {showCustomConfig &&
          coupon.customConfig.map((config, i) => (
            <FormWrapper key={i}>
              <FormColumn>
                <FormGroup>
                  <ControlLabel>Usage Limit</ControlLabel>
                  <FormControl
                    {...formProps}
                    name={`usageLimit`}
                    type="number"
                    min={1}
                    value={config.usageLimit}
                    onChange={(e) => handleCustomConfigChange(i, e)}
                  />
                </FormGroup>
              </FormColumn>

              <FormColumn>
                <FormGroup>
                  <ControlLabel>Redemption Limit Per User</ControlLabel>
                  <FormControl
                    name={`redemptionLimitPerUser`}
                    type="number"
                    min={1}
                    value={config.redemptionLimitPerUser}
                    onChange={(e) => handleCustomConfigChange(i, e)}
                  />
                </FormGroup>
              </FormColumn>
            </FormWrapper>
          ))}
      </>
    );
  };

  const renderContent = (formProps) => {
    const { isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <ControlLabel>Campaign</ControlLabel>
          <SelectCampaigns
            queryName="couponCampaigns"
            customQuery={queries.couponCampaigns}
            label="Choose coupon campaign"
            name="campaignId"
            onSelect={handleCampaignChange}
            initialValue={coupon.campaignId}
          />
        </FormGroup>

        {renderCampaignCustomRule(formProps)}

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            Close
          </Button>

          {renderButton({
            name: 'coupon',
            values: generateDoc(),
            isSubmitted,
            object: null,
          })}
        </ModalFooter>
      </>
    );
  };

  return <CommonForm renderContent={renderContent} />;
};

export default Form;
