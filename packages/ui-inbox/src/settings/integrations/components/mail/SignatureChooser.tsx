import React from 'react';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';
import { Label } from '@erxes/ui/src/components/form/styles';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Dropdown from 'react-bootstrap/Dropdown';
import {
  SignatureChooserFooter,
  SignatureHiderButton,
  SignatureOptionWrapper
} from './styles';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { __ } from '@erxes/ui/src/utils';
import { IBrand } from '@erxes/ui/src/brands/types';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';

const SignatureChooser = ({
  signatures,
  onSelect,
  value,
  hideSignature,
  signatureContent,
  brands
}) => {
  const renderSignatures = () => {
    return signatures?.length ? (
      signatures?.map(
        (signature: { brandId: any; signature: string }, index: number) => {
          const brandName =
            brands?.find((brand: IBrand) => brand._id === signature?.brandId)
              ?.name || '';
          return (
            <React.Fragment key={signature.brandId + signature.signature}>
              <Dropdown.Item
                onClick={() => onSelect(signature.brandId)}
                active={value === signature.brandId}
              >
                <SignatureOptionWrapper>{brandName}</SignatureOptionWrapper>
              </Dropdown.Item>
              {signatures?.length - 1 !== index && <Dropdown.Divider />}
            </React.Fragment>
          );
        }
      )
    ) : (
      <SignatureOptionWrapper>
        <EmptyState icon="clipboard-1" text="No signatures" />
      </SignatureOptionWrapper>
    );
  };

  const renderIcon = ({ text, icon }: { text: string; icon: string }) => {
    return (
      <Tip text={__(text)} placement="top">
        <Label>
          <Icon icon={icon} />
        </Label>
      </Tip>
    );
  };

  const renderSignatureFooter = () => {
    const noSignatures = !signatures?.length;
    return (
      <SignatureChooserFooter noSignatures={noSignatures}>
        {!noSignatures && (
          <SignatureHiderButton onClick={hideSignature}>
            Hide Signature
          </SignatureHiderButton>
        )}
        <ModalTrigger
          title={__('Email signatures')}
          trigger={
            <div role="button">
              <Tip text={__('Signature settings')} placement="top">
                <Label>
                  <Icon icon={'settings'} />
                </Label>
              </Tip>
            </div>
          }
          content={signatureContent}
        />
      </SignatureChooserFooter>
    );
  };

  return (
    <Dropdown>
      <Dropdown.Toggle as={DropdownToggle} id="signature-dropdown">
        {renderIcon({ text: 'Insert signature', icon: 'edit-alt' })}
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ overflow: 'auto', maxHeight: 500 }}>
        {renderSignatures()}
        {renderSignatureFooter()}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default SignatureChooser;
