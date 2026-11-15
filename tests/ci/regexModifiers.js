/**
 * @fileoverview
 * Validates that the built bundles contain no regex modifier groups such as `(?i:...)`.
 * Older WebKit builds (for example iOS 18) reject them at parse time, so the whole bundle fails to load.
 */

import test from "ava";
import { glob } from "glob";
import { readFileSync } from "node:fs";

const REGEX_MODIFIER_GROUP = /\(\?(?:[ims]+(?:-[ims]*)?|-[ims]+):/g;

/**
 * Validates that no JS bundle in the package uses regex modifier groups.
 * @param {import("ava").ExecutionContext} t - AVA unit test context.
 */
test("JS bundles contain no regex modifier groups", async (t) => {
	const bundles = await glob("packages/core/dist/*.{js,mjs}");
	t.true(bundles.length > 0, "Distribution should contain JS bundles");

	const offenders = [];
	for (const bundle of bundles) {
		const matches = readFileSync(bundle, "utf8").match(REGEX_MODIFIER_GROUP);
		if (matches) {
			offenders.push(`${bundle}: ${[...new Set(matches)].join(", ")}`);
		}
	}

	t.deepEqual(
		offenders,
		[],
		`Regex modifier groups found in bundles: ${offenders.join("; ")}`
	);
});
