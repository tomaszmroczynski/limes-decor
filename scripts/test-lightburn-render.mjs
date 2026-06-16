import assert from "node:assert/strict";
import {
  renderLightBurnSvg,
  sampleAlbumTemplate,
} from "../lib/lightburn/render.mjs";

const valid = renderLightBurnSvg({
  template: sampleAlbumTemplate,
  values: {
    names: "Anna i Tomasz",
    dedication: "Najpiękniejsze chwile zapisane w fotografiach",
  },
});

assert.equal(valid.metadata.requiresReview, false);
assert.match(valid.svg, /width="160mm"/);
assert.match(valid.svg, /viewBox="0 0 160 110"/);
assert.match(valid.svg, /<path /);
assert.doesNotMatch(valid.svg, /<text/i);
assert.equal(valid.metadata.hash.length, 64);

const tooLong = renderLightBurnSvg({
  template: sampleAlbumTemplate,
  values: {
    names: "Anna i Tomasz",
    dedication:
      "ToJestBardzoDlugieSlowoBezSpacjiKtoregoNieWolnoAutomatycznieUcinacAniNaSilePomniejszac",
  },
});

assert.equal(tooLong.metadata.requiresReview, true);
assert.equal(tooLong.metadata.warnings[0].reason, "word_too_long");

console.log("LightBurn render tests passed");
