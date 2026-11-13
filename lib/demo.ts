export type Severity = "blocker" | "warning" | "note";
export type Sheet = "front" | "back";

export type Finding = {
  id: string;
  code: string;
  severity: Severity;
  sheet: Sheet;
  title: string;
  expected: string;
  actual: string;
  detail: string;
  confidence: number;
  /** percentage box on the proof sheet */
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Proof = {
  id: string;
  product: string;
  sku: string;
  vendor: string;
  contact: string;
  specVersion: string;
  specLockedBy: string;
  specLockedOn: string;
  proofVersion: string;
  received: string;
  pages: number;
  file: string;
  bytes: string;
  verdict: "HOLD" | "PASS WITH NOTES" | "PASS";
  status: "hold" | "review" | "approved";
  findings: Finding[];
};

export const proofs: Proof[] = [
  {
    id: "bak-md-250",
    product: "Maeng Da — 250 g pouch",
    sku: "BAK-MD-250",
    vendor: "Sunrise Packaging Co.",
    contact: "Kerri",
    specVersion: "v3",
    specLockedBy: "Tom",
    specLockedOn: "2 Oct 2026",
    proofVersion: "v2",
    received: "12 Nov, 4:18 PM",
    pages: 2,
    file: "BAK-MD-250_proof_v2.pdf",
    bytes: "18.4 MB",
    verdict: "HOLD",
    status: "hold",
    findings: [
      {
        id: "f1",
        code: "UPC-01",
        severity: "blocker",
        sheet: "front",
        title: "UPC points at a different product",
        expected: "8 101234 56780 3",
        actual: "8 101234 56789 0",
        detail:
          "Decoded from the front-panel barcode. Master spec v3 says GTIN 8101234567803. The proof encodes …67890. The check digit on the proof is valid, so it scans cleanly — it just rings up the wrong SKU.",
        confidence: 99,
        x: 7,
        y: 85,
        w: 40,
        h: 11,
      },
      {
        id: "f2",
        code: "NETWT-04",
        severity: "blocker",
        sheet: "front",
        title: "Net weight contradicts the spec",
        expected: "NET WT 8.82 oz (250 g)",
        actual: "NET WT 8.4 oz (238 g)",
        detail:
          "Copy block says 250 g. The proof converts that to 238 g. It also breaks the 2025 rounding rule — the ounce figure must read 8.8 oz.",
        confidence: 98,
        x: 7,
        y: 77,
        w: 44,
        h: 7,
      },
      {
        id: "f3",
        code: "WARN-02",
        severity: "blocker",
        sheet: "back",
        title: "Required warning block is missing",
        expected: "“Consult a physician before use…” block, 6 pt minimum",
        actual: "Not present",
        detail:
          "Required on every kratom supplement label per spec v3. The panel has 18 mm of empty space exactly where the block belongs, which suggests it was dropped in a re-flow.",
        confidence: 96,
        x: 8,
        y: 53,
        w: 84,
        h: 20,
      },
      {
        id: "f4",
        code: "CLAIM-07",
        severity: "warning",
        sheet: "front",
        title: "Claim has no substantiation on file",
        expected: "No structure/function claim without an attached study",
        actual: "“CLINICALLY PROVEN”",
        detail:
          "Nothing is attached to this SKU in the Vault. Either attach the study to the spec or pull the claim before the run.",
        confidence: 94,
        x: 28,
        y: 32,
        w: 44,
        h: 6,
      },
      {
        id: "f5",
        code: "DIELINE-01",
        severity: "warning",
        sheet: "front",
        title: "Printer used the old dieline",
        expected: "SR-POUCH-250 v5 (current)",
        actual: "SR-POUCH-250 v4",
        detail:
          "v5 moved the gusset seam 3 mm. Printing on v4 will misregister against the fill line — this is the kind of “helpful fix” that shows up 5,000 units later.",
        confidence: 91,
        x: 85,
        y: 5,
        w: 10,
        h: 42,
      },
      {
        id: "f6",
        code: "COLOR-03",
        severity: "warning",
        sheet: "front",
        title: "Spot color name swapped",
        expected: "PANTONE 485 U",
        actual: "PANTONE 485 C",
        detail:
          "Name match only — color cannot be judged from a PDF. But C-to-U is a coated/uncoated swap, and this stock is uncoated kraft, so it will print muddy.",
        confidence: 88,
        x: 64,
        y: 78,
        w: 29,
        h: 13,
      },
      {
        id: "f7",
        code: "LOGO-02",
        severity: "note",
        sheet: "front",
        title: "Old logo lockup",
        expected: "2025 lockup",
        actual: "2023 lockup",
        detail:
          "Tagline and kerning differ. Low risk on this run; fix before the next reprint so the line stays consistent.",
        confidence: 84,
        x: 26,
        y: 6,
        w: 48,
        h: 12,
      },
      {
        id: "f8",
        code: "IMG-05",
        severity: "note",
        sheet: "back",
        title: "Illustration under resolution",
        expected: "≥ 300 ppi at final size",
        actual: "214 ppi",
        detail: "The leaf illustration will soften in print. Not a blocker.",
        confidence: 79,
        x: 61,
        y: 37,
        w: 29,
        h: 13,
      },
    ],
  },
  {
    id: "hge-16-cit",
    product: "Hella Good Energy — 16 oz can",
    sku: "HGE-16-CIT",
    vendor: "Pacific Can Works",
    contact: "Marisol",
    specVersion: "v7",
    specLockedBy: "Tom",
    specLockedOn: "28 Oct 2026",
    proofVersion: "v1",
    received: "13 Nov, 9:02 AM",
    pages: 3,
    file: "HGE-16-CIT_proof_v1.pdf",
    bytes: "22.1 MB",
    verdict: "PASS WITH NOTES",
    status: "review",
    findings: [
      {
        id: "g1",
        code: "UPC-01",
        severity: "note",
        sheet: "front",
        title: "UPC verified",
        expected: "8 101234 56781 0",
        actual: "8 101234 56781 0",
        detail: "Matches the master. Check digit valid.",
        confidence: 99,
        x: 7,
        y: 85,
        w: 40,
        h: 11,
      },
      {
        id: "g2",
        code: "COLOR-03",
        severity: "warning",
        sheet: "front",
        title: "Accent runs 8% dark",
        expected: "PANTONE 185 C",
        actual: "PANTONE 185 C (vendor profile +8% K)",
        detail:
          "Vendor's colour-managed proof profile adds black. Ask them to re-output with the profile off before signing.",
        confidence: 72,
        x: 64,
        y: 78,
        w: 29,
        h: 13,
      },
      {
        id: "g3",
        code: "COPY-12",
        severity: "note",
        sheet: "back",
        title: "Copy matches",
        expected: "Approved copy block v7",
        actual: "0 character differences",
        detail: "Whitespace normalized. No changes since the last approved run.",
        confidence: 99,
        x: 8,
        y: 10,
        w: 84,
        h: 28,
      },
    ],
  },
];

export function proofById(id: string) {
  return proofs.find((p) => p.id === id);
}

export function counts(proof: Proof) {
  const b = proof.findings.filter((f) => f.severity === "blocker").length;
  const w = proof.findings.filter((f) => f.severity === "warning").length;
  const n = proof.findings.filter((f) => f.severity === "note").length;
  return { b, w, n };
}

export const emailDraft = {
  to: "kerri@sunrisepackaging.com",
  subject: "BAK-MD-250 proof v2 — 3 fixes before we can approve",
  body: `Hi Kerri,

Thanks for turning v2 around. We ran it against the locked spec (v3) and found three things that need to change before we can sign off:

1. UPC — the front panel encodes 8101234567890. The spec calls for 8101234567803. The check digit is valid, so it will scan, but it rings up the wrong item.

2. Net weight — the front reads "NET WT 8.4 oz (238 g)". It should be "NET WT 8.8 oz (250 g)".

3. Warning block — the required "Consult a physician before use…" block is missing from the back panel. There's about 18 mm of open space where it used to sit, so it looks like it was dropped in the reflow.

Two smaller ones while you're in the file: the proof is still on dieline v4 (we're on v5, the gusset seam moved 3 mm), and the spot is named 485 C instead of 485 U — this stock is uncoated.

Annotated PDF attached. If you can turn these by Monday we keep the 24 Nov in-hands date.

— Tom`,
};

export type Doc = {
  id: string;
  title: string;
  kind: string;
  linked: string;
  version: string;
  uploaded: string;
  expires?: string;
  restricted?: boolean;
  status: "current" | "superseded" | "expiring";
};

export const docs: Doc[] = [
  {
    id: "d1",
    title: "Maeng Da 250 g — packaging spec",
    kind: "Spec",
    linked: "BAK-MD-250",
    version: "v3",
    uploaded: "2 Oct 2026",
    status: "current",
  },
  {
    id: "d2",
    title: "Sunrise Packaging — supply agreement",
    kind: "Contract",
    linked: "Sunrise Packaging Co.",
    version: "signed",
    uploaded: "14 Jan 2026",
    expires: "14 Jan 2027",
    status: "current",
  },
  {
    id: "d3",
    title: "Certificate of insurance — Sunrise Packaging",
    kind: "COI",
    linked: "Sunrise Packaging Co.",
    version: "2026",
    uploaded: "3 Dec 2025",
    expires: "2 Dec 2026",
    status: "expiring",
  },
  {
    id: "d4",
    title: "Organic certificate — Maeng Da",
    kind: "Certificate",
    linked: "BAK-MD-250",
    version: "2026",
    uploaded: "19 Mar 2026",
    expires: "31 Mar 2027",
    status: "current",
  },
  {
    id: "d5",
    title: "COA — lot MD-2611-A",
    kind: "Lab result",
    linked: "BAK-MD-250",
    version: "lot",
    uploaded: "8 Nov 2026",
    status: "current",
  },
  {
    id: "d6",
    title: "GS1 company prefix certificate",
    kind: "Registry",
    linked: "All SKUs",
    version: "current",
    uploaded: "2 Feb 2026",
    status: "current",
  },
  {
    id: "d7",
    title: "Articles of organization",
    kind: "Formation",
    linked: "Monarch",
    version: "filed",
    uploaded: "11 Jun 2024",
    restricted: true,
    status: "current",
  },
  {
    id: "d8",
    title: "EIN confirmation letter",
    kind: "Tax",
    linked: "Monarch",
    version: "original",
    uploaded: "11 Jun 2024",
    restricted: true,
    status: "current",
  },
  {
    id: "d9",
    title: "Hella Good Energy — dieline",
    kind: "Dieline",
    linked: "HGE-16-CIT",
    version: "v5",
    uploaded: "28 Oct 2026",
    status: "current",
  },
  {
    id: "d10",
    title: "Pacific Can Works — terms",
    kind: "Contract",
    linked: "Pacific Can Works",
    version: "signed",
    uploaded: "9 Sep 2026",
    status: "current",
  },
  {
    id: "d11",
    title: "Maeng Da 250 g — packaging spec",
    kind: "Spec",
    linked: "BAK-MD-250",
    version: "v2",
    uploaded: "17 Jul 2026",
    status: "superseded",
  },
  {
    id: "d12",
    title: "Product liability policy",
    kind: "Insurance",
    linked: "Monarch",
    version: "2026–27",
    uploaded: "1 Aug 2026",
    expires: "1 Aug 2027",
    status: "current",
  },
];

export type Thread = {
  id: string;
  from: string;
  org: string;
  subject: string;
  kind: "Vendor" | "Customer" | "Legal" | "Opportunity";
  age: string;
  summary: string;
  ask: string;
  state: "Needs reply" | "Draft ready" | "Waiting" | "Filed";
};

export const threads: Thread[] = [
  {
    id: "t1",
    from: "Kerri Alvarez",
    org: "Sunrise Packaging",
    subject: "RE: BAK-MD-250 proof v2",
    kind: "Vendor",
    age: "2h",
    summary:
      "Proof v2 attached. Kerri says the fill line is booked for the 18th and asks for approval by Monday to hold the 24 Nov in-hands date. She also mentions the dieline “should be the same one”.",
    ask: "Approve proof, or send corrections.",
    state: "Draft ready",
  },
  {
    id: "t2",
    from: "Dana Whitfield",
    org: "customer",
    subject: "Order #44192 — wrong flavour",
    kind: "Customer",
    age: "5h",
    summary:
      "Received Citrus instead of Cherry. Third message in the thread. Wants a replacement before Friday; already opened one of the cans.",
    ask: "Replacement + return label. Policy covers opened product on mis-ships.",
    state: "Needs reply",
  },
  {
    id: "t3",
    from: "Marisol Vega",
    org: "Pacific Can Works",
    subject: "Can proof v1 + colour profile note",
    kind: "Vendor",
    age: "1d",
    summary:
      "Proof v1 for the 16 oz run. Marisol flags that their output profile adds 8% black to the accent and offers to re-output.",
    ask: "Decide whether to accept the shift or ask for a re-output.",
    state: "Needs reply",
  },
  {
    id: "t4",
    from: "Priya Raman",
    org: "Raman & Co.",
    subject: "Trademark office action — 90-day response",
    kind: "Legal",
    age: "2d",
    summary:
      "USPTO issued an office action on the Hella Good word mark. Response due in 84 days. Priya needs the specimen of use and our first-sale date.",
    ask: "Send specimen + first-sale date.",
    state: "Waiting",
  },
  {
    id: "t5",
    from: "Marcus Bell",
    org: "Desert Gas #12",
    subject: "Reorder — 6 cases",
    kind: "Opportunity",
    age: "2d",
    summary:
      "Wants 6 cases of the 250 g and asked whether the new 500 g pouch is available. Last order was 22 days ago.",
    ask: "Confirm stock and quote the 500 g.",
    state: "Draft ready",
  },
  {
    id: "t6",
    from: "Billing",
    org: "Shopify",
    subject: "Payout hold — verification needed",
    kind: "Legal",
    age: "3d",
    summary:
      "Payouts paused pending business verification. $14,280 held. Two documents requested: EIN letter and a utility bill.",
    ask: "Upload EIN letter from the Vault and a utility bill.",
    state: "Waiting",
  },
];

export const sites = [
  { name: "hellagoodenergy.com", revenue: 71240, delta: 18.2, orders: 1284, conv: 3.9, note: "Best week since launch" },
  { name: "bornagainkratom.com", revenue: 58910, delta: -9.1, orders: 902, conv: 2.6, note: "Refunds up 4.1% · 1 SKU out of stock" },
  { name: "rawcoffeepowder.com", revenue: 31660, delta: 4.4, orders: 611, conv: 3.1, note: "Steady" },
  { name: "wgcpaddy.com", revenue: 22510, delta: -1.8, orders: 388, conv: 2.9, note: "Ad spend flat, traffic down 6%" },
];

export const revenueSeries = [
  18, 22, 19, 26, 24, 31, 29, 34, 38, 33, 41, 44, 39, 47, 52, 49, 56, 58, 54, 61,
];

export const tasks = [
  {
    id: "k1",
    title: "Approve or reject BAK-MD-250 proof v2",
    due: "Today",
    owner: "Tom",
    source: "PackCheck",
    detail: "3 blockers. Printer needs an answer by Monday to hold the 24 Nov date.",
  },
  {
    id: "k2",
    title: "Certificate of insurance — Sunrise Packaging expires in 19 days",
    due: "24 Nov",
    owner: "Dante",
    source: "Vault",
    detail: "Request the 2026–27 certificate. Contract requires 30 days' notice of lapse.",
  },
  {
    id: "k3",
    title: "File the 2026 spec v3 supersede note",
    due: "This week",
    owner: "Tom",
    source: "Vault",
    detail: "v3 replaced v2 on 2 Oct. Note why, so the next person doesn't guess.",
  },
  {
    id: "k4",
    title: "USPTO office action — response window closes 5 Feb",
    due: "5 Feb 2027",
    owner: "Nav",
    source: "Inbox",
    detail: "84 days left. Priya needs the specimen of use and first-sale date.",
  },
  {
    id: "k5",
    title: "Reorder radar — Desert Gas #12 at 22 days",
    due: "Today",
    owner: "Dante",
    source: "Pulse",
    detail: "Usual gap is 14 days. 6 cases requested; confirm 500 g availability.",
  },
];

export type Task = (typeof tasks)[number];

export const decisions = [
  {
    id: "b1",
    when: "2 Oct 2026",
    who: "Tom",
    text: "Locked packaging spec v3 for BAK-MD-250. Net weight fixed at 250 g / 8.8 oz, warning block required at 6 pt, dieline SR-POUCH-250 v5.",
    tags: ["spec", "BAK-MD-250"],
  },
  {
    id: "b2",
    when: "18 Sep 2026",
    who: "Nav",
    text: "Sunrise Packaging stays primary for pouches. Pacific Can Works only for cans — Sunrise's error rate on labels was the deciding factor.",
    tags: ["vendor", "Sunrise"],
  },
  {
    id: "b3",
    when: "4 Sep 2026",
    who: "Dante",
    text: "Moved all new artwork to the 2025 logo lockup. Old files are not to be reused, even for reprints.",
    tags: ["brand"],
  },
  {
    id: "b4",
    when: "22 Aug 2026",
    who: "Tom",
    text: "No structure/function claims on kratom packaging without a substantiation file in the Vault. Applies to reprints too.",
    tags: ["claims", "policy"],
  },
];

export const brief = {
  headline:
    "Revenue is up 11.2% on the month, but the Maeng Da reprint is held and Born Again is carrying a refund spike.",
  paragraph:
    "Hella Good is doing the work — best week since launch, 18% up. Born Again is down 9% and the drop is refunds, not traffic: 4.1% refund rate against a 1.2% baseline, clustered on the 250 g pouch. The printer's proof for that same pouch came back with three blockers, including a UPC that scans to the wrong product. One store has gone quiet and an insurance certificate lapses in 19 days.",
  things: [
    {
      n: "01",
      title: "Proof v2 is holding the 24 Nov run",
      body: "Three blockers: wrong UPC, wrong net weight, missing warning block. Kerri needs an answer by Monday. Reply is drafted.",
      href: "/packcheck/bak-md-250",
      cta: "Open PackCheck",
      tone: "alert" as const,
    },
    {
      n: "02",
      title: "Born Again refunds are 3.4× baseline",
      body: "Concentrated on the 250 g pouch, same SKU as the held reprint. Worth reading the last 20 refund notes before the next run.",
      href: "/pulse",
      cta: "Open Pulse",
      tone: "warn" as const,
    },
    {
      n: "03",
      title: "Desert Gas #12 is 22 days quiet",
      body: "Usual gap is 14. They asked for 6 cases two days ago and nobody answered. Draft is ready.",
      href: "/inbox",
      cta: "Open Inbox",
      tone: "info" as const,
    },
  ],
  metrics: [
    { label: "Gross margin", value: "51.9%", delta: "+0.8 pts", good: true },
    { label: "Cash", value: "$218,740", delta: "96 days runway", good: true },
    { label: "Refund rate", value: "1.35%", delta: "1.2% baseline", good: false },
    { label: "Open POs", value: "7", delta: "$41,900 committed", good: true },
  ],
  queue: [
    { label: "Proofs waiting", value: "2", href: "/packcheck" },
    { label: "Docs to file", value: "3", href: "/vault" },
    { label: "Threads needing you", value: "4", href: "/inbox" },
    { label: "Obligations due", value: "3", href: "/runbook" },
  ],
};
