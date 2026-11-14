import { cn } from 'erxes-ui';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { z } from 'zod';
import { isNumeric } from './csvRows';
import { HEIGHT_MESSAGE, reportDocument } from './reportDocument';

const watchTheme = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);

  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  return () => observer.disconnect();
};

const useColorScheme = () =>
  useSyncExternalStore(watchTheme, () =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  );

const FRAME_MIN = 120;

const HeightMessage = z.object({ [HEIGHT_MESSAGE]: z.number().int().min(0).max(100_000) });

export const HtmlFrame = ({ title, html }: { title: string; html: string }) => {
  const scheme = useColorScheme();
  const [nonce] = useState(() => crypto.randomUUID().replaceAll('-', ''));
  const [height, setHeight] = useState(FRAME_MIN);
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const resize = (event: MessageEvent) => {
      const reported = HeightMessage.safeParse(event.data).data?.[HEIGHT_MESSAGE];

      if (event.source === frame.current?.contentWindow && reported !== undefined)
        setHeight(Math.max(FRAME_MIN, reported));
    };

    window.addEventListener('message', resize);

    return () => window.removeEventListener('message', resize);
  }, []);

  return (
    <iframe
      ref={frame}
      title={title}
      sandbox="allow-scripts"
      srcDoc={reportDocument(title, html, scheme, nonce)}
      style={{ '--frame-height': `${height}px` }}
      className="block h-(--frame-height) w-full border-0"
    />
  );
};

const columnsOf = (cells: string[]) => cells.map((text, column) => ({ column, text }));

export const CsvTable = ({
  rows,
  limit,
  label,
}: {
  rows: string[][];
  limit?: number;
  label: string;
}) => {
  const [header = [], ...body] = rows;

  const shown = (limit === undefined ? body : body.slice(0, limit)).map((cells, line) => ({
    line,
    cells: columnsOf(cells),
  }));

  return (
    <table aria-label={label} className="w-full border-collapse text-xs">
      <thead>
        <tr>
          {columnsOf(header).map((cell) => (
            <th
              key={cell.column}
              scope="col"
              className="border-b px-2 py-1.5 text-left font-medium text-muted-foreground"
            >
              {cell.text}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {shown.map((row) => (
          <tr key={row.line}>
            {row.cells.map((cell) => (
              <td
                key={cell.column}
                className={cn(
                  'border-b px-2 py-1.5 align-top',
                  isNumeric(cell.text) && 'text-right tabular-nums',
                )}
              >
                {cell.text}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
