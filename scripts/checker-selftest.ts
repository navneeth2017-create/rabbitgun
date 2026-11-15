/**
 * Self-test for the deterministic proof checker. Run with:
 *   node scripts/checker-selftest.ts
 * (Node 24 strips types natively; the checker imports only types.)
 */
import { checkProof, gtinCheckDigitValid, type ProofInput } from "../lib/checker.ts";
import type { SpecPayload } from "../lib/specs.ts";

const spec: SpecPayload = {
  blocks: [
    { panel: "front", text: "BORN AGAIN KRATOM — Maeng Da · Whole Leaf Powder · 250 g" },
    { panel: "back", text: "Whole leaf only. No extracts. No 7-OH. Lab-tested, batch-traceable." },
  ],
  claims: [{ claim: "No extracts. No 7-OH.", source: "COA BAK-2026-114" }],
  dims: { trimW: "3.5", trimH: "6.25", bleed: "0.125", safe: "0.125", dieline: "SR-POUCH-250 v5" },
  requiredText: [
    "WARNING: Keep out of reach of minors. Not for use under 21.",
    "Net Wt. 250 g (8.8 oz)",
  ],
  spotColors: ["PMS 485 U", "PMS Black 6 U"],
};

const GTIN = "8101234567801";

const clean: ProofInput = {
  vendor: "Sunrise Packaging Co.",
  contact: "Kerri",
  proofVersion: 2,
  gtin: GTIN,
  trimW: "3.5",
  trimH: "6.25",
  dieline: "SR-POUCH-250 v5",
  spotColors: ["PMS 485 U", "PMS Black 6 U"],
  panels: [
    { panel: "front", text: "BORN AGAIN KRATOM — Maeng Da · Whole Leaf Powder · 250 g" },
    {
      panel: "back",
      text:
        "Whole leaf only. No extracts. No 7-OH. Lab-tested, batch-traceable.\n" +
        "WARNING: Keep out of reach of minors. Not for use under 21.\n" +
        "Net Wt. 250 g (8.8 oz)",
    },
  ],
};

let failures = 0;
function expect(name: string, ok: boolean, detail = "") {
  if (ok) {
    console.log(`  ok  ${name}`);
  } else {
    failures++;
    console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function codes(input: ProofInput) {
  return checkProof(spec, GTIN, input).findings.map((f) => f.code);
}

// 1. clean proof → PASS, no findings
{
  const r = checkProof(spec, GTIN, clean);
  expect("clean proof verdict PASS", r.verdict === "PASS", r.verdict);
  expect("clean proof has no findings", r.findings.length === 0, JSON.stringify(codes(clean)));
}

// 2. typographic differences and extra copy do not block
{
  const r = checkProof(spec, GTIN, {
    ...clean,
    panels: [
      { panel: "front", text: "Born Again Kratom — Maeng Da · Whole Leaf Powder · 250 g" },
      {
        panel: "back",
        text:
          "Whole leaf only. No extracts. No 7-OH. Lab-tested, batch-traceable.\n" +
          "WARNING: Keep out of reach of minors. Not for use under 21.\n" +
          "Net Wt. 250 g (8.8 oz)\n" +
          "Distributed by Born Again Kratom, Austin TX. Manufactured in a GMP facility.",
      },
    ],
  });
  expect("case + extra copy still PASS", r.verdict === "PASS", `${r.verdict} ${r.findings.map((f) => f.code)}`);
}

// 3. missing approved copy → HOLD
{
  const r = checkProof(spec, GTIN, {
    ...clean,
    panels: [
      { panel: "front", text: "BORN AGAIN KRATOM — Maeng Da · Whole Leaf Powder" },
      clean.panels[1],
    ],
  });
  expect("missing copy HOLD", r.verdict === "HOLD", r.verdict);
  expect("missing copy flagged", codes({ ...clean, panels: [{ panel: "front", text: "BORN AGAIN KRATOM — Maeng Da" }, clean.panels[1]] }).includes("COPY-01"));
}

// 4. reordered copy → warning only
{
  const r = checkProof(spec, GTIN, {
    ...clean,
    panels: [
      { panel: "front", text: "Whole Leaf Powder · Maeng Da — BORN AGAIN KRATOM · 250 g" },
      clean.panels[1],
    ],
  });
  expect("reordered copy is warning", r.verdict === "PASS WITH NOTES", r.verdict);
  expect("reordered copy code", codes({ ...clean, panels: [{ panel: "front", text: "Whole Leaf Powder · Maeng Da — BORN AGAIN KRATOM · 250 g" }, clean.panels[1]] }).includes("COPY-02"));
}

// 5. wrong barcode → HOLD
{
  const r = checkProof(spec, GTIN, { ...clean, gtin: "8101234567818" });
  expect("wrong GTIN HOLD", r.verdict === "HOLD", r.verdict);
  expect("wrong GTIN code", r.findings.some((f) => f.code === "GTIN-02"));
}

// 6. missing required warning → HOLD
{
  const r = checkProof(spec, GTIN, {
    ...clean,
    panels: [
      clean.panels[0],
      { panel: "back", text: "Whole leaf only. No extracts. No 7-OH. Lab-tested, batch-traceable.\nNet Wt. 250 g (8.8 oz)" },
    ],
  });
  expect("missing warning HOLD", r.verdict === "HOLD", r.verdict);
  expect("missing warning code", r.findings.some((f) => f.code === "REQ-01"));
}

// 7. wrong dieline → HOLD
{
  const r = checkProof(spec, GTIN, { ...clean, dieline: "SR-POUCH-250 v4" });
  expect("wrong dieline HOLD", r.verdict === "HOLD", r.verdict);
  expect("wrong dieline code", r.findings.some((f) => f.code === "DIE-01"));
}

// 8. trim size off → HOLD
{
  const r = checkProof(spec, GTIN, { ...clean, trimW: "3.75" });
  expect("wrong trim HOLD", r.verdict === "HOLD", r.verdict);
  expect("wrong trim code", r.findings.some((f) => f.code === "DIM-01"));
}

// 9. missing spot color → HOLD; extra spot color → warning only
{
  const missing = checkProof(spec, GTIN, { ...clean, spotColors: ["PMS 485 U"] });
  expect("missing spot HOLD", missing.verdict === "HOLD", missing.verdict);
  expect("missing spot code", missing.findings.some((f) => f.code === "COLOR-01"));

  const extra = checkProof(spec, GTIN, { ...clean, spotColors: ["PMS 485 U", "PMS Black 6 U", "PMS 123 C"] });
  expect("extra spot is warning", extra.verdict === "PASS WITH NOTES", extra.verdict);
  expect("extra spot code", extra.findings.some((f) => f.code === "COLOR-02"));
}

// 10. claim missing → warning
{
  const r = checkProof(
    { ...spec, claims: [{ claim: "Third-party lab tested every batch", source: "COA BAK-2026-114" }] },
    GTIN,
    clean,
  );
  expect("missing claim warning", r.verdict === "PASS WITH NOTES", r.verdict);
  expect("missing claim code", r.findings.some((f) => f.code === "CLAIM-01"));
}

// 11. GTIN check digit
expect("valid GTIN passes checksum", gtinCheckDigitValid("8101234567801") === true);
expect("invalid GTIN fails checksum", gtinCheckDigitValid("8101234567803") === false);
expect("GTIN-12 checksum", gtinCheckDigitValid("036000291452") === true);
expect("GTIN-8 checksum", gtinCheckDigitValid("96385074") === true);
expect("short GTIN unverifiable", gtinCheckDigitValid("12345") === null);

// 12. same GTIN as spec but bad check digit → note only
{
  const r = checkProof(spec, "8101234567803", { ...clean, gtin: "8101234567803" });
  expect("bad check digit is note", r.verdict === "PASS WITH NOTES", r.verdict);
  expect("bad check digit code", r.findings.some((f) => f.code === "GTIN-03"));
}

console.log(failures === 0 ? "\nall checker tests passed" : `\n${failures} checker test(s) failed`);
process.exitCode = failures === 0 ? 0 : 1;
