import React from "react";
import { Transition } from "@headlessui/react";

export default function Collapse({
  show,
  unmount,
  children,
}: {
  show: boolean;
  children: React.ReactNode;
  unmount?: boolean;
}) {
  return (
    <Transition
      show={show}
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      unmount={unmount}
    >
      {show && children}
    </Transition>
  );
}
