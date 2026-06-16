import {
  Badge,
  Button,
  Dialog,
  Input,
  PageContainer,
  Select,
  Spinner,
  cn,
} from 'erxes-ui';
import { useToast } from 'erxes-ui/hooks';
import { REACT_APP_API_URL } from 'erxes-ui/utils';
import {
  IconFile,
  IconDeviceFloppy,
  IconMusic,
  IconPhoto,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconUpload,
  IconVideo,
  IconX,
} from '@tabler/icons-react';
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { PageHeader } from 'ui-modules';
import { PostsNavigation } from '../posts/components/PostsNavigation';
import { CmsSidebar } from '../shared/CmsSidebar';

type MediaAssetFileType = 'image' | 'video' | 'audio' | 'document' | 'other';

type MediaAsset = {
  _id: string;
  name: string;
  title?: string;
  alt?: string;
  caption?: string;
  description?: string;
  key: string;
  url?: string;
  previewUrl?: string;
  storageType?: string;
  provider?: string;
  mimeType: string;
  fileType: MediaAssetFileType;
  size: number;
  createdAt: string;
  createdUserId?: string;
};

const MEDIA_PAGE_SIZE = 80;

const fileTypeOptions: Array<{
  value: 'all' | MediaAssetFileType;
  label: string;
}> = [
  { value: 'all', label: 'All media' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
  { value: 'audio', label: 'Audio' },
  { value: 'document', label: 'Documents' },
  { value: 'other', label: 'Other' },
];

const formatBytes = (size = 0) => {
  if (!size) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(
    Math.floor(Math.log(size) / Math.log(1024)),
    units.length - 1,
  );
  const value = size / Math.pow(1024, index);

  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};

const getAssetUrl = (asset: MediaAsset, options?: { width?: number }) => {
  if (asset.url || /^https?:\/\//.test(asset.key)) {
    return asset.url || asset.key;
  }

  if (
    !options?.width &&
    asset.previewUrl &&
    !asset.previewUrl.includes('localhost.app.erxes.io')
  ) {
    return asset.previewUrl;
  }

  const params = new URLSearchParams({
    key: asset.key,
    inline: 'true',
    name: asset.name,
  });

  if (options?.width) {
    params.set('width', String(options.width));
  }

  return `${REACT_APP_API_URL}/read-file?${params.toString()}`;
};

const getApiCandidates = (path: string) => {
  const normalizedBase = REACT_APP_API_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return [
    `${normalizedBase}${normalizedPath}`,
    `${normalizedBase}/pl:core${normalizedPath}`,
  ];
};

const fetchFirstOk = async (path: string, init?: RequestInit) => {
  const candidates = getApiCandidates(path);
  let lastError = '';

  for (const url of candidates) {
    const response = await fetch(url, init);

    if (response.ok) {
      return response;
    }

    lastError = await response.text();
  }

  throw new Error(lastError || 'Request failed');
};

const getIcon = (fileType: MediaAssetFileType) => {
  if (fileType === 'video') {
    return IconVideo;
  }

  if (fileType === 'audio') {
    return IconMusic;
  }

  if (fileType === 'image') {
    return IconPhoto;
  }

  return IconFile;
};

export function Media() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>();
  const [searchValue, setSearchValue] = useState('');
  const [fileType, setFileType] = useState<'all' | MediaAssetFileType>('all');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [modalAssetId, setModalAssetId] = useState<string>();
  const [editingName, setEditingName] = useState('');
  const [savingAsset, setSavingAsset] = useState(false);
  const [deletingAsset, setDeletingAsset] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const selectedAsset = useMemo(
    () => assets.find((asset) => asset._id === selectedAssetId) || assets[0],
    [assets, selectedAssetId],
  );

  const modalAsset = useMemo(
    () => assets.find((asset) => asset._id === modalAssetId),
    [assets, modalAssetId],
  );

  useEffect(() => {
    setEditingName(modalAsset?.name || '');
  }, [modalAsset]);

  const loadAssets = useCallback(
    async (append = false, skip = 0) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const params = new URLSearchParams({
          limit: String(MEDIA_PAGE_SIZE),
          skip: append ? String(skip) : '0',
        });

        if (searchValue.trim()) {
          params.set('searchValue', searchValue.trim());
        }

        if (fileType !== 'all') {
          params.set('fileType', fileType);
        }

        const response = await fetchFirstOk(
          `/media-assets?${params.toString()}`,
          {
            credentials: 'include',
          },
        );

        const data = await response.json();
        setAssets((currentAssets) =>
          append ? [...currentAssets, ...data] : data,
        );
        setHasMore(data.length === MEDIA_PAGE_SIZE);

        if (
          !append &&
          data.length > 0 &&
          !data.some((asset: MediaAsset) => asset._id === selectedAssetId)
        ) {
          setSelectedAssetId(data[0]._id);
        }
      } catch (error) {
        toast({
          title: 'Failed to load media',
          description:
            error instanceof Error
              ? error.message
              : 'Unable to load media assets',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [fileType, searchValue, selectedAssetId, toast],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAssets(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [loadAssets]);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    setUploading(true);

    try {
      let latestAsset: MediaAsset | undefined;

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name);

        const response = await fetchFirstOk('/upload-file?kind=media', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        latestAsset = await response.json();
      }

      toast({
        description:
          files.length === 1
            ? `${files[0].name} uploaded`
            : `${files.length} files uploaded`,
      });

      await loadAssets(false);

      if (latestAsset?._id) {
        setSelectedAssetId(latestAsset._id);
      }
    } catch (error) {
      toast({
        title: 'Upload failed',
        description:
          error instanceof Error ? error.message : 'Unable to upload media',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const openAsset = (asset: MediaAsset) => {
    setSelectedAssetId(asset._id);
    setModalAssetId(asset._id);
  };

  const handleSaveAsset = async () => {
    if (!modalAsset) {
      return;
    }

    const nextName = editingName.trim();

    if (!nextName) {
      toast({
        title: 'Name is required',
        variant: 'destructive',
      });
      return;
    }

    setSavingAsset(true);

    try {
      const response = await fetchFirstOk(
        `/media-assets/${modalAsset._id}/update`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: nextName,
            title: nextName,
          }),
          credentials: 'include',
        },
      );
      const updatedAsset = await response.json();

      setAssets((currentAssets) =>
        currentAssets.map((asset) =>
          asset._id === updatedAsset._id ? updatedAsset : asset,
        ),
      );
      setSelectedAssetId(updatedAsset._id);
      setModalAssetId(updatedAsset._id);

      toast({ description: 'Media name updated' });
    } catch (error) {
      toast({
        title: 'Update failed',
        description:
          error instanceof Error ? error.message : 'Unable to update media',
        variant: 'destructive',
      });
    } finally {
      setSavingAsset(false);
    }
  };

  const handleDeleteAsset = async () => {
    if (!modalAsset) {
      return;
    }

    if (!window.confirm(`Delete ${modalAsset.name} from the media library?`)) {
      return;
    }

    setDeletingAsset(true);

    try {
      await fetchFirstOk(`/media-assets/${modalAsset._id}/delete`, {
        method: 'POST',
        credentials: 'include',
      });

      const remainingAssets = assets.filter(
        (asset) => asset._id !== modalAsset._id,
      );

      setAssets(remainingAssets);
      setSelectedAssetId(remainingAssets[0]?._id);
      setModalAssetId(undefined);

      toast({ description: 'Media deleted' });
    } catch (error) {
      toast({
        title: 'Delete failed',
        description:
          error instanceof Error ? error.message : 'Unable to delete media',
        variant: 'destructive',
      });
    } finally {
      setDeletingAsset(false);
    }
  };

  const headerActions = (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => loadAssets(false)}
        disabled={loading}
      >
        <IconRefresh className={cn('h-4 w-4', loading && 'animate-spin')} />
      </Button>
      <Button
        onClick={() => uploadInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <IconRefresh className="h-4 w-4 animate-spin" />
        ) : (
          <IconUpload className="h-4 w-4" />
        )}
        Upload
      </Button>
      <input
        ref={uploadInputRef}
        className="hidden"
        type="file"
        multiple
        onChange={handleUpload}
      />
    </div>
  );

  return (
    <PageContainer>
      <PageHeader>
        <PostsNavigation />
        <PageHeader.End>{headerActions}</PageHeader.End>
      </PageHeader>
      <div className="flex overflow-hidden flex-auto">
        <CmsSidebar />
        <div className="flex min-w-0 flex-auto overflow-hidden">
          <main className="flex min-w-0 flex-1 flex-col gap-3 overflow-hidden p-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-64 flex-1">
                <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Search media"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                />
              </div>
              <Select
                value={fileType}
                onValueChange={(value) =>
                  setFileType(value as 'all' | MediaAssetFileType)
                }
              >
                <Select.Trigger className="w-44">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {fileTypeOptions.map((option) => (
                    <Select.Item key={option.value} value={option.value}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>

            <div className="min-h-0 flex-1 overflow-auto">
              {loading && assets.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <Spinner />
                </div>
              ) : assets.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed text-center">
                  <IconPhoto className="mb-3 h-10 w-10 text-muted-foreground" />
                  <div className="text-sm font-medium">No media yet</div>
                  <Button
                    className="mt-4"
                    onClick={() => uploadInputRef.current?.click()}
                  >
                    <IconUpload className="h-4 w-4" />
                    Upload media
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
                    {assets.map((asset) => (
                      <MediaTile
                        key={asset._id}
                        asset={asset}
                        selected={selectedAsset?._id === asset._id}
                        onSelect={() => openAsset(asset)}
                      />
                    ))}
                  </div>
                  {hasMore && (
                    <div className="mt-4">
                      <Button
                        variant="secondary"
                        className="w-full"
                        type="button"
                        disabled={loadingMore}
                        onClick={() => loadAssets(true, assets.length)}
                      >
                        {loadingMore ? 'Loading...' : 'Load more'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>

          <MediaDetails asset={selectedAsset} />
        </div>
      </div>
      <MediaPreviewDialog
        asset={modalAsset}
        editingName={editingName}
        saving={savingAsset}
        deleting={deletingAsset}
        open={!!modalAsset}
        onOpenChange={(open) => {
          if (!open) {
            setModalAssetId(undefined);
          }
        }}
        onNameChange={setEditingName}
        onSave={handleSaveAsset}
        onDelete={handleDeleteAsset}
      />
    </PageContainer>
  );
}

const MediaTile = ({
  asset,
  selected,
  onSelect,
}: {
  asset: MediaAsset;
  selected: boolean;
  onSelect: () => void;
}) => {
  const Icon = getIcon(asset.fileType);

  return (
    <button
      type="button"
      className={cn(
        'group overflow-hidden rounded-lg border bg-background text-left transition-shadow hover:shadow-sm',
        selected && 'border-primary ring-2 ring-primary/20',
      )}
      onClick={onSelect}
    >
      <div className="flex aspect-square items-center justify-center overflow-hidden bg-muted">
        {asset.fileType === 'image' ? (
          <img
            src={getAssetUrl(asset, { width: 360 })}
            alt={asset.alt || asset.title || asset.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <Icon className="h-10 w-10 text-muted-foreground" />
        )}
      </div>
      <div className="space-y-1 p-2">
        <div className="truncate text-sm font-medium">
          {asset.title || asset.name}
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="truncate">{formatBytes(asset.size)}</span>
          <Badge variant="secondary" className="capitalize">
            {asset.fileType}
          </Badge>
        </div>
      </div>
    </button>
  );
};

const MediaPreviewDialog = ({
  asset,
  editingName,
  saving,
  deleting,
  open,
  onOpenChange,
  onNameChange,
  onSave,
  onDelete,
}: {
  asset?: MediaAsset;
  editingName: string;
  saving: boolean;
  deleting: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onDelete: () => void;
}) => {
  const Icon = asset ? getIcon(asset.fileType) : IconFile;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-h-[90vh] max-w-5xl gap-0 overflow-hidden p-0">
        {asset && (
          <div className="grid min-h-0 md:grid-cols-[minmax(0,1fr)_320px]">
            <Dialog.Close asChild>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-3 top-3 z-10"
              >
                <IconX className="h-4 w-4" />
              </Button>
            </Dialog.Close>
            <div className="flex min-h-[320px] items-center justify-center bg-black p-4 md:min-h-[620px]">
              {asset.fileType === 'image' ? (
                <img
                  src={getAssetUrl(asset)}
                  alt={asset.alt || asset.title || asset.name}
                  className="max-h-[78vh] max-w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-white/80">
                  <Icon className="h-16 w-16" />
                  <div className="max-w-xs truncate text-sm">{asset.name}</div>
                </div>
              )}
            </div>

            <div className="flex min-h-0 flex-col border-l bg-background">
              <Dialog.Header className="border-b p-4">
                <Dialog.Title className="truncate">
                  {asset.title || asset.name}
                </Dialog.Title>
                <Dialog.Description>
                  {asset.mimeType} · {formatBytes(asset.size)}
                </Dialog.Description>
              </Dialog.Header>

              <div className="flex-1 space-y-4 overflow-auto p-4">
                <label className="block space-y-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Name
                  </span>
                  <Input
                    value={editingName}
                    onChange={(event) => onNameChange(event.target.value)}
                  />
                </label>

                <dl className="space-y-3 text-sm">
                  <DetailRow
                    label="Uploaded"
                    value={new Date(asset.createdAt).toLocaleString()}
                  />
                  <DetailRow
                    label="Storage"
                    value={asset.provider || asset.storageType || ''}
                  />
                  <DetailRow label="Key" value={asset.key} mono />
                </dl>
              </div>

              <Dialog.Footer className="border-t p-4">
                <Button
                  variant="destructive"
                  onClick={onDelete}
                  disabled={saving || deleting}
                >
                  {deleting ? (
                    <IconRefresh className="h-4 w-4 animate-spin" />
                  ) : (
                    <IconTrash className="h-4 w-4" />
                  )}
                  Delete
                </Button>
                <Button onClick={onSave} disabled={saving || deleting}>
                  {saving ? (
                    <IconRefresh className="h-4 w-4 animate-spin" />
                  ) : (
                    <IconDeviceFloppy className="h-4 w-4" />
                  )}
                  Save
                </Button>
              </Dialog.Footer>
            </div>
          </div>
        )}
      </Dialog.Content>
    </Dialog>
  );
};

const MediaDetails = ({ asset }: { asset?: MediaAsset }) => {
  if (!asset) {
    return (
      <aside className="hidden w-80 flex-none border-l p-4 xl:block">
        <div className="text-sm text-muted-foreground">Select media</div>
      </aside>
    );
  }

  const Icon = getIcon(asset.fileType);
  const createdAt = asset.createdAt
    ? new Date(asset.createdAt).toLocaleString()
    : '';

  return (
    <aside className="hidden w-80 flex-none overflow-auto border-l bg-background p-4 xl:block">
      <div className="mb-4 flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-muted">
        {asset.fileType === 'image' ? (
          <img
            src={getAssetUrl(asset, { width: 640 })}
            alt={asset.alt || asset.title || asset.name}
            className="h-full w-full object-contain"
            loading="lazy"
          />
        ) : (
          <Icon className="h-12 w-12 text-muted-foreground" />
        )}
      </div>

      <div className="space-y-4">
        <div>
          <div className="truncate text-sm font-semibold">
            {asset.title || asset.name}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {asset.mimeType}
          </div>
        </div>

        <dl className="space-y-3 text-sm">
          <DetailRow label="File name" value={asset.name} />
          <DetailRow label="Size" value={formatBytes(asset.size)} />
          <DetailRow label="Uploaded" value={createdAt} />
          <DetailRow
            label="Storage"
            value={asset.provider || asset.storageType || ''}
          />
          <DetailRow label="Alt text" value={asset.alt || ''} />
          <DetailRow label="Caption" value={asset.caption || ''} />
          <DetailRow label="Key" value={asset.key} mono />
        </dl>
      </div>
    </aside>
  );
};

const DetailRow = ({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) => (
  <div>
    <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
    <dd className={cn('mt-1 break-words', mono && 'font-mono text-xs')}>
      {value || '-'}
    </dd>
  </div>
);
