import { __ } from "../utils/core";
import React, {
  Fragment,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import styled from "styled-components";
import { colors, dimensions } from "../styles";
import { rgba } from "../styles/ecolor";
import Button from "./Button";
import { ControlLabel } from "./form";
import Icon from "./Icon";
import { Dialog, Transition } from "@headlessui/react";
import { DialogContent, DialogWrapper, ModalOverlay } from "../styles/main";

const ModalBody = styled.div`
  text-align: center;
  padding: ${dimensions.coreSpacing}px;
  font-size: 15px;
  font-weight: 500;

  label {
    margin-top: ${dimensions.coreSpacing}px;
    font-size: 12px;
    color: #777;

    strong {
      color: ${colors.textPrimary};
    }
  }
`;

const ModalFooter = styled.div`
  padding: 10px ${dimensions.coreSpacing}px;
  background: ${colors.colorWhite};
  border-top: 1px solid ${colors.borderPrimary};
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  display: flex;
  justify-content: center;
`;

const IconWrapper = styled.div`
  font-size: 40px;
  color: ${colors.colorSecondary};
`;

const Error = styled.span`
  font-size: 12px;
  color: ${rgba(colors.colorCoreRed, 0.8)};

  strong {
    color: ${colors.colorCoreRed};
  }
`;

const Input = styled.input`
  display: block;
  border: none;
  width: 100%;
  height: 34px;
  padding: 10px 0;
  color: #444;
  border-bottom: 1px solid;
  border-color: #ddd;
  background: none;
  transition: all 0.3s ease;
  &:focus-visible {
    outline: none;
  }
`;

type Props = {
  options?: {
    okLabel?: string;
    cancelLabel?: string;
    enableEscape?: boolean;
    hasDeleteConfirm?: boolean;
    hasUpdateConfirm?: boolean;
    hasPasswordConfirm?: boolean;
  };
  confirmation?: string;
  proceed: (value?: string) => void;
  dismiss: () => void;
};

const ConfirmDialog = ({
  options = {},
  confirmation = "Are you sure?",
  proceed,
  dismiss,
}: Props) => {
  const [show, setShow] = useState(true);
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({} as any);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDismiss = useCallback(() => {
    setShow(false);
    dismiss();
  }, [dismiss]);

  const invokeProceed = useCallback(() => {
    const { hasPasswordConfirm = false } = options;
    setShow(false);
    proceed(hasPasswordConfirm ? confirm : "");
  }, [confirm, options, proceed]);

  const handleProceed = useCallback(() => {

    const { hasDeleteConfirm, hasUpdateConfirm, hasPasswordConfirm } = options;

    if (hasDeleteConfirm) {
      if (confirm === "delete") {
        return invokeProceed();
      }
      return setErrors({
        confirm: (
          <Error>
            Enter <strong>delete</strong> to confirm
          </Error>
        ),
      });
    }

    if (hasUpdateConfirm) {
      if (confirm === "update") {
        return invokeProceed();
      }
      return setErrors({
        confirm: (
          <Error>
            Enter <strong>update</strong> to confirm
          </Error>
        ),
      });
    }

    if (hasPasswordConfirm) {
      if (confirm !== "") {
        return invokeProceed();
      }
      return setErrors({
        confirm: (
          <Error>
            Enter <strong>password</strong> to confirm
          </Error>
        ),
      });
    }
    
    return invokeProceed();
  }, [confirm, invokeProceed, options]);

  const handleKeydown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleProceed();
      }
      if (e.key === "Escape") {
        handleDismiss();
      }
    },
    [handleProceed, handleDismiss]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [handleKeydown]);

  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        document.getElementById("confirmation-dialog")?.click();
        inputRef.current && inputRef.current.focus();
      }, 10);
    }
  }, []);

  const handleChange = useCallback((e) => {
    setConfirm(e.target.value);
  }, []);

  const renderConfirmDelete = useCallback(() => {
    const {
      hasDeleteConfirm = false,
      hasUpdateConfirm = false,
      hasPasswordConfirm = false,
    } = options;

    if (!hasDeleteConfirm && !hasUpdateConfirm && !hasPasswordConfirm) {
      return null;
    }

    let label;

    if (hasDeleteConfirm) {
      label = (
        <>
          Type <strong>delete</strong> in the field below to confirm.
        </>
      );
    } else if (hasUpdateConfirm) {
      label = (
        <>
          Type <strong>update</strong> in the field below to confirm.
        </>
      );
    } else if (hasPasswordConfirm) {
      label = <>Enter your password in the field below to confirm.</>;
    }

    return (
      <>
        <ControlLabel required={true} uppercase={false}>
          {label}
        </ControlLabel>
        <Input
          name="confirm"
          type={hasPasswordConfirm ? "password" : "text"}
          required={true}
          value={confirm}
          autoFocus={true}
          onChange={handleChange}
          ref={inputRef}
        />
        {Object.keys(errors).length > 0 && errors.confirm}
      </>
    );
  }, [confirm, errors, options, handleChange]);

  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog
        open={true}
        as="div"
        onClose={handleDismiss}
        className={`relative z-10`}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <ModalOverlay />
        </Transition.Child>
        <DialogWrapper>
          <DialogContent>
            <Dialog.Panel className={`dialog-size-xs`}>
              <div id="confirmation-dialog">
                <Transition.Child>
                  <ModalBody>
                    <IconWrapper>
                      <Icon icon="exclamation-triangle" />
                    </IconWrapper>
                    {__(confirmation)}
                    <br />
                    {renderConfirmDelete()}
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      btnStyle="simple"
                      onClick={handleDismiss}
                      icon="times-circle"
                      uppercase={false}
                    >
                      {options.cancelLabel || "No, Cancel"}
                    </Button>
                    <Button
                      btnStyle="success"
                      onClick={handleProceed}
                      icon="check-circle"
                      uppercase={false}
                    >
                      {options.okLabel || "Yes, I am"}
                    </Button>
                  </ModalFooter>
                </Transition.Child>
              </div>
            </Dialog.Panel>
          </DialogContent>
        </DialogWrapper>
      </Dialog>
    </Transition>
  );
};

export default ConfirmDialog;
