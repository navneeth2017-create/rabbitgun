import type { SpecPayload } from "@/lib/specs";

/**
 * The gate's brain: deterministic proof-vs-spec grading. No model, no
 * network — every finding is reproducible from the locked spec and the
 * values read off the printer's proof. (OCR/barcode decoding of PDFs is a
 * later slice; this grades what a human reads off the proof.)
 */

export type Severity = "blocker" | "warning" | "note";
export type Verdict = "PASS" | "PASS WITH NOTES" | "HOLD";

export type PanelInput = { panel: string; text: string };

export type ProofInput = {
  vendor: string;
  contact?: string;
  proofVersion: number;
  fileName?: string;
  gtin?: string;
  trimW?: string;
  trimH?: string;
  dieline?: string;
  spotColors: string[];
  panels: PanelInput[];
};

export type CheckFinding = {
  code: string;
  severity: Severity;
  sheet: string | null;
  title: string;
  expected: string;
  actual: string;
  detail: string;
  /** 0–100, deterministic checks are 100 */
  confidence: number;
};

export type CheckResult = {
  findings: CheckFinding[];
  verdict: Verdict;
  engine: string;
  blockers: number;
  warnings: number;
  notes: number;
};

export const ENGINE = "rabbitgun-checker-1.0";

/** Typographic quotes/dashes and whitespace should never block a proof. */
const norm = (s: string) =>
  s
    .normalize("NFKC")
    .replace(/[\u2018\u2019\u201A\u201B\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F\u2033]/g, '"')
    .replace(/[\u2013\u2014\u2212]/g, "-")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

/** Words only, keeping decimals like 8.8 — punctuation is not copy. */
const words = (s: string) => norm(s).match(/[a-z0-9]+(?:\.[0-9]+)?/g) ?? [];

const digits = (s: string | undefined) => (s ?? "").replace(/\D/g, "");

const colorKey = (s: string) => norm(s).replace(/[^a-z0-9]/g, "");

const num = (s: string | undefined) => {
  const n = Number.parseFloat((s ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

/** GS1 check digit for GTIN-8/12/13/14. Returns null when the length is off. */
export function gtinCheckDigitValid(raw: string): boolean | null {
  const d = digits(raw);
  if (![8, 12, 13, 14].includes(d.length)) return null;
  const nums = d.split("").map(Number);
  const check = nums.pop() as number;
  let sum = 0;
  for (let i = 0; i < nums.length; i++) {
    sum += nums[nums.length - 1 - i] * (i % 2 === 0 ? 3 : 1);
  }
  return (10 - (sum % 10)) % 10 === check;
}

/** How much of `required` appears, word for word, in `copy`. */
function coverage(required: string, copy: string): number {
  const req = words(required);
  if (req.length === 0) return 1;
  const have = new Set(words(copy));
  let hit = 0;
  for (const w of req) if (have.has(w)) hit++;
  return hit / req.length;
}

/** True when every word of `needle` appears in `hay` in the same order. */
function isSubsequence(needle: string[], hay: string[]): boolean {
  if (needle.length === 0) return true;
  let i = 0;
  for (const w of hay) {
    if (w === needle[i]) i++;
    if (i === needle.length) return true;
  }
  return false;
}

function wordDiff(expected: string, actual: string) {
  const e = words(expected);
  const a = words(actual);
  const left = new Map<string, number>();
  for (const w of a) left.set(w, (left.get(w) ?? 0) + 1);
  const removed: string[] = [];
  for (const w of e) {
    const n = left.get(w) ?? 0;
    if (n > 0) left.set(w, n - 1);
    else removed.push(w);
  }
  const right = new Map<string, number>();
  for (const w of e) right.set(w, (right.get(w) ?? 0) + 1);
  const added: string[] = [];
  for (const w of a) {
    const n = right.get(w) ?? 0;
    if (n > 0) right.set(w, n - 1);
    else added.push(w);
  }
  return { removed, added, sameOrder: e.join(" ") === a.join(" ") };
}

const short = (list: string[], max = 12) => {
  if (list.length === 0) return "—";
  const shown = list.slice(0, max).join(", ");
  return list.length > max ? `${shown} … (+${list.length - max} more)` : shown;
};

export function checkProof(
  spec: SpecPayload,
  skuGtin: string | null,
  input: ProofInput,
): CheckResult {
  const findings: CheckFinding[] = [];
  const panelText = (panel: string) =>
    input.panels.find((p) => p.panel.toLowerCase() === panel.toLowerCase())?.text ?? "";

  // ---- copy blocks: the approved copy must appear on the panel -------------
  // Extra copy is normal (warnings, ingredients, printer marks). What matters
  // is that every approved word is present and in order.
  for (const block of spec.blocks) {
    if (!block.text.trim()) continue;
    const actual = panelText(block.panel);
    if (!actual.trim()) {
      findings.push({
        code: "COPY-00",
        severity: "blocker",
        sheet: block.panel,
        title: `No copy provided for the ${block.panel} panel`,
        expected: block.text,
        actual: "nothing submitted",
        detail: `The locked spec has approved copy for the ${block.panel} panel and the proof submission has none. A missing panel cannot be checked.`,
        confidence: 100,
      });
      continue;
    }
    const expectedWords = words(block.text);
    const actualWords = words(actual);
    const inOrder = isSubsequence(expectedWords, actualWords);
    if (inOrder) continue;

    const present = coverage(block.text, actual);
    if (present >= 1) {
      findings.push({
        code: "COPY-02",
        severity: "warning",
        sheet: block.panel,
        title: `Approved copy is reordered on the ${block.panel} panel`,
        expected: block.text,
        actual,
        detail:
          "Every approved word is present, but not in the approved order. Confirm the panel was not reflowed or reassembled before approving.",
        confidence: 90,
      });
    } else {
      const diff = wordDiff(block.text, actual);
      findings.push({
        code: "COPY-01",
        severity: "blocker",
        sheet: block.panel,
        title: `Approved copy missing from the ${block.panel} panel`,
        expected: block.text,
        actual,
        detail: `The locked spec is the approved wording. Missing from the proof: ${short(diff.removed)}.`,
        confidence: 100,
      });
    }
  }

  // ---- required text: the compliance lines that must be present ------------
  for (const line of spec.requiredText) {
    if (!line.trim()) continue;
    let best = 0;
    let bestPanel: string | null = null;
    for (const p of input.panels) {
      const c = coverage(line, p.text);
      if (c > best) {
        best = c;
        bestPanel = p.panel;
      }
    }
    if (best >= 1) continue;
    if (best >= 0.8) {
      findings.push({
        code: "REQ-02",
        severity: "warning",
        sheet: bestPanel,
        title: "Required text wording differs",
        expected: line,
        actual: bestPanel ? panelText(bestPanel) : "not found",
        detail: `Most of the required line is present on the ${bestPanel ?? "submitted"} panel, but not word-for-word. Confirm the exact required wording before print.`,
        confidence: 90,
      });
    } else {
      findings.push({
        code: "REQ-01",
        severity: "blocker",
        sheet: bestPanel,
        title: "Required text missing",
        expected: line,
        actual: "not found on any submitted panel",
        detail: "This line is required by the locked spec and does not appear on the proof. It must be present exactly before the run is approved.",
        confidence: 100,
      });
    }
  }

  // ---- claims: approved statements, with their sources ---------------------
  for (const claim of spec.claims) {
    if (!claim.claim.trim()) continue;
    let found = false;
    for (const p of input.panels) {
      if (coverage(claim.claim, p.text) >= 1) {
        found = true;
        break;
      }
    }
    if (!found) {
      findings.push({
        code: "CLAIM-01",
        severity: "warning",
        sheet: null,
        title: "Approved claim not found on the proof",
        expected: claim.claim,
        actual: "not found on any submitted panel",
        detail: `The spec carries this claim (source: ${claim.source || "not recorded"}). If it belongs on the pack, it is missing; if it was intentionally dropped, supersede the spec so the truth stays in one place.`,
        confidence: 100,
      });
    }
  }

  // ---- barcode -------------------------------------------------------------
  const specGtin = digits(skuGtin ?? "");
  const proofGtin = digits(input.gtin);
  if (specGtin) {
    if (!proofGtin) {
      findings.push({
        code: "GTIN-01",
        severity: "blocker",
        sheet: "front",
        title: "No barcode value provided",
        expected: specGtin,
        actual: "nothing submitted",
        detail: "The proof's barcode was not read into the check. The barcode is the one thing that must never be guessed.",
        confidence: 100,
      });
    } else if (proofGtin !== specGtin) {
      findings.push({
        code: "GTIN-02",
        severity: "blocker",
        sheet: "front",
        title: "Barcode points at a different product",
        expected: specGtin,
        actual: proofGtin,
        detail:
          "The digits read off the proof do not match the GTIN on the locked spec. Even a valid check digit rings up the wrong SKU if the body of the number differs.",
        confidence: 100,
      });
    } else {
      const valid = gtinCheckDigitValid(proofGtin);
      if (valid === false) {
        findings.push({
          code: "GTIN-03",
          severity: "note",
          sheet: "front",
          title: "GTIN fails the GS1 check digit",
          expected: `a valid check digit for ${specGtin}`,
          actual: proofGtin,
          detail:
            "The barcode matches the spec, but the number itself does not pass the GS1 check-digit test. If this GTIN is real, fix it in the spec before the next run.",
          confidence: 100,
        });
      }
    }
  }

  // ---- dimensions ----------------------------------------------------------
  const dims: [string, keyof typeof spec.dims, string | undefined][] = [
    ["width", "trimW", input.trimW],
    ["height", "trimH", input.trimH],
  ];
  for (const [label, key, actualRaw] of dims) {
    const expected = num(spec.dims[key]);
    if (expected === null) continue;
    const actual = num(actualRaw);
    if (actual === null) {
      findings.push({
        code: "DIM-02",
        severity: "warning",
        sheet: null,
        title: `Trim ${label} not provided`,
        expected: `${expected} in`,
        actual: "nothing submitted",
        detail: `The spec fixes the trim ${label}. Without it the proof cannot be checked against the dieline.`,
        confidence: 100,
      });
      continue;
    }
    if (Math.abs(actual - expected) > 0.02) {
      findings.push({
        code: "DIM-01",
        severity: "blocker",
        sheet: null,
        title: `Trim ${label} differs from the spec`,
        expected: `${expected} in`,
        actual: `${actual} in`,
        detail: `A trim ${label} change moves every panel and can break the dieline. Tolerance is 0.02 in; this is outside it.`,
        confidence: 100,
      });
    }
  }

  // ---- dieline -------------------------------------------------------------
  if (spec.dims.dieline?.trim()) {
    const actual = (input.dieline ?? "").trim();
    if (!actual) {
      findings.push({
        code: "DIE-02",
        severity: "warning",
        sheet: null,
        title: "Dieline not provided",
        expected: spec.dims.dieline,
        actual: "nothing submitted",
        detail: "The spec names the dieline. Confirm the proof is built on that exact dieline before approving the run.",
        confidence: 100,
      });
    } else if (norm(actual) !== norm(spec.dims.dieline)) {
      findings.push({
        code: "DIE-01",
        severity: "blocker",
        sheet: null,
        title: "Wrong dieline",
        expected: spec.dims.dieline,
        actual,
        detail: "The proof is built on a different dieline than the locked spec. Everything downstream — panels, folds, fill — is suspect.",
        confidence: 100,
      });
    }
  }

  // ---- spot colors ---------------------------------------------------------
  const specColors = spec.spotColors.filter((c) => c.trim());
  const proofColors = input.spotColors.filter((c) => c.trim());
  if (specColors.length > 0) {
    if (proofColors.length === 0) {
      findings.push({
        code: "COLOR-03",
        severity: "warning",
        sheet: null,
        title: "No spot colors provided",
        expected: specColors.join(", "),
        actual: "nothing submitted",
        detail: "The spec fixes spot colors. Without them the color build cannot be verified — confirm before approving.",
        confidence: 100,
      });
    } else {
      const proofKeys = new Set(proofColors.map(colorKey));
      for (const color of specColors) {
        if (!proofKeys.has(colorKey(color))) {
          findings.push({
            code: "COLOR-01",
            severity: "blocker",
            sheet: null,
            title: "Spot color missing",
            expected: color,
            actual: proofColors.join(", "),
            detail: "A spot color fixed by the locked spec is not on the proof. Dropping it changes the printed color and the plate count.",
            confidence: 100,
          });
        }
      }
      const specKeys = new Set(specColors.map(colorKey));
      for (const color of proofColors) {
        if (!specKeys.has(colorKey(color))) {
          findings.push({
            code: "COLOR-02",
            severity: "warning",
            sheet: null,
            title: "Spot color not in the spec",
            expected: specColors.join(", "),
            actual: color,
            detail: "The proof carries a spot color the spec does not. Extra plates cost money and drift from the approved look.",
            confidence: 100,
          });
        }
      }
    }
  }

  // ---- verdict -------------------------------------------------------------
  const rank: Record<Severity, number> = { blocker: 0, warning: 1, note: 2 };
  findings.sort((a, b) => rank[a.severity] - rank[b.severity]);

  const blockers = findings.filter((f) => f.severity === "blocker").length;
  const warnings = findings.filter((f) => f.severity === "warning").length;
  const notes = findings.filter((f) => f.severity === "note").length;

  return {
    findings,
    verdict: blockers > 0 ? "HOLD" : warnings > 0 || notes > 0 ? "PASS WITH NOTES" : "PASS",
    engine: ENGINE,
    blockers,
    warnings,
    notes,
  };
}
