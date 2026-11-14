export type EntityKind = "DTC" | "DSD" | "Services" | "Product" | "Wholesale";

export type Entity = {
  id: string;
  name: string;
  kind: EntityKind;
  domain: string;
  /** One line pulled from the live site — the public proof, not the P&L. */
  publicNote: string;
  revenue: number;
  delta: number;
  orders: number;
  aov: number;
  cogs: number;
  fees: number;
  shipping: number;
  ads: number;
  refunds: number;
  net: number;
  cash: number;
  shipToday: number;
  exceptions: number;
};

export const entities: Entity[] = [
  {
    id: "addy",
    name: "Addy DSD",
    kind: "DSD",
    domain: "addydsd.com",
    publicNote: "Store portal · ordering, routing + the profit tab",
    revenue: 96480,
    delta: 6.2,
    orders: 318,
    aov: 303.4,
    cogs: 66570,
    fees: 0,
    shipping: 4120,
    ads: 0,
    refunds: 620,
    net: 25170,
    cash: 61240,
    shipToday: 96,
    exceptions: 3,
  },
  {
    id: "hellagood",
    name: "Hella Good Energy",
    kind: "DTC",
    domain: "hellagoodenergy.com",
    publicNote: "3 flavors · $5.99/pack · 125 mg RCF caffeine",
    revenue: 71240,
    delta: 18.2,
    orders: 1284,
    aov: 55.48,
    cogs: 28140,
    fees: 2420,
    shipping: 6420,
    ads: 9800,
    refunds: 780,
    net: 23680,
    cash: 38410,
    shipToday: 62,
    exceptions: 2,
  },
  {
    id: "bornagain",
    name: "Born Again Kratom",
    kind: "DTC",
    domain: "bornagainkratom.com",
    publicNote: "Whole leaf · no extracts · no 7-OH",
    revenue: 58910,
    delta: -9.1,
    orders: 902,
    aov: 65.31,
    cogs: 25330,
    fees: 2010,
    shipping: 5180,
    ads: 7400,
    refunds: 2415,
    net: 16575,
    cash: 29880,
    shipToday: 44,
    exceptions: 4,
  },
  {
    id: "monarch",
    name: "Monarch Technologies",
    kind: "Services",
    domain: "monarchtechusa.com",
    publicNote: "CRM, private AI + custom systems for operators",
    revenue: 42000,
    delta: 9.8,
    orders: 26,
    aov: 1615.38,
    cogs: 12600,
    fees: 480,
    shipping: 0,
    ads: 2100,
    refunds: 0,
    net: 26820,
    cash: 44100,
    shipToday: 0,
    exceptions: 0,
  },
  {
    id: "rawcoffee",
    name: "Raw Coffee Fiber",
    kind: "DTC",
    domain: "rawcoffeefiber.com",
    publicNote: "RCF caffeine · gradual release over 7 hours",
    revenue: 31660,
    delta: 4.4,
    orders: 611,
    aov: 51.82,
    cogs: 13940,
    fees: 1080,
    shipping: 2910,
    ads: 3200,
    refunds: 410,
    net: 10120,
    cash: 19760,
    shipToday: 31,
    exceptions: 1,
  },
  {
    id: "wgc",
    name: "WGC Paddy",
    kind: "DTC",
    domain: "wgcpaddy.com",
    publicNote: "Focus supplement · no prescription",
    revenue: 22510,
    delta: -1.8,
    orders: 388,
    aov: 58.02,
    cogs: 9880,
    fees: 760,
    shipping: 2240,
    ads: 2900,
    refunds: 180,
    net: 6550,
    cash: 14200,
    shipToday: 19,
    exceptions: 1,
  },
  {
    id: "wowcow",
    name: "WowCow Distributors",
    kind: "Wholesale",
    domain: "wowcowdistributors.com",
    publicNote: "2× keystone · 90-day money-back · 24h approval",
    revenue: 4200,
    delta: 22.0,
    orders: 84,
    aov: 50.0,
    cogs: 900,
    fees: 120,
    shipping: 0,
    ads: 0,
    refunds: 0,
    net: 3180,
    cash: 11150,
    shipToday: 0,
    exceptions: 0,
  },
];

export const portfolio = entities.reduce(
  (a, e) => ({
    revenue: a.revenue + e.revenue,
    cogs: a.cogs + e.cogs,
    fees: a.fees + e.fees,
    shipping: a.shipping + e.shipping,
    ads: a.ads + e.ads,
    refunds: a.refunds + e.refunds,
    net: a.net + e.net,
    cash: a.cash + e.cash,
    orders: a.orders + e.orders,
    shipToday: a.shipToday + e.shipToday,
    exceptions: a.exceptions + e.exceptions,
  }),
  {
    revenue: 0,
    cogs: 0,
    fees: 0,
    shipping: 0,
    ads: 0,
    refunds: 0,
    net: 0,
    cash: 0,
    orders: 0,
    shipToday: 0,
    exceptions: 0,
  },
);

export const entityById = (id: string | undefined) =>
  id ? entities.find((e) => e.id === id) : undefined;

/** Where money leaves the business without an obvious invoice. */
export type Leak = {
  id: string;
  entity: string;
  title: string;
  detail: string;
  monthly: number;
  severity: "blocker" | "warning" | "note";
  owner: string;
  action: string;
};

export const leaks: Leak[] = [
  {
    id: "l1",
    entity: "Born Again Kratom",
    title: "Refund rate is 3.4× baseline",
    detail:
      "4.1% against a 1.2% baseline, 71% of them on the 250 g pouch — the same SKU whose reprint is on hold. Refund notes repeat “seal failed”.",
    monthly: 1725,
    severity: "blocker",
    owner: "Dante",
    action: "Read the last 20 refund notes before approving the run",
  },
  {
    id: "l2",
    entity: "All DTC",
    title: "214 orders billed above actual weight",
    detail:
      "Carrier invoices show DIM-weight reclass on boxes under 12 in. Repacking into the 10×8×6 shipper removes the reclass.",
    monthly: 1180,
    severity: "warning",
    owner: "Dante",
    action: "Switch 250 g + 16 oz to the 10×8×6 shipper",
  },
  {
    id: "l3",
    entity: "Raw Coffee Fiber",
    title: "Ad spend below the 2.0 ROAS floor",
    detail:
      "Blended ROAS 1.4 for 9 days. $3,200 spent, $4,480 returned. Pause the two worst ad sets and hold spend until the landing page test lands.",
    monthly: 1600,
    severity: "warning",
    owner: "Nav",
    action: "Pause ad sets A and C",
  },
  {
    id: "l4",
    entity: "WowCow Distributors",
    title: "Processing rate never renegotiated",
    detail:
      "Still on 2.9% + 30¢ from launch. Volume now qualifies for 2.4%. Difference on the current run rate is $210/month.",
    monthly: 210,
    severity: "note",
    owner: "Nav",
    action: "Ask the processor for the volume tier",
  },
  {
    id: "l5",
    entity: "Monarch",
    title: "Three subscriptions with no owner",
    detail:
      "Loom, a design tool, and a monitoring plan billed monthly and unused for 60+ days. $186/month.",
    monthly: 186,
    severity: "note",
    owner: "Tom",
    action: "Cancel or assign an owner",
  },
  {
    id: "l6",
    entity: "Hella Good Energy",
    title: "3 chargebacks, all winnable",
    detail:
      "$420 disputed, all with delivery confirmation on file. Two expire this week if evidence isn't submitted.",
    monthly: 420,
    severity: "warning",
    owner: "Dante",
    action: "Submit the three evidence packets",
  },
];

export const leakTotal = leaks.reduce((a, l) => a + l.monthly, 0);

export type FreightException = {
  id: string;
  order: string;
  entity: string;
  issue: string;
  age: string;
  severity: "blocker" | "warning" | "note";
  action: string;
};

export const freightExceptions: FreightException[] = [
  {
    id: "x1",
    order: "#44192",
    entity: "Hella Good",
    issue: "Address invalid — suite number missing",
    age: "5h",
    severity: "blocker",
    action: "Email the customer, hold the label",
  },
  {
    id: "x2",
    order: "#44188",
    entity: "Born Again",
    issue: "Label printed 3 days ago, never scanned",
    age: "3d",
    severity: "blocker",
    action: "Reprint and void the original",
  },
  {
    id: "x3",
    order: "#44171",
    entity: "Raw Coffee",
    issue: "DIM reclass — billed 14 lb, actual 6 lb",
    age: "1d",
    severity: "warning",
    action: "Dispute with the carrier",
  },
  {
    id: "x4",
    order: "#44166",
    entity: "WGC Paddy",
    issue: "Out of stock after label printed",
    age: "1d",
    severity: "warning",
    action: "Refund shipping, offer split shipment",
  },
  {
    id: "x5",
    order: "PO-2291",
    entity: "Born Again",
    issue: "Inbound packaging late — affects 24 Nov run",
    age: "2d",
    severity: "blocker",
    action: "Chase Sunrise, hold the fill slot",
  },
  {
    id: "x6",
    order: "#44155",
    entity: "Hella Good",
    issue: "Delivered 2 days late, customer asked twice",
    age: "4d",
    severity: "note",
    action: "Service recovery credit",
  },
];

export const carrierMix = [
  { name: "USPS", share: 61, cost: 3.94, onTime: 96.2 },
  { name: "UPS", share: 24, cost: 8.76, onTime: 98.1 },
  { name: "FedEx", share: 12, cost: 9.42, onTime: 94.8 },
  { name: "DHL", share: 3, cost: 14.1, onTime: 97.4 },
];

export const inbound = [
  {
    id: "i1",
    po: "PO-2291",
    vendor: "Sunrise Packaging",
    what: "250 g pouches × 5,000",
    eta: "18 Nov",
    status: "late" as const,
    note: "Proof still on hold — fill slot is 18 Nov",
  },
  {
    id: "i2",
    po: "PO-2294",
    vendor: "Pacific Can Works",
    what: "16 oz cans × 12,000",
    eta: "21 Nov",
    status: "on-time" as const,
    note: "Proof v1 passed with notes",
  },
  {
    id: "i3",
    po: "PO-2288",
    vendor: "Revibe Supply",
    what: "Coffee fiber, 40 cases",
    eta: "15 Nov",
    status: "on-time" as const,
    note: "Arrives tomorrow",
  },
];

export const cash = {
  onHand: portfolio.cash,
  inTransit: 18240,
  bills14: 41260,
  runwayDays: 96,
};
