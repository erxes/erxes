-- Manifests registered before api.docs' "website" audience became "portal":
-- plugins.list's output schema rejects them, which empties every organisation's plugin list.
UPDATE "core_plugins" SET "manifest" = jsonb_set("manifest", '{api,docs}', (
	SELECT jsonb_agg(
		CASE WHEN doc.value ->> 'audience' = 'website'
			THEN jsonb_set(doc.value, '{audience}', '"portal"')
			ELSE doc.value
		END ORDER BY doc.ordinality
	)
	FROM jsonb_array_elements("manifest" -> 'api' -> 'docs') WITH ORDINALITY AS doc(value, ordinality)
), false)
WHERE "manifest" -> 'api' -> 'docs' @> '[{"audience": "website"}]';
