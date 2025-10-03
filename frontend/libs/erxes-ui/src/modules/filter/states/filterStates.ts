import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';

export const EditModePositionComponentState = atomFamily((id: string) =>
  atom(false),
);

export const openPopoverState = atomFamily((id: string) => atom(false));

export const filterPopoverViewState = atomFamily((id: string) => atom('root'));

export const openDialogState = atomFamily((id: string) => atom(false));

export const filterDialogViewState = atomFamily((id: string) => atom('root'));
