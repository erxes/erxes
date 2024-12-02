import {
  SignatureChooserFooter,
  SignatureDropdownWrapper,
  SignatureHiderButton,
  SignatureOptionWrapper,
  SignatureContainer,
  SignatureContentWrapper,
} from "./styles";

import EmptyState from "@erxes/ui/src/components/EmptyState";
import { IBrand } from "@erxes/ui/src/brands/types";
import { IEmailSignature } from "@erxes/ui-settings/src/email/types";
import Icon from "@erxes/ui/src/components/Icon";
import { Label } from "@erxes/ui/src/components/form/styles";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import React, { useState } from "react";
import Tip from "@erxes/ui/src/components/Tip";
import { __ } from "@erxes/ui/src/utils";
import Popover from "@erxes/ui/src/components/Popover";

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
  onSignatureChange,
}: Props) => {
  const [showPreview, setShowPreview] = useState("");

  const removeSignature = ({
    openingTag = "<data>",
    closingTag = "</data>",
    content,
  }) => {
    const closingTagLength = closingTag.length + 1;
    const firstIndexOfSignature = content.indexOf(openingTag);
    const lastIndexOfSignature = content.indexOf(closingTag) + closingTagLength;
    let contentWithoutSignature = "";
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
    onSignatureChange("");
  };

  const handleSignatureSelection = (val: string, close: any) => {
    /** If the current selection is same as previous, do nothing */
    close();

    if (emailSignature === val) {
      return;
    }

    const brandSignature = signatures?.find(
      (signature: IEmailSignature) => signature?.brandId === val
    );

    /** If selected brand exists */
    if (brandSignature) {
      const signatureString = brandSignature.signature || "";

      onContentChange(
        removeSignature({ content: emailContent }).concat(
          `<data><span> -- </span>${signatureString}</data>`
        )
      );

      onSignatureChange(val);
    }
  };

  const renderSignatureDropdownItem = (
    signature: IEmailSignature,
    close: any
  ) => {
    const brandName =
      brands.find((brand: IBrand) => brand._id === signature.brandId)?.name ||
      "";
    return (
      <React.Fragment key={`${signature.brandId}-${signature.signature}`}>
        <SignatureDropdownWrapper
          className={`${emailSignature === signature.brandId ? "active" : ""}`}
        >
          <SignatureOptionWrapper>
            <button
              onClick={() =>
                handleSignatureSelection(signature.brandId || "", close)
              }
            >
              <b>{brandName}</b>
            </button>
            <Icon
              icon="eye"
              onClick={() => setShowPreview(signature.brandId || "")}
            />
          </SignatureOptionWrapper>
          <SignatureContentWrapper show={signature.brandId === showPreview}>
            <div
              onClick={() =>
                handleSignatureSelection(signature.brandId || "", close)
              }
              dangerouslySetInnerHTML={{
                __html: signature.signature || "",
              }}
            />
          </SignatureContentWrapper>
        </SignatureDropdownWrapper>
      </React.Fragment>
    );
  };

  const renderSignatures = (close) => {
    if (signatures.length === 0) {
      return (
        <SignatureOptionWrapper>
          <EmptyState icon="clipboard-1" text="No signatures" />
        </SignatureOptionWrapper>
      );
    }

    return (signatures || []).map((signature: IEmailSignature) =>
      renderSignatureDropdownItem(signature, close)
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
      <SignatureChooserFooter $noSignatures={noSignatures}>
        {!noSignatures && (
          <SignatureHiderButton onClick={() => handleSignatureHide()}>
            Hide Signature
          </SignatureHiderButton>
        )}
        <ModalTrigger
          title={__("Email signatures")}
          trigger={
            <div role="button" aria-label={__("Signature settings")}>
              <Tip text={__("Signature settings")} placement="top">
                <Label>
                  <Icon icon={"settings"} />
                </Label>
              </Tip>
            </div>
          }
          content={signatureContent}
        />
      </SignatureChooserFooter>
    );
  };

  const popoverContent = (close) => {
    return (
      <>
        <div className="popover-header">{__("Signatures")}</div>
        <SignatureContainer>{renderSignatures(close)}</SignatureContainer>
        {renderSignatureFooter()}
      </>
    );
  };

  return (
    <Popover
      trigger={renderIcon({ text: "Insert signature", icon: "edit-alt" })}
      closeAfterSelect={true}
      placement="top-end"
    >
      {popoverContent}
    </Popover>
  );
};

export default SignatureChooser;
