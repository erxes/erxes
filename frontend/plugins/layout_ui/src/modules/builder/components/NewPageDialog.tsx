import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Dialog,
  Input,
  Label as UILabel,
  RadioGroup,
  toast,
} from 'erxes-ui';

import { PageTemplate } from '../types';
import { usePages } from '../hooks/usePages';
import { slugify } from '../utils/slug';

const TEMPLATES: { value: PageTemplate; label: string; description: string }[] =
  [
    {
      value: 'blank',
      label: 'Blank',
      description: 'Empty canvas. Bring your own components.',
    },
    {
      value: 'with-header',
      label: 'With heading',
      description: 'Starts with a heading + paragraph.',
    },
    {
      value: 'with-sidebar',
      label: 'Stat snapshot',
      description: 'Two stat cards side-by-side.',
    },
    {
      value: 'landing',
      label: 'Landing page',
      description: 'Hero, features grid and footer pre-filled.',
    },
  ];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const NewPageDialog = ({ open, onOpenChange }: Props) => {
  const { create, slugTaken } = usePages();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [template, setTemplate] = useState<PageTemplate>('blank');
  const [touchedSlug, setTouchedSlug] = useState(false);

  useEffect(() => {
    if (!open) {
      setTitle('');
      setSlug('');
      setTemplate('blank');
      setTouchedSlug(false);
    }
  }, [open]);

  useEffect(() => {
    if (!touchedSlug) setSlug(slugify(title));
  }, [title, touchedSlug]);

  const slugError = useMemo(() => {
    if (!slug.trim()) return 'Slug is required';
    if (slugTaken(slug)) return 'Slug is already used';
    return null;
  }, [slug, slugTaken]);

  const submit = () => {
    if (!title.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }
    if (slugError) {
      toast({ title: slugError, variant: 'destructive' });
      return;
    }
    const r = create({ title, slug, template });
    if (!r.ok) {
      toast({
        title: 'Could not create page',
        description: r.error,
        variant: 'destructive',
      });
      return;
    }
    onOpenChange(false);
    navigate(`/layout/edit/${r.page.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-lg">
        <Dialog.Header>
          <Dialog.Title>Create a page</Dialog.Title>
          <Dialog.Description>
            Pick a starting template. You can change anything later.
          </Dialog.Description>
        </Dialog.Header>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <UILabel>Title</UILabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Pricing"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <UILabel>Slug</UILabel>
            <Input
              value={slug}
              onChange={(e) => {
                setTouchedSlug(true);
                setSlug(slugify(e.target.value));
              }}
              placeholder="auto-generated from title"
              className="font-mono"
            />
            {slug && slugError && (
              <p className="text-xs text-red-600">{slugError}</p>
            )}
            {slug && !slugError && (
              <p className="text-xs text-muted-foreground">
                Will be available at <code>/layout/published/{slug}</code> when
                published.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <UILabel>Template</UILabel>
            <RadioGroup
              value={template}
              onValueChange={(v) => setTemplate(v as PageTemplate)}
              className="grid grid-cols-2 gap-2"
            >
              {TEMPLATES.map((t) => {
                const selected = template === t.value;
                return (
                  <label
                    key={t.value}
                    onClick={() => setTemplate(t.value)}
                    className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-muted/40 ${
                      selected ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    <RadioGroup.Item value={t.value} className="mt-1" />
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">{t.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {t.description}
                      </div>
                    </div>
                  </label>
                );
              })}
            </RadioGroup>
          </div>
        </div>

        <Dialog.Footer>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!title.trim() || !!slugError}>
            Create page
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
