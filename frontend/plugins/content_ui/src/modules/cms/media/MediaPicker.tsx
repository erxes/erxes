import { Badge, Button, Dialog, Input, Spinner, cn } from 'erxes-ui';
import { REACT_APP_API_URL } from 'erxes-ui/utils';
import {
  IconFile,
  IconMusic,
  IconPhoto,
  IconSearch,
  IconVideo,
} from '@tabler/icons-react';
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export type MediaAssetFileType =
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'other';

export type MediaAsset = {
  _id: string;
  name: string;
  title?: string;
  alt?: string;
  caption?: string;
  key: string;
  url?: string;
  previewUrl?: string;
  mimeType: string;
  fileType: MediaAssetFileType;
  size: number;
};

export type MediaSelection = {
  url: string;
  name: string;
  fileType: MediaAssetFileType;
  mimeType: string;
  asset: MediaAsset;
};

const MEDIA_PICKER_PAGE_SIZE = 60;

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

export const getMediaAssetUrl = (
  asset: MediaAsset,
  options?: { width?: number; original?: boolean },
) => {
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

export const toMediaSelection = (asset: MediaAsset): MediaSelection => ({
  url: getMediaAssetUrl(asset),
  name: asset.title || asset.name,
  fileType: asset.fileType,
  mimeType: asset.mimeType,
  asset,
});

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

export const uploadMediaFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', file.name);

  const response = await fetchFirstOk('/upload-file?kind=media', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  return toMediaSelection(await response.json());
};

type MediaPickerOptions = {
  fileType?: MediaAssetFileType;
  multiple?: boolean;
};

export const useMediaPicker = (fileType?: MediaAssetFileType) => {
  const [open, setOpen] = useState(false);
  const [pickerOptions, setPickerOptions] = useState<MediaPickerOptions>({});
  const resolverRef = useRef<
    ((selection: MediaSelection | MediaSelection[] | null) => void) | null
  >(null);

  const selectMedia = useCallback((options?: MediaPickerOptions) => {
    setPickerOptions(options || {});
    setOpen(true);

    return new Promise<MediaSelection | MediaSelection[] | null>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen && resolverRef.current) {
      resolverRef.current(null);
      resolverRef.current = null;
    }
  }, []);

  const picker = (
    <MediaPickerDialog
      open={open}
      onOpenChange={handleOpenChange}
      fileType={pickerOptions.fileType || fileType}
      multiple={!!pickerOptions.multiple}
      onSelect={(selection) => {
        resolverRef.current?.(selection);
        resolverRef.current = null;
      }}
    />
  ) as ReactNode;

  return { selectMedia, picker };
};

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  fileType,
  multiple = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (selection: MediaSelection | MediaSelection[]) => void;
  fileType?: MediaAssetFileType;
  multiple?: boolean;
}) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const selectedAssets = useMemo(
    () => assets.filter((asset) => selectedIds.includes(asset._id)),
    [assets, selectedIds],
  );

  const loadAssets = useCallback(
    async (append = false, skip = 0) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const params = new URLSearchParams({
          limit: String(MEDIA_PICKER_PAGE_SIZE),
          skip: append ? String(skip) : '0',
        });

        if (searchValue.trim()) {
          params.set('searchValue', searchValue.trim());
        }

        if (fileType) {
          params.set('fileType', fileType);
        }

        const response = await fetchFirstOk(`/media-assets?${params}`, {
          credentials: 'include',
        });
        const data = await response.json();

        setAssets((currentAssets) =>
          append ? [...currentAssets, ...data] : data,
        );
        setHasMore(data.length === MEDIA_PICKER_PAGE_SIZE);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [fileType, searchValue],
  );

  useEffect(() => {
    if (!open) {
      setSelectedIds([]);
      return;
    }

    const timer = setTimeout(() => loadAssets(false), 200);

    return () => clearTimeout(timer);
  }, [loadAssets, open]);

  const toggleAsset = (asset: MediaAsset) => {
    if (!multiple) {
      onSelect(toMediaSelection(asset));
      onOpenChange(false);
      return;
    }

    setSelectedIds((current) =>
      current.includes(asset._id)
        ? current.filter((id) => id !== asset._id)
        : [...current, asset._id],
    );
  };

  const confirmSelection = () => {
    onSelect(selectedAssets.map(toMediaSelection));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-h-[86vh] max-w-4xl overflow-hidden p-0">
        <Dialog.Header className="border-b p-4">
          <Dialog.Title>Media library</Dialog.Title>
          <Dialog.Description>
            Select existing media from this workspace.
          </Dialog.Description>
        </Dialog.Header>

        <div className="border-b p-4">
          <div className="relative">
            <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search media"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </div>
        </div>

        <div className="h-[56vh] overflow-auto p-4">
          {loading && assets.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <Spinner />
            </div>
          ) : assets.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded border border-dashed text-sm text-muted-foreground">
              No media found
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(128px,1fr))] gap-3">
              {assets.map((asset) => {
                const Icon = getIcon(asset.fileType);
                const selected = selectedIds.includes(asset._id);

                return (
                  <button
                    key={asset._id}
                    type="button"
                    className={cn(
                      'overflow-hidden rounded border bg-background text-left transition hover:shadow-sm',
                      selected && 'border-primary ring-2 ring-primary/20',
                    )}
                    onClick={() => toggleAsset(asset)}
                  >
                    <div className="flex aspect-square items-center justify-center overflow-hidden bg-muted">
                      {asset.fileType === 'image' ? (
                        <img
                          src={getMediaAssetUrl(asset, { width: 320 })}
                          alt={asset.alt || asset.title || asset.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <Icon className="h-9 w-9 text-muted-foreground" />
                      )}
                    </div>
                    <div className="space-y-1 p-2">
                      <div className="truncate text-sm font-medium">
                        {asset.title || asset.name}
                      </div>
                      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span className="truncate">
                          {formatBytes(asset.size)}
                        </span>
                        <Badge variant="secondary" className="capitalize">
                          {asset.fileType}
                        </Badge>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {hasMore && (
          <div className="border-t p-3">
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

        {multiple && (
          <Dialog.Footer className="border-t p-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmSelection}
              disabled={selectedAssets.length === 0}
            >
              Use selected
            </Button>
          </Dialog.Footer>
        )}
      </Dialog.Content>
    </Dialog>
  );
}
