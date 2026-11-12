import type { Reporter, TestModule, Vitest } from 'vite-plus/test/node';

/** Skipped, pending or todo suites and tests in the modules that ran. */
const skippedIn = (modules: readonly TestModule[]) =>
  modules.flatMap((module) => [
    ...[...module.children.allSuites()]
      .filter((suite) => suite.state() === 'skipped' || suite.state() === 'pending')
      .map((suite) => `${suite.state()} suite: ${suite.fullName} (${module.relativeModuleId})`),
    ...[...module.children.allTests()]
      .filter((test) => ['skipped', 'pending'].includes(test.result().state))
      .map((test) => `${test.result().state} test: ${test.fullName} (${module.relativeModuleId})`),
  ]);

/** Projects whose files all ran without running a test. */
const emptyProjects = async (vitest: Vitest, modules: readonly TestModule[]) => {
  const problems: string[] = [];

  for (const project of vitest.projects) {
    const ran = modules.filter((module) => module.project.name === project.name);
    const { testFiles } = await project.globTestFiles();
    const tests = ran.flatMap((module) => [...module.children.allTests()]);

    if (ran.length === testFiles.length && !tests.some((test) => test.result().state !== 'skipped'))
      problems.push(`project ${project.name} ran no tests`);
  }

  return problems;
};

/**
 * A skipped test passes in Vitest, so this reporter fails the run on any
 * skipped, pending or todo test or suite (`.skip`, `skipIf`, `ctx.skip()`,
 * `.todo`), and on a project whose files all ran without a test. A run
 * filtered with `-t` skips what it doesn't match, so only the project rule
 * applies then; a run of some files never checks the other projects.
 */
export const noSkips = (): Reporter => {
  let vitest: Vitest | undefined;

  return {
    onInit(ctx) {
      vitest = ctx;
    },
    async onTestRunEnd(modules) {
      if (!vitest) return;

      const problems = [
        ...(vitest.config.testNamePattern ? [] : skippedIn(modules)),
        ...(await emptyProjects(vitest, modules)),
      ];

      if (problems.length) {
        process.exitCode = 1;
        vitest.logger.error(['Tests must run, not skip:', ...problems].join('\n  '));
      }
    },
  };
};
