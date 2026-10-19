import { trayGlow } from '../utils/trayGlow';
import { NOTIF_BLUE } from '../bloub/engine/decor';
import type { ITrayGlowInput } from '../utils/trayGlow';

const base = (over: Partial<ITrayGlowInput> = {}): ITrayGlowInput => ({
  state: 'idle',
  dragging: false,
  hovering: false,
  dark: true,
  botColor: '#0a0a0c',
  ...over,
});

describe('trayGlow', () => {
  it('returns null while idle at rest', () => {
    expect(trayGlow(base())).toBeNull();
    expect(trayGlow(base({ state: 'sleep' }))).toBeNull();
    expect(trayGlow(base({ state: 'wide' }))).toBeNull();
  });

  it('pulses amber while awaiting', () => {
    expect(trayGlow(base({ state: 'alert' }))).toEqual({
      color: '#f0b429',
      animation: 'pulse',
      durationMs: 1200,
      opacity: 0.8,
    });
  });

  it('pulses the notification blue for unread', () => {
    const glow = trayGlow(base({ state: 'notify' }));
    expect(glow?.color).toBe(NOTIF_BLUE);
    expect(glow?.animation).toBe('pulse');
    expect(glow?.durationMs).toBe(2000);
  });

  it('breathes violet while thinking or working', () => {
    for (const state of ['thinking', 'orbit'] as const) {
      expect(trayGlow(base({ state }))).toEqual(
        expect.objectContaining({
          color: '#8b5cf6',
          animation: 'pulse',
          durationMs: 1600,
        }),
      );
    }
  });

  it('flashes red twice on error', () => {
    expect(trayGlow(base({ state: 'exclaim' }))).toEqual(
      expect.objectContaining({
        color: '#e8483f',
        animation: 'twice',
      }),
    );
  });

  it('fires one white flash on finish', () => {
    expect(trayGlow(base({ state: 'comet' }))).toEqual(
      expect.objectContaining({
        color: '#f8fafc',
        animation: 'flash',
        durationMs: 1000,
      }),
    );
  });

  it('dragging outranks every state', () => {
    for (const state of ['alert', 'notify', 'thinking', 'exclaim', 'idle'] as const) {
      expect(trayGlow(base({ state, dragging: true }))).toEqual(
        expect.objectContaining({ animation: 'steady', color: '#9aa4b2' }),
      );
    }
  });

  it('hover glows faintly in the bot colour, but never over a state glow', () => {
    expect(
      trayGlow(base({ hovering: true, botColor: '#2496e8' })),
    ).toEqual(
      expect.objectContaining({
        color: '#2496e8',
        animation: 'steady',
      }),
    );
    expect(trayGlow(base({ state: 'alert', hovering: true }))?.color).toBe(
      '#f0b429',
    );
  });

  it('dims every glow on light pages', () => {
    for (const state of ['alert', 'notify', 'exclaim', 'comet'] as const) {
      const darkGlow = trayGlow(base({ state, dark: true }));
      const lightGlow = trayGlow(base({ state, dark: false }));
      expect(lightGlow?.opacity).toBeLessThan(darkGlow?.opacity ?? 0);
    }
  });
});
