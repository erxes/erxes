import {
  SignatureChooserFooter,
  SignatureDropdownWrapper,
  SignatureHiderButton,
  SignatureOptionWrapper
} from './styles';

import Dropdown from 'react-bootstrap/Dropdown';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { IBrand } from '@erxes/ui/src/brands/types';
import { IEmailSignature } from '@erxes/ui-settings/src/email/types';
import Icon from '@erxes/ui/src/components/Icon';
import { Label } from '@erxes/ui/src/components/form/styles';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  signatureContent: any;
  brands: IBrand[];
  signatures: IEmailSignature[];
  emailSignature: string;
  emailContent: string;

  // hooks
  onContentChange: (content: string) => void;
  onSignatureChange: (signature: string) => void;
};

const SignatureChooser = ({
  signatures,
  emailSignature,
  signatureContent,
  brands,
  emailContent,
  onContentChange,
  onSignatureChange
}: Props) => {
  const removeSignature = ({
    openingTag = '<data>',
    closingTag = '</data>',
    content
  }) => {
    const closingTagLength = closingTag.length + 1;
    const firstIndexOfSignature = content.indexOf(openingTag);
    const lastIndexOfSignature = content.indexOf(closingTag) + closingTagLength;
    let contentWithoutSignature = '';
    // If tag is found removing it and appending new signature value to the editor content /
    if (firstIndexOfSignature > -1) {
      contentWithoutSignature = content
        .slice(0, firstIndexOfSignature)
        .concat(content.slice(lastIndexOfSignature));

      // Although tag is removed empty <openingTag></closingTag> tags could be there since it's in editor content and not removed /
      const remainingDataTagIndx = contentWithoutSignature.indexOf(openingTag);
      const lastRemainingDataTagIndx =
        contentWithoutSignature.indexOf(closingTag) + closingTagLength;
      // If empty tag is found removing it*/
      if (remainingDataTagIndx > -1) {
        contentWithoutSignature = contentWithoutSignature
          .slice(0, remainingDataTagIndx)
          .concat(contentWithoutSignature.slice(lastRemainingDataTagIndx));
      }
    } else {
      contentWithoutSignature = content;
    }
    return contentWithoutSignature;
  };

  const handleSignatureHide = () => {
    onContentChange(removeSignature({ content: emailContent }));
    onSignatureChange('');
  };

  const handleSignatureSelection = (val: string) => {
    /** If the current selection is same as previous, do nothing */
    if (emailSignature === val) {
      return;
    }

    const brandSignature = signatures?.find(
      (signature: IEmailSignature) => signature?.brandId === val
    );

    /** If selected brand exists */
    if (brandSignature) {
      const signatureString = brandSignature.signature || '';

      onContentChange(
        removeSignature({ content: emailContent }).concat(
          `<data><span> -- </span>${signatureString}</data>`
        )
      );

      onSignatureChange(val);
    }
  };

  const renderSignatureDropdownItem = (signature: IEmailSignature) => {
    const brandName =
      brands.find((brand: IBrand) => brand._id === signature.brandId)?.name ||
      '';

    return (
      <React.Fragment key={`${signature.brandId}-${signature.signature}`}>
        <SignatureDropdownWrapper>
          <Dropdown.Item
            as="button"
            onClick={() => handleSignatureSelection(signature.brandId || '')}
            active={emailSignature === signature.brandId}
          >
            <SignatureOptionWrapper>{brandName}</SignatureOptionWrapper>
          </Dropdown.Item>
        </SignatureDropdownWrapper>
      </React.Fragment>
    );
  };

  const renderSignatures = () => {
    if (brands.length === 0 || signatures.length === 0) {
      return (
        <SignatureOptionWrapper>
          <EmptyState icon="clipboard-1" text="No signatures" />
        </SignatureOptionWrapper>
      );
    }

    return (signatures || []).map((signature: IEmailSignature) =>
      renderSignatureDropdownItem(signature)
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
          <SignatureHiderButton onClick={() => handleSignatureHide()}>
            Hide Signature
          </SignatureHiderButton>
        )}
        <ModalTrigger
          title={__('Email signatures')}
          trigger={
            <div role="button" aria-label={__('Signature settings')}>
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
