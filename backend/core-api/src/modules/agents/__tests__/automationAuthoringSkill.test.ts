import { buildAgentsInstructions } from '../agent';
import { AUTOMATION_AUTHORING_SKILL } from '../skills/automationAuthoring';

describe('automation authoring skill', () => {
  const { instructions } = AUTOMATION_AUTHORING_SKILL;

  it('authors through the published contracts and never activates', () => {
    expect(instructions).toContain('only from automationNodeCatalog');
    expect(instructions).toContain('automationNodeSchema(type)');
    expect(instructions).toContain('Call automationValidate');
    expect(instructions).toContain('always with status "draft"');
    expect(instructions).toContain('Never set status "active"');
  });

  it('takes workspace records from the workspace and asks when there is a choice', () => {
    expect(instructions).toContain('are never invented');
    expect(instructions).toContain('ask the user to choose with ask_user');
    expect(instructions).toContain(
      'segmentFields(contentType: the trigger type)',
    );
    expect(instructions).toContain('ownedBy: "automation"');
    expect(instructions).toContain('segmentsPreviewCount(contentType, root)');
    expect(instructions).toContain('needs at least one condition');
    expect(instructions).toContain(
      'emailSenderOptions(scope: "transactional")',
    );
    expect(instructions).toContain(
      'fromEmailPlaceHolder when alignedFrom is set',
    );
  });

  it('writes variables the way the builder does and lays nodes out like it', () => {
    expect(instructions).toContain('{{ primaryEmail }}');
    expect(instructions).toContain('500 further right');
    expect(instructions).toContain('240 apart');
  });

  it('builds a conversation around one agent and picks values without splits', () => {
    expect(instructions).toContain('use one aiAgent with goalType "generateText"');
    expect(instructions).toContain('never chain several agents');
    expect(instructions).toContain('"<< cond:<id> >>"');
    expect(instructions).toContain("set the split node's targetActionId");
  });

  it('writes an email body the builder can open and a markdown note', () => {
    expect(instructions).toContain('contentFormat "blocks"');
    expect(instructions).toContain('content in markdown');
  });

  it('is part of every run', () => {
    expect(buildAgentsInstructions(new Date('2026-10-25'))).toContain(
      instructions,
    );
  });
});
