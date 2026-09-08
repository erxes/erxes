# `hrm_api` Plugin Guide

## Identity

- **Plugin:** `hrm`
- **Project:** `hrm_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/hrm_api`
- **Last synchronized:** `2026-09-07`

## Scope

### Owns

- HRM backend service runtime, settings, payroll-oriented reference data, and future HRM module APIs owned by the HRM plugin.
- Payroll settings for system configs, contribution profiles, grades, seniority rules, and skills.

### Does not own

- Core users, branches, departments, positions, and user movement records; these are consumed through public core contracts.
- Accounting accounts, journals, and transactions; HRM stores only HRM-owned payroll configuration and future posting payloads.
- Frontend UI state, routes, forms, or presentation.

## Current Capabilities

- Starts the `hrm` plugin API service on port `3311`.
- Registers GraphQL schema and resolvers for HRM settings.
- Stores generic HRM configs by `code` and optional `subId`.
- Stores contribution profiles with employee/employer rates, caps, base limits, and optional component breakdowns.
- Stores grade/reference records with rank, base salary, and allowance metadata.
- Stores seniority rules with fixed or base-salary percentage brackets.
- Stores skill/reference records with category and score metadata.
- Registers HRM settings permissions and default admin/viewer permission groups.

## Architecture

| Area               | Path                         | Responsibility                                        |
| ------------------ | ---------------------------- | ----------------------------------------------------- |
| Runtime            | `src/main.ts`                | Starts the HRM API plugin service.                    |
| Apollo integration | `src/apollo`                 | Registers HRM GraphQL type definitions and resolvers. |
| Models             | `src/connectionResolvers.ts` | Generates tenant-scoped Mongoose models.              |
| Settings           | `src/modules/settings`       | Owns HRM configs and payroll reference records.       |
| Permissions        | `src/meta/permissions.ts`    | Exposes HRM settings permission metadata.             |

## Contracts

### Provides

- GraphQL config contracts: `hrmConfigDetail`, `hrmConfig`, `hrmConfigs`, `hrmConfigsCount`, `hrmConfigsByCode`, `hrmConfigsCreate`, `hrmConfigsUpdate`, `hrmConfigsRemove`, and `hrmConfigsUpdateByCode`.
- GraphQL contribution profile contracts: `hrmContributionProfileDetail`, `hrmContributionProfileByCode`, `hrmContributionProfiles`, `hrmContributionProfilesCount`, `hrmContributionProfilesCreate`, `hrmContributionProfilesUpdate`, `hrmContributionProfilesArchive`, and `hrmContributionProfilesRemove`.
- GraphQL grade contracts: `hrmGradeDetail`, `hrmGradeByCode`, `hrmGrades`, `hrmGradesCount`, `hrmGradesCreate`, `hrmGradesUpdate`, `hrmGradesArchive`, and `hrmGradesRemove`.
- GraphQL seniority rule contracts: `hrmSeniorityRuleDetail`, `hrmSeniorityRuleByCode`, `hrmSeniorityRules`, `hrmSeniorityRulesCount`, `hrmSeniorityRulesCreate`, `hrmSeniorityRulesUpdate`, `hrmSeniorityRulesArchive`, and `hrmSeniorityRulesRemove`.
- GraphQL skill contracts: `hrmSkillDetail`, `hrmSkillByCode`, `hrmSkills`, `hrmSkillsCount`, `hrmSkillsCreate`, `hrmSkillsUpdate`, `hrmSkillsArchive`, and `hrmSkillsRemove`.
- Permission actions `hrmSettingsView`, `hrmSettingsManage`, and `hrmSettingsRemove`.

### Consumes

- Shared backend utilities, service startup APIs, GraphQL scalar definitions, permission types, and tenant-scoped model generation from `erxes-api-shared`.
- Core configs through `sendTRPCMessage` helper `getCoreConfig`.

## Data and State

- All Mongoose models are generated per request `subdomain`; resolvers must use tenant-scoped `models`.
- `hrm_configs` stores generic HRM setting values keyed by `code` plus optional `subId`.
- `hrm_contribution_profiles` stores payroll statutory contribution categories with employee/employer rates and optional component breakdowns.
- `hrm_grades` stores payroll-grade references and default salary/allowance metadata.
- `hrm_seniority_rules` stores tenure-based fixed or percentage allowance brackets.
- `hrm_skills` stores skill references for future employee profiles, KPI, and payroll evaluation flows.

## Local Invariants

- HRM must not duplicate core user, branch, department, position, or movement source-of-truth data.
- Contribution profile employee and employer component rates must match their side's total rate when components are provided.
- Seniority rule brackets must not overlap and must be sorted by `minMonths` before persistence.
- Previous payroll calculations must eventually rely on stored snapshots rather than mutable current settings.
- GraphQL operation names must stay prefixed with `hrm`.

## Validation

- `pnpm nx build hrm_api`
- `pnpm nx test hrm_api`
- `pnpm build` from `backend/plugins/hrm_api`
- Smoke scenario: create a contribution profile with matching employee/employer component totals, create a grade, create a seniority rule, create a skill, then query each list/detail contract.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-09-07` — `Tenant Scoped Static Methods`

- **Summary:** Removed global Mongoose model compilation from HRM settings models so tenant-scoped models receive their loaded static methods.
- **Affected areas:** `src/modules/settings/db/models`.
- **Contracts changed:** None.

### `2026-09-07` — `HRM Settings Backend Foundation`

- **Summary:** Added the HRM API runtime wiring and settings GraphQL contracts for configs, contribution profiles, grades, seniority rules, and skills.
- **Affected areas:** `src/main.ts`, `src/apollo`, `src/meta/permissions.ts`, `src/connectionResolvers.ts`, `src/modules/settings`.
- **Contracts changed:** Added HRM settings GraphQL queries/mutations and permission actions `hrmSettingsView`, `hrmSettingsManage`, and `hrmSettingsRemove`.
