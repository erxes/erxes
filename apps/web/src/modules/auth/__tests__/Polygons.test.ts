import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vite-plus/test';
import { Polygons } from '../components/Polygons';

const classOf = (markup: string) => markup.match(/class="([^"]*)"/)?.[1] ?? '';

describe('Polygons', () => {
  it('draws the banner backdrop without a stray class when none is given', () => {
    const classes = classOf(renderToStaticMarkup(createElement(Polygons))).split(' ');

    expect(classes).not.toContain('undefined');
    expect(classes).toContain('absolute');
  });

  it('adds the given class to the banner backdrop', () => {
    const markup = renderToStaticMarkup(createElement(Polygons, { className: 'opacity-50' }));

    expect(classOf(markup).split(' ')).toContain('opacity-50');
  });
});
