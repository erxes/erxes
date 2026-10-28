import { StructurePageMenu } from './StructurePageMenu';
import { StructureViewToggle } from './StructureViewToggle';

export const StructureTopbar = () => (
  <div className="ml-auto flex items-center gap-2">
    <StructureViewToggle />
    <StructurePageMenu />
  </div>
);
