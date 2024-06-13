import React from 'react';
import RawModal from 'react-modal';

const Modal = ({
  isOpen,
  onClose,
  children
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  return (
    <RawModal
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName="bg-black/30 fixed inset-0 animate-in fade-in"
      className="max-w-lg fixed bottom-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 bg-white w-full p-4 md:p-6  animate-in slide-in-from-bottom-8 md:zoom-in rounded-t-2xl md:rounded-b-2xl max-h-[85vh] md:max-h-auto block overflow-y-auto"
    >
      {children}
    </RawModal>
  );
};

export default Modal;
