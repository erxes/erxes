import { Button, ToggleGroup } from 'erxes-ui';
import {
  IconArrowLeft,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconDeviceTablet,
  IconDeviceFloppy,
} from '@tabler/icons-react';
import { useAtom, useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { useBuilderContext } from '../BuilderContext';
import {
  deviceAtom,
  dirtyAtom,
} from '../state/builderState';

interface BuilderToolbarProps {
  saving: boolean;
  onSave: () => void;
}

export const BuilderToolbar = ({ saving, onSave }: BuilderToolbarProps) => {
  const navigate = useNavigate();
  const { webId, page, web } = useBuilderContext();
  const [device, setDevice] = useAtom(deviceAtom);
  const dirty = useAtomValue(dirtyAtom);

  return (
    <header className="h-14 border-b bg-card px-4 flex items-center gap-4 shrink-0">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(`/content/web-builder/${webId}`)}
        title="Back to pages"
      >
        <IconArrowLeft size={18} />
      </Button>

      <div className="flex flex-col leading-tight min-w-0">
        <div className="text-xs text-muted-foreground truncate">
          {web?.name || 'Web project'}
        </div>
        <div className="font-semibold text-sm truncate">
          {page?.name || 'Page'} · /{page?.slug || ''}
        </div>
      </div>

      <div className="flex-1" />

      <ToggleGroup
        type="single"
        value={device}
        onValueChange={(v) => v && setDevice(v as typeof device)}
      >
        <ToggleGroup.Item value="desktop" aria-label="Desktop">
          <IconDeviceDesktop size={16} />
        </ToggleGroup.Item>
        <ToggleGroup.Item value="tablet" aria-label="Tablet">
          <IconDeviceTablet size={16} />
        </ToggleGroup.Item>
        <ToggleGroup.Item value="mobile" aria-label="Mobile">
          <IconDeviceMobile size={16} />
        </ToggleGroup.Item>
      </ToggleGroup>

      <Button onClick={onSave} disabled={saving || !dirty}>
        <IconDeviceFloppy size={16} className="mr-1.5" />
        {saving ? 'Saving…' : dirty ? 'Save' : 'Saved'}
      </Button>
    </header>
  );
};
