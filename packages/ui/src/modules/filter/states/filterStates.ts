import { keyedAtom } from 'erxes-ui/lib/keyed-atom';

export const openPopoverState = keyedAtom(false);

export const filterPopoverViewState = keyedAtom('root');

export const openDialogState = keyedAtom(false);

export const filterDialogViewState = keyedAtom('root');
