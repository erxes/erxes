import { useQuery } from '@apollo/client';
import {
  IconMaximize,
  IconRestore,
  IconZoomIn,
  IconZoomOut,
} from '@tabler/icons-react';
import { Button, Spinner } from 'erxes-ui';
import {
  PointerEvent as ReactPointerEvent,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useFormContext } from 'react-hook-form';
import { PAPER_TYPES, PX_PER_MM } from 'ui-modules/modules/documents/constants';
import { PROCESS_DOCUMENT } from 'ui-modules/modules/documents/graphql/queries';
import { PrintFormValues } from 'ui-modules/modules/documents/types/print';
import * as utils from 'ui-modules/modules/documents/utils';
import { useDebounce } from 'use-debounce';

const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8];

const MIN_ZOOM = ZOOM_STEPS[0];
const MAX_ZOOM = ZOOM_STEPS[ZOOM_STEPS.length - 1];

const FIT_PADDING = 0.92;

const clampZoom = (value: number) =>
  Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

const MIN_SCALE = 10;
const MAX_SCALE = 400;

const clampScale = (value: number) =>
  Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));

const roundMm = (value: number) => Math.round(value * 10) / 10;

export const PrintPreview = ({
  iframeRef,
}: {
  iframeRef: RefObject<HTMLIFrameElement>;
}) => {
  const { watch, setValue, trigger } = useFormContext<PrintFormValues>();

  const values = watch();

  const {
    _id,
    replacerIds,
    copies,
    size,
    orientation,
    margin,
    scale,
    offsetX,
    offsetY,
  } = values;

  const { width, height, type, isContinuous } = utils.resolveSize(values);

  const isRoll = type === PAPER_TYPES.ROLL;

  const scrollRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef(1);
  const transformRef = useRef({ scale, offsetX, offsetY });

  transformRef.current = { scale, offsetX, offsetY };

  const [spacing, setSpacing] = useState({ margin, scale });
  const [paperHeight, setPaperHeight] = useState(height);
  const [zoom, setZoom] = useState<number | null>(null);
  const [zoomDraft, setZoomDraft] = useState<string | null>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [paperSize, setPaperSize] = useState({ width: 0, height: 0 });

  const [debouncedSpacing] = useDebounce(spacing, 500);

  const {
    data: { documentsProcess: content } = {},
    loading,
    error,
  } = useQuery(PROCESS_DOCUMENT, {
    variables: {
      _id,
      replacerIds,
      config: { copies: Number(copies), width, height, type },
    },
    fetchPolicy: 'network-only',
    skip: !_id,
  });

  const fitZoom =
    paperSize.width && paperSize.height && viewport.width && viewport.height
      ? clampZoom(
          Math.min(
            viewport.width / paperSize.width,
            viewport.height / paperSize.height,
          ) * FIT_PADDING,
        )
      : 1;

  const activeZoom = zoom ?? fitZoom;

  fitRef.current = fitZoom;

  const commitZoomDraft = () => {
    const parsed = Number(zoomDraft);

    if (zoomDraft !== null && zoomDraft !== '' && Number.isFinite(parsed)) {
      setZoom(clampZoom(parsed / 100));
    }

    setZoomDraft(null);
  };

  const step = useCallback((direction: number) => {
    setZoom((current) => {
      const from = current ?? fitRef.current;

      const next =
        direction > 0
          ? ZOOM_STEPS.find((value) => value > from + 0.001)
          : [...ZOOM_STEPS].reverse().find((value) => value < from - 0.001);

      return next ?? clampZoom(from);
    });
  }, []);

  useEffect(() => {
    const node = scrollRef.current;

    if (!node) {
      return;
    }

    const observer = new ResizeObserver(([entry]) =>
      setViewport({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }),
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = paperRef.current;

    if (!node) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      const { width: measured, height: measuredHeight } = entry.contentRect;

      if (!measured || !measuredHeight) {
        return;
      }

      setPaperSize({ width: measured, height: measuredHeight });
    });

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = scrollRef.current;

    if (!node) {
      return;
    }

    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) {
        return;
      }

      event.preventDefault();

      setZoom((current) =>
        clampZoom(
          (current ?? fitRef.current) * (event.deltaY < 0 ? 1.1 : 1 / 1.1),
        ),
      );
    };

    node.addEventListener('wheel', onWheel, { passive: false });

    return () => node.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    const validate = async () => {
      if (!(await trigger(['scale', 'margin']))) {
        return;
      }

      setSpacing({ margin, scale });
    };

    validate();
  }, [margin, scale, trigger]);

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe || !content) {
      return;
    }

    let observer: ResizeObserver | undefined;

    iframe.dataset.printReady = 'false';

    const layoutConfig = {
      size,
      orientation,
      width,
      height,
      margin: debouncedSpacing.margin,
      scale: isRoll ? 100 : debouncedSpacing.scale,
    };

    const transformConfig = () => ({
      size,
      orientation,
      width,
      height,
      ...transformRef.current,
    });

    const onLoad = () => {
      iframe.dataset.printReady = 'true';

      const container =
        iframe.contentDocument?.querySelector('.scaled-content');

      if (!container) {
        return;
      }

      const applyFit = async () => {
        await utils.waitForImages(iframe);

        utils.transformLabels(iframe, transformConfig());
      };

      void applyFit();

      observer = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          const rect = (container as HTMLElement).getBoundingClientRect();

          iframe.style.height = `${Math.ceil(rect.height)}px`;

          utils.transformLabels(iframe, transformConfig());

          setPaperHeight(utils.syncPageHeight(iframe, layoutConfig));
        });
      });

      observer.observe(container);
    };

    iframe.addEventListener('load', onLoad, { once: true });

    utils.layout(content, layoutConfig, iframe);

    return () => {
      iframe.removeEventListener('load', onLoad);
      observer?.disconnect();
    };
  }, [
    content,
    size,
    orientation,
    width,
    height,
    isRoll,
    debouncedSpacing,
    iframeRef,
  ]);

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe || iframe.dataset.printReady !== 'true') {
      return;
    }

    utils.transformLabels(iframe, {
      size,
      orientation,
      width,
      height,
      scale,
      offsetX,
      offsetY,
    });
  }, [size, orientation, width, height, scale, offsetX, offsetY, iframeRef]);

  const startMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();

    const target = event.currentTarget;

    const startX = event.clientX;
    const startY = event.clientY;
    const originX = Number(offsetX) || 0;
    const originY = Number(offsetY) || 0;

    target.setPointerCapture(event.pointerId);

    const onMove = (moveEvent: PointerEvent) => {
      const scaledMm = PX_PER_MM * activeZoom;

      setValue(
        'offsetX',
        roundMm(originX + (moveEvent.clientX - startX) / scaledMm),
      );
      setValue(
        'offsetY',
        roundMm(originY + (moveEvent.clientY - startY) / scaledMm),
      );
    };

    const onUp = () => {
      target.releasePointerCapture(event.pointerId);
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerup', onUp);
    };

    target.addEventListener('pointermove', onMove);
    target.addEventListener('pointerup', onUp);
  };

  const startScale = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const paper = paperRef.current;

    if (!paper) {
      return;
    }

    const target = event.currentTarget;
    const rect = paper.getBoundingClientRect();

    const scaledMm = PX_PER_MM * activeZoom;

    const cornerX = rect.left + (Number(offsetX) || 0) * scaledMm;
    const cornerY = rect.top + (Number(offsetY) || 0) * scaledMm;

    const startDistance =
      Math.hypot(event.clientX - cornerX, event.clientY - cornerY) || 1;
    const startScaleValue = Number(scale) || 100;

    target.setPointerCapture(event.pointerId);

    const onMove = (moveEvent: PointerEvent) => {
      const distance = Math.hypot(
        moveEvent.clientX - cornerX,
        moveEvent.clientY - cornerY,
      );

      setValue(
        'scale',
        clampScale(Math.round((startScaleValue * distance) / startDistance)),
      );
    };

    const onUp = () => {
      target.releasePointerCapture(event.pointerId);
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerup', onUp);
    };

    target.addEventListener('pointermove', onMove);
    target.addEventListener('pointerup', onUp);
  };

  const resetTransform = () => {
    setValue('scale', 100);
    setValue('offsetX', 0);
    setValue('offsetY', 0);
  };

  if (error) {
    return <div>Can't process this document at the moment</div>;
  }

  return (
    <div
      id="print-preview"
      className="relative flex-1 flex flex-col min-h-0 bg-gray-100"
    >
      <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 shrink-0">
        <span className="text-xs text-gray-500 tabular-nums mr-auto">
          {width} × {isContinuous ? paperHeight : height} mm
          {isContinuous && ' (continuous)'}
          {isRoll && ` • ${scale}% • ${offsetX}, ${offsetY} mm`}
        </span>
        {isRoll && (
          <Button
            size="icon"
            variant="ghost"
            type="button"
            title="Reset scale and position"
            onClick={resetTransform}
            disabled={scale === 100 && !offsetX && !offsetY}
          >
            <IconRestore className="size-4" />
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          type="button"
          title="Zoom out"
          onClick={() => step(-1)}
          disabled={activeZoom <= MIN_ZOOM}
        >
          <IconZoomOut className="size-4" />
        </Button>
        <div className="flex items-center h-6 rounded border border-transparent px-1 hover:border-gray-300 focus-within:border-gray-400 focus-within:bg-white">
          <input
            className="w-8 bg-transparent text-right text-xs tabular-nums outline-none"
            value={zoomDraft ?? String(Math.round(activeZoom * 100))}
            title="Zoom level"
            inputMode="numeric"
            onChange={(event) =>
              setZoomDraft(event.target.value.replace(/[^\d]/g, ''))
            }
            onFocus={(event) => event.currentTarget.select()}
            onBlur={commitZoomDraft}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                commitZoomDraft();
                event.currentTarget.blur();
              }

              if (event.key === 'Escape') {
                setZoomDraft(null);
                event.currentTarget.blur();
              }
            }}
          />
          <span className="text-xs text-gray-500">%</span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          type="button"
          title="Zoom in"
          onClick={() => step(1)}
          disabled={activeZoom >= MAX_ZOOM}
        >
          <IconZoomIn className="size-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          type="button"
          title="Fit to view"
          onClick={() => setZoom(null)}
        >
          <IconMaximize className="size-4" />
        </Button>
      </div>

      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100/70">
          <Spinner />
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-auto styled-scroll p-6 flex items-start"
      >
        <div
          className={`relative ${isRoll ? 'mx-auto' : 'm-auto'}`}
          style={{
            width: paperSize.width ? paperSize.width * activeZoom : undefined,
            height: paperSize.height
              ? paperSize.height * activeZoom
              : undefined,
          }}
        >
          <div
            ref={paperRef}
            className="relative bg-white shadow-xl"
            style={{
              width: `${width}mm`,
              ...(isContinuous
                ? { height: `${paperHeight}mm` }
                : { minHeight: `${height}mm` }),
              transform: `scale(${activeZoom})`,
              transformOrigin: 'top left',
            }}
          >
            <iframe
              ref={iframeRef}
              title="Print Preview"
              className={`w-full h-full border-0 ${
                isRoll ? 'pointer-events-none' : ''
              }`}
              style={isContinuous ? undefined : { minHeight: `${height}mm` }}
              scrolling="no"
            />
          </div>

          {isRoll && (
            <>
              <div
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                title="Drag to position the document"
                onPointerDown={startMove}
              />
              <div
                className="absolute -right-1.5 -bottom-1.5 size-3 rounded-sm border border-white bg-primary cursor-nwse-resize shadow"
                title="Drag to scale the document"
                onPointerDown={startScale}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
