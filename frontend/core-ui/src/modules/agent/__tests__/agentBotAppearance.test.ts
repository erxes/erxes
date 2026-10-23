/** @jest-environment jsdom */
import {
  AGENT_BOT_APPEARANCE_DEFAULT,
  parseAgentBotAppearance,
  readPageBackground,
} from '../states/agentBotAppearanceState';

describe('parseAgentBotAppearance', () => {
  it('returns defaults for missing or non-object input', () => {
    expect(parseAgentBotAppearance(undefined)).toEqual(
      AGENT_BOT_APPEARANCE_DEFAULT,
    );
    expect(parseAgentBotAppearance(null)).toEqual(
      AGENT_BOT_APPEARANCE_DEFAULT,
    );
    expect(parseAgentBotAppearance('nuage')).toEqual(
      AGENT_BOT_APPEARANCE_DEFAULT,
    );
    expect(parseAgentBotAppearance(42)).toEqual(AGENT_BOT_APPEARANCE_DEFAULT);
  });

  it('keeps known catalogue ids', () => {
    expect(
      parseAgentBotAppearance({
        shape: 'goutte',
        color: 'turquoise',
        expression: 'hilare',
        trayEnabled: false,
      }),
    ).toEqual({
      shape: 'goutte',
      color: 'turquoise',
      expression: 'hilare',
      trayEnabled: false,
    });
  });

  it('falls back per-field on unknown ids', () => {
    expect(
      parseAgentBotAppearance({
        shape: 'not-a-shape',
        color: 'not-a-color',
        expression: 'not-an-expression',
        trayEnabled: 'yes',
      }),
    ).toEqual(AGENT_BOT_APPEARANCE_DEFAULT);
  });

  it('repairs only the broken fields of a mixed blob', () => {
    expect(
      parseAgentBotAppearance({
        shape: 'hexagone',
        color: 'bogus',
        trayEnabled: false,
      }),
    ).toEqual({
      shape: 'hexagone',
      color: 'encre',
      expression: 'neutre',
      trayEnabled: false,
    });
  });
});


describe('readPageBackground', () => {
  afterEach(() => {
    document.body.style.backgroundColor = '';
    document.documentElement.style.backgroundColor = '';
  });

  it('reads the live body background as hex', () => {
    document.body.style.backgroundColor = 'rgb(24, 24, 27)';
    expect(readPageBackground()).toBe('#18181b');
  });

  it('falls back to documentElement when body is transparent', () => {
    document.body.style.backgroundColor = 'rgba(0, 0, 0, 0)';
    document.documentElement.style.backgroundColor = 'rgb(250, 250, 251)';
    expect(readPageBackground()).toBe('#fafafb');
  });

  it('returns null when nothing resolves to a real colour', () => {
    expect(readPageBackground()).toBeNull();
  });
});
