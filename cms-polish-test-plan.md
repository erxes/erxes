# CMS Polish — Testing Plan

Covers the five changes on this branch:

1. Scheduled publish / auto-archive worker (`content_api`)
2. Unsaved-changes guard + draft autosave (post editor)
3. Dead `TranslationEditor.tsx` removal
4. Author filter on the posts list
5. Per-post SEO fields + duplicate post action

---

## 0. Environment setup

Required services: **MongoDB**, **Redis** (workers depend on it), **gateway** (serves
`/locales/{lng}/content.json` — needed for the new i18n keys), **core-api**,
**content_api**, and the UIs.

```bash
# APIs (includes gateway + core-api + plugins)
pnpm dev:apis        # or: npx nx run-many -t serve -p core-api gateway content_api

# UIs
pnpm dev:uis         # or: npx nx serve core-ui  /  npx nx serve content_ui (port 3003)
```

Preconditions:

- A CMS website (client portal) exists; you can reach
  `/content/cms/<websiteId>/posts`.
- Logged-in user has post create/update/publish permissions.
- At least 2 languages configured on the website (for translation-mode checks).
- Watch the `content_api` console for worker logs throughout.

On boot, confirm these two log lines from `content_api`:

```
Worker for queue content-scheduled-posts-check is ready
Worker for queue content-schedule is ready
```

---

## 1. Scheduled publish / auto-archive worker

### 1.1 Scheduled → published (happy path)
1. Create a post, set status **Scheduled**, `scheduledDate` = now + 1 minute. Save.
2. Confirm the public site / `cmsPostList(status: published)` does **not** include it.
3. Wait ≤ 2 minutes.
- ✅ Post status becomes `published`.
- ✅ `publishedDate` is set (≈ the minute the job ran).
- ✅ Console shows `[content:schedule] org: os, published: 1, archived: 0`.

### 1.2 publishedDate is preserved
1. Take a post that was published before (has `publishedDate`), change status back
   to Scheduled with `scheduledDate` in the past. Save.
2. After the next tick:
- ✅ Status is `published` and `publishedDate` kept its **original** value
  (the `$ifNull` path — it must not be overwritten).

### 1.3 Future dates don't fire early
1. Schedule a post for tomorrow.
- ✅ It stays `scheduled` across several ticks.

### 1.4 Auto-archive
1. On a **published** post, set `autoArchiveDate` = now + 1 minute (enable the
   auto-archive toggle in the sidebar). Save.
2. Wait ≤ 2 minutes.
- ✅ Status becomes `archived`; log shows `archived: 1`.
3. Negative: posts with **no** `autoArchiveDate` are untouched (null must not
   match `$lte` — verify at least one published post without the date stays
   published).

### 1.5 Worker resilience
1. Stop Redis, wait a minute, start it again.
- ✅ `content_api` reconnects; the repeatable job resumes (schedule another post
  to prove it).
2. Restart `content_api`.
- ✅ No duplicate-scheduler errors — `upsertJobScheduler` must be idempotent
  (one firing per minute, not two, after N restarts; verify by log frequency).

### 1.6 SaaS mode (if applicable)
- With `VERSION=saas`, confirm the dispatcher enqueues one `content-schedule`
  job per org and posts in **each** org transition independently.

---

## 2. Unsaved-changes guard + autosave

### 2.1 Guard: in-app navigation
1. Open an existing post, change the title.
2. Click back / navigate to the posts list (in-app).
- ✅ "Discard unsaved changes?" AlertDialog appears.
- ✅ **Stay here** keeps you on the editor with edits intact.
- ✅ **Leave without saving** navigates; reopening the post shows the old title.

### 2.2 Guard: browser-level
1. Dirty the form, then reload the tab / close it.
- ✅ Native browser "leave site?" prompt appears (beforeunload).
2. With a **pristine** form, reload.
- ✅ No prompt.

### 2.3 Guard doesn't fire on save
1. Edit a post, press **Save** in the header.
- ✅ Post saves, page navigates back to the list, **no** discard dialog.
   (This exercises the `onSaved` re-baseline before navigation.)

### 2.4 Autosave: draft posts only
1. Open an existing **draft** post. Type in the title/content, stop typing.
2. Wait ~5–6 s.
- ✅ Network tab shows `cmsPostsEdit` firing with **no toast, no navigation**.
- ✅ Reload the page — the autosaved text is there.
3. Repeat on a **published** post.
- ✅ No autosave request ever fires (explicit Save required).
4. On the **new post** page (`/posts/add`, no `_id`):
- ✅ No autosave fires (no premature post creation).

### 2.5 Autosave vs. typing race (the clobber fix)
1. On a draft, type continuously for ~20 s without pausing 5 s.
- ✅ No autosave mid-typing (debounce holds), no cursor jumps, no text reverts.
2. Pause 5 s (autosave fires — `refetchQueries: 'all'` runs), then immediately
   resume typing while requests are in flight.
- ✅ Typed characters are never rolled back when the refetched `cmsPost` lands
   (the `lastResetKeyRef` guard in `usePostForm`).
3. After an autosave completes, navigate away **without** further edits.
- ✅ No discard dialog (form re-baselined as pristine).
4. Type more after an autosave, then navigate away.
- ✅ Discard dialog **does** appear (post-save edits still tracked as dirty).

### 2.6 Language switching interplay
1. On a multi-language post, switch header language tabs with no edits.
- ✅ Switching languages alone does not mark the form dirty / trigger autosave.
2. Edit a translation, wait for autosave (draft post).
- ✅ Translation content saved via the normal translations path.

---

## 3. TranslationEditor removal (regression only)

1. `grep -rn "TranslationEditor\|CMS_ADD_TRANSLATION" frontend/` → no hits.
2. Full translation flow still works: open post → switch language tab → edit
   title/content → Save → reload → translation persists (uses
   `cmsPostsEdit` + `cmsEditTranslation`, unaffected paths).
3. content_ui builds: `npx nx build content_ui`.

---

## 4. Author filter

1. Have posts by ≥ 2 different authors (create one as another user, or set
   authorId via duplicate/edit).
2. Posts list → filter popover → **Author** → pick a member.
- ✅ URL gains `?author=<userId>`; list shows only that author's posts.
- ✅ Filter bar shows an Author chip with the member's name.
3. Clear the chip.
- ✅ Full list returns.
4. Combine: Author + Status + a date filter simultaneously.
- ✅ Results are the intersection; total count matches.
5. Deep-link: paste the URL with `?author=...` into a fresh tab.
- ✅ Filter is applied from the URL (chip + filtered list).
6. Regression: existing tag/category/status/type/date filters still work alone
   and combined.

---

## 5. Per-post SEO + duplicate

### 5.1 SEO fields
1. Open a post (default language): **SEO title** and **SEO description** inputs
   appear below the short-description field.
- ✅ Char limits enforced (70 / 160).
2. Fill both, Save, reload.
- ✅ Values persist (check `cmsPost` response contains `seoTitle`,
  `seoDescription`).
3. Switch to a non-default language tab.
- ✅ SEO inputs are hidden (they belong to the base post, not translations).
4. Clear both fields, save, reload.
- ✅ Fields are empty after reload (empty strings are sent explicitly so `$set`
  persists the clear — regression-fixed during plan writing).
5. GraphQL: `cmsPosts { seoTitle seoDescription }` returns the fields.

### 5.2 Duplicate post
1. Posts list → row ⋯ menu → **Duplicate** on a published post with categories,
   tags, thumbnail, custom fields, and ≥ 1 translation.
- ✅ Success toast; list refetches and shows "**<title> (Copy)**".
2. Open the copy and verify:
- ✅ Status = **draft** (even though source was published).
- ✅ New unique slug (not the source slug, no collision error).
- ✅ `viewCount` 0, no reactions, `publishedDate`/`scheduledDate`/
  `autoArchiveDate` empty, featured off.
- ✅ Content, excerpt, categories, tags, media, custom fields, SEO fields copied.
- ✅ Author = the duplicating user (not the original author).
- ✅ Translations copied with "(Copy)" titles (check language tabs).
3. Duplicate the duplicate.
- ✅ Works; slug uniqueness holds ("...(copy)-1" style).
4. Permissions: as a user with only `createReview` (no publish/approve).
- ✅ Duplicate succeeds and lands as draft; a user with **no** create
  permission gets a permission error.
5. Source post is untouched after duplication (status/dates/counters).

---

## 6. Cross-cutting checks

- **i18n**: switch UI language to Mongolian — new strings render (discard
  dialog, SEO labels, Duplicate action, toasts). No raw keys like
  `unsaved-changes-title` on screen (gateway must be restarted to serve the
  updated locale JSONs).
- **Console hygiene**: no new React warnings/errors during all flows above.
- **Builds**: `npx nx build content_api --skip-nx-cache` and
  `npx nx build content_ui` both green.
- **Pages/categories regression**: page editing and category CRUD untouched by
  the shared-hook additions (guard is only mounted in the post form).

## Suggested order & effort

| Priority | Section | Time |
|---|---|---|
| P0 | 1.1–1.4 (worker), 2.1–2.4 (guard/autosave basics) | ~30 min |
| P1 | 2.5 (race), 5.1–5.2 (SEO + duplicate) | ~30 min |
| P2 | 4 (author filter), 3, 6, 1.5–1.6 | ~30 min |
