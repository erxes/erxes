import { ShadCNDefaultComponents } from '@blocknote/shadcn';
import type { ShadCNComponents } from '@blocknote/shadcn';
import type { ComponentProps } from 'react';

// Picking a font, size, image style or colour closes its menu, as radix menus did.
// Base UI keeps a menu open after a checkbox item by default.
export const MenuCheckboxItem = (
  props: ComponentProps<ShadCNComponents['DropdownMenu']['DropdownMenuCheckboxItem']>,
) => <ShadCNDefaultComponents.DropdownMenu.DropdownMenuCheckboxItem closeOnClick {...props} />;
