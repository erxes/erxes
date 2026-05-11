import { useAtom, useAtomValue } from 'jotai';
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconArrowLeft,
  IconCopy,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconDeviceTablet,
  IconEye,
  IconLayoutSidebar,
  IconLayoutSidebarRight,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

import {
  Button,
  Input,
  Switch,
  ToggleGroup,
  cn,
  toast,
} from 'erxes-ui';

import {
  deviceAtom,
  dirtyAtom,
  historyAtom,
  pageDraftAtom,
  panelVisibilityAtom,
} from '../states/builderStates';
import { useBuilderActions } from '../hooks/useBuilderActions';
import { slugify } from '../utils/slug';

export const Toolbar = () => {
  const draft = useAtomValue(pageDraftAtom);
  const [device, setDevice] = useAtom(deviceAtom);
  const dirty = useAtomValue(dirtyAtom);
  const history = useAtomValue(historyAtom);
  const [panels, setPanels] = useAtom(panelVisibilityAtom);
  const { undo, redo, save, togglePublish, setMeta } = useBuilderActions();
  const navigate = useNavigate();

  if (!draft) return null;

  const handleSave = () => {
    const r = save();
    if (r.ok) {
      toast({ title: 'Saved' });
    } else {
      toast({ title: 'Could not save', description: r.error, variant: 'destructive' });
    }
  };

  const handleTogglePublish = (next: boolean) => {
    const r = togglePublish(next);
    if (r.ok) {
      toast({ title: next ? 'Published' : 'Unpublished' });
    } else {
      toast({
        title: 'Could not update status',
        description: r.error,
        variant: 'destructive',
      });
    }
  };

  const openPreview = () => {
    if (dirty) {
      const r = save();
      if (!r.ok) {
        toast({
          title: 'Save before previewing',
          description: r.error,
          variant: 'destructive',
        });
        return;
      }
    }
    window.open(`/layout/preview/${draft.id}`, '_blank', 'noopener');
  };

  const copyShareUrl = async () => {
    if (draft.status !== 'published') return;
    const url = `${window.location.origin}/layout/published/${draft.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Share URL copied', description: url });
    } catch {
      toast({
        title: 'Could not copy',
        description: url,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="relative z-10 flex h-12 flex-none items-center border-b bg-background px-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {/* LEFT — navigation + page meta */}
      <div className="flex min-w-0 items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2"
          onClick={() => navigate('/layout')}
          title="Back to pages"
        >
          <IconArrowLeft size={16} />
        </Button>

        <div className="mx-1 h-5 w-px bg-border" />

        <Input
          value={draft.title}
          onChange={(e) => setMeta({ title: e.target.value })}
          className="h-8 w-[180px] px-2 font-medium"
          placeholder="Untitled"
        />
        <span className="select-none text-xs text-muted-foreground/60">/</span>
        <Input
          value={draft.slug}
          onChange={(e) => setMeta({ slug: slugify(e.target.value) })}
          className="h-8 w-[140px] px-2 font-mono text-xs text-muted-foreground"
          placeholder="slug"
        />
        <span
          className={cn(
            'ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide',
            draft.status === 'published'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700',
          )}
        >
          {draft.status}
        </span>
      </div>

      {/* CENTER — device picker (absolutely centered so it doesn't shift) */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="pointer-events-auto">
          <ToggleGroup
            type="single"
            value={device}
            onValueChange={(v) => v && setDevice(v as typeof device)}
            size="sm"
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
        </div>
      </div>

      {/* RIGHT — actions */}
      <div className="ml-auto flex items-center gap-1.5">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={undo}
            disabled={!history.past.length}
            title="Undo (⌘Z)"
          >
            <IconArrowBackUp size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={redo}
            disabled={!history.future.length}
            title="Redo (⌘⇧Z)"
          >
            <IconArrowForwardUp size={16} />
          </Button>
        </div>

        <div className="mx-0.5 h-5 w-px bg-border" />

        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2"
          onClick={openPreview}
          title="Preview"
        >
          <IconEye size={16} />
        </Button>

        {draft.status === 'published' && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={copyShareUrl}
            title="Copy share URL"
          >
            <IconCopy size={16} />
          </Button>
        )}

        <div className="flex items-center gap-2 rounded-md border bg-background/30 px-2.5 py-1">
          <span className="text-xs font-medium">Publish</span>
          <Switch
            checked={draft.status === 'published'}
            onCheckedChange={handleTogglePublish}
          />
        </div>

        <Button size="sm" className="h-8" onClick={handleSave} disabled={!dirty}>
          {dirty ? 'Save' : 'Saved'}
        </Button>

        <div className="mx-0.5 h-5 w-px bg-border" />

        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-8 px-2', panels.left && 'bg-muted')}
            onClick={() => setPanels({ ...panels, left: !panels.left })}
            title="Toggle left panel (⌘\\)"
          >
            <IconLayoutSidebar size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-8 px-2', panels.right && 'bg-muted')}
            onClick={() => setPanels({ ...panels, right: !panels.right })}
            title="Toggle right panel"
          >
            <IconLayoutSidebarRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
