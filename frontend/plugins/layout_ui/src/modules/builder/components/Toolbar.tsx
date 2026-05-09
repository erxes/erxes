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
} from '../states/builderStates';
import { useBuilderActions } from '../hooks/useBuilderActions';
import { slugify } from '../utils/slug';

export const Toolbar = () => {
  const draft = useAtomValue(pageDraftAtom);
  const [device, setDevice] = useAtom(deviceAtom);
  const dirty = useAtomValue(dirtyAtom);
  const history = useAtomValue(historyAtom);
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
    <div className="flex flex-none items-center gap-3 border-b bg-sidebar px-3 py-2">
      <Button variant="ghost" size="sm" onClick={() => navigate('/layout')}>
        <IconArrowLeft size={16} />
        Pages
      </Button>

      <div className="mx-2 h-6 w-px bg-border" />

      <div className="flex flex-1 items-center gap-2">
        <Input
          value={draft.title}
          onChange={(e) => setMeta({ title: e.target.value })}
          className="h-9 max-w-xs font-medium"
          placeholder="Page title"
        />
        <span className="text-xs text-muted-foreground">/</span>
        <Input
          value={draft.slug}
          onChange={(e) => setMeta({ slug: slugify(e.target.value) })}
          className="h-9 max-w-xs font-mono text-sm"
          placeholder="slug"
        />
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-medium',
            draft.status === 'published'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700',
          )}
        >
          {draft.status}
        </span>
        {dirty && (
          <span className="text-xs text-muted-foreground">• unsaved</span>
        )}
      </div>

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

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={!history.past.length}
          title="Undo (Ctrl/Cmd+Z)"
        >
          <IconArrowBackUp size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={!history.future.length}
          title="Redo (Ctrl/Cmd+Shift+Z)"
        >
          <IconArrowForwardUp size={16} />
        </Button>
      </div>

      <Button variant="outline" size="sm" onClick={openPreview}>
        <IconEye size={16} />
        Preview
      </Button>

      {draft.status === 'published' && (
        <Button variant="outline" size="sm" onClick={copyShareUrl}>
          <IconCopy size={16} />
          Share URL
        </Button>
      )}

      <div className="flex items-center gap-2 rounded-md border px-3 py-1.5">
        <span className="text-xs font-medium">Publish</span>
        <Switch
          checked={draft.status === 'published'}
          onCheckedChange={handleTogglePublish}
        />
      </div>

      <Button size="sm" onClick={handleSave} disabled={!dirty}>
        Save
      </Button>
    </div>
  );
};
