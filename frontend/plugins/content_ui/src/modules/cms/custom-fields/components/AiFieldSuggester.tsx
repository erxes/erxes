import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Button, Sheet, Spinner, Checkbox, toast } from 'erxes-ui';
import {
  IconSparkles,
  IconCheck,
  IconAlertCircle,
  IconBulb,
  IconRefresh,
} from '@tabler/icons-react';
import { CMS_AI_SUGGEST_FIELDS } from '../graphql/mutations';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AiSuggestedField {
  label: string;
  code: string;
  type: string;
  description?: string;
  isRequired: boolean;
  options: string[];
}

interface AiFieldSuggestionResult {
  groupLabelSuggestion: string;
  customPostTypeSuggestion: string | null;
  fields: AiSuggestedField[];
}

interface AiFieldSuggesterProps {
  isOpen: boolean;
  onClose: () => void;
  websiteId: string;
  onAcceptFields: (
    fields: AiSuggestedField[],
    groupLabel: string,
    customPostTypeSuggestion?: string | null,
  ) => Promise<void> | void;
}

// ─── Field type badge colour ──────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  text: 'bg-blue-100 text-blue-700',
  textarea: 'bg-purple-100 text-purple-700',
  number: 'bg-green-100 text-green-700',
  email: 'bg-yellow-100 text-yellow-700',
  url: 'bg-cyan-100 text-cyan-700',
  date: 'bg-orange-100 text-orange-700',
  checkbox: 'bg-pink-100 text-pink-700',
  select: 'bg-indigo-100 text-indigo-700',
  radio: 'bg-rose-100 text-rose-700',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function AiFieldSuggester({
  isOpen,
  onClose,
  websiteId,
  onAcceptFields,
}: AiFieldSuggesterProps) {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<AiFieldSuggestionResult | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);

  const [suggestFields, { loading, error }] = useMutation(
    CMS_AI_SUGGEST_FIELDS,
    {
      onCompleted: (data) => {
        const res: AiFieldSuggestionResult | null = data?.cmsAiSuggestFields;

        if (!res) {
          toast({
            title: 'AI Error',
            description: 'The server returned an empty AI suggestion response.',
            variant: 'destructive',
          });
          return;
        }

        setResult(res);
        setSelectedIds(new Set(res.fields.map((f) => f.code)));
      },
      onError: (err) => {
        toast({
          title: 'AI Error',
          description: err.message,
          variant: 'destructive',
        });
      },
    },
  );

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    setResult(null);
    setSelectedIds(new Set());

    suggestFields({
      variables: { prompt: prompt.trim(), clientPortalId: websiteId },
    });
  };

  const toggleField = (code: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (!result) return;

    if (selectedIds.size === result.fields.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(result.fields.map((f) => f.code)));
    }
  };

  const handleAdd = async () => {
    if (!result) return;

    const chosen = result.fields.filter((f) => selectedIds.has(f.code));

    if (chosen.length === 0) {
      toast({ title: 'Select at least one field', variant: 'destructive' });
      return;
    }

    setAdding(true);

    try {
      await onAcceptFields(
        chosen,
        result.groupLabelSuggestion || 'AI Generated Fields',
        result.customPostTypeSuggestion,
      );

      toast({
        title: 'Fields added!',
        description: `${chosen.length} field${chosen.length === 1 ? '' : 's'} added successfully.`,
      });

      handleClose();
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'Failed to add fields',
        variant: 'destructive',
      });
    } finally {
      setAdding(false);
    }
  };

  const handleClose = () => {
    setPrompt('');
    setResult(null);
    setSelectedIds(new Set());
    onClose();
  };

  const selectedCount = selectedIds.size;
  const totalCount = result?.fields.length ?? 0;

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <Sheet.View className="sm:max-w-xl p-0 flex flex-col h-full">
        <Sheet.Header className="border-b gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <IconSparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <Sheet.Title className="text-base">AI Field Generator</Sheet.Title>
              <p className="text-xs text-muted-foreground">
                Describe your content and get field suggestions instantly
              </p>
            </div>
          </div>
          <Sheet.Close />
        </Sheet.Header>

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 border-b flex-shrink-0 space-y-3">
            <div className="relative">
              <textarea
                className="w-full min-h-[80px] resize-none rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition pr-10"
                placeholder="e.g. I want fields for car listings (make, model, year, price, mileage…)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    handleGenerate();
                  }
                }}
                disabled={loading}
              />
              <span className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                ⌘↵
              </span>
            </div>

            {!result && !loading && (
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Car listings',
                  'Job postings',
                  'Real estate properties',
                  'Restaurant menu items',
                  'Product catalog',
                  'Event listings',
                ].map((example) => (
                  <button
                    key={example}
                    onClick={() => setPrompt(example)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-muted hover:bg-accent border transition-colors"
                  >
                    <IconBulb className="w-3 h-3 text-muted-foreground" />
                    {example}
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || loading}
                className="gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white border-0"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    Generating…
                  </>
                ) : result ? (
                  <>
                    <IconRefresh className="w-4 h-4" />
                    Regenerate
                  </>
                ) : (
                  <>
                    <IconSparkles className="w-4 h-4" />
                    Generate Fields
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
                <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center animate-pulse">
                  <IconSparkles className="w-6 h-6 text-violet-500" />
                </div>
                <p className="text-sm">Thinking about the best fields…</p>
              </div>
            )}

            {error && !loading && (
              <div className="m-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                <IconAlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive">{error.message}</p>
              </div>
            )}

            {result && !loading && (
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold">
                      {result.groupLabelSuggestion || 'Suggested Fields'}
                    </p>
                    {result.customPostTypeSuggestion && (
                      <p className="text-xs text-muted-foreground">
                        Post type suggestion:{' '}
                        <span className="font-medium text-violet-600">
                          {result.customPostTypeSuggestion}
                        </span>
                      </p>
                    )}
                  </div>
                  <button
                    onClick={toggleAll}
                    className="text-xs text-violet-600 hover:text-violet-700 font-medium"
                  >
                    {selectedCount === totalCount ? 'Deselect all' : 'Select all'}
                  </button>
                </div>

                <div className="space-y-2">
                  {result.fields.map((field) => {
                    const isSelected = selectedIds.has(field.code);

                    return (
                      <div
                        key={field.code}
                        onClick={() => toggleField(field.code)}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-violet-400 bg-violet-50 dark:bg-violet-950/30'
                            : 'border-border hover:border-muted-foreground/40 hover:bg-accent/50'
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleField(field.code)}
                          className="mt-0.5 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium leading-none">
                              {field.label}
                            </span>
                            {field.isRequired && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">
                                Required
                              </span>
                            )}
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                TYPE_COLORS[field.type] ??
                                'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {field.type}
                            </span>
                          </div>

                          {field.description && (
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              {field.description}
                            </p>
                          )}

                          <div className="flex items-center gap-1 mt-1">
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground">
                              {field.code}
                            </code>
                          </div>

                          {field.options.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {field.options.map((opt) => (
                                <span
                                  key={opt}
                                  className="text-xs px-1.5 py-0.5 bg-background border rounded"
                                >
                                  {opt}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {isSelected && (
                          <IconCheck className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {result && !loading && (
            <div className="border-t p-4 flex-shrink-0 space-y-3 bg-background">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedCount} of {totalCount} field
                  {totalCount !== 1 ? 's' : ''} selected
                </span>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAdd}
                    disabled={selectedCount === 0 || adding}
                    className="gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white border-0"
                  >
                    {adding ? (
                      <Spinner size="sm" />
                    ) : (
                      <IconCheck className="w-4 h-4" />
                    )}
                    Add {selectedCount > 0 ? selectedCount : ''} Field
                    {selectedCount !== 1 ? 's' : ''}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Sheet.View>
    </Sheet>
  );
}
