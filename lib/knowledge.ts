/**
 * The knowledge base — everything Rabbitgun knows, written as citable
 * entries. On first use (or when empty) this is embedded locally with
 * MiniLM and stored in Postgres pgvector. Jarvis and the Brain room both
 * search the same index, so the AI answers from the same truth the
 * dashboard shows.
 *
 * Privacy note: private personal rooms are described the way people are
 * told about them — private, full stop. Nothing else goes in here.
 */

export type KnowledgeEntry = {
  source: string;
  title: string;
  text: string;
  tags: string[];
};

export const knowledgeBase: KnowledgeEntry[] = [
  // ------------------------------------------------------------- the machine
  {
    source: "rules",
    title: "The one rule: Propose → Approve → Record",
    text: "Every AI output is a proposal attached to the artifact it came from. A human approves or holds, and the decision is recorded with who, when, and the file hash. Nothing sends automatically. Nothing is destroyed. Rabbitgun never writes to a live system without a recorded human approval.",
    tags: ["rules", "core", "ai"],
  },
  {
    source: "rules",
    title: "Append-only where it matters",
    text: "Specs, documents, and approvals are never overwritten — a new version supersedes the old one and the old one stays readable forever. Locks and approvals are receipts in the audit log with the person's name and the timestamp.",
    tags: ["rules", "core"],
  },
  {
    source: "rules",
    title: "The two gates of PackCheck",
    text: "Gate one is outbound artwork: our files leaving for a printer. Gate two is inbound proofs: files a printer sends back before the run. Both are checked against the locked spec. Every proof gets a verdict: pass, pass-with-notes, or hold.",
    tags: ["rules", "packcheck"],
  },
  {
    source: "rules",
    title: "What the AI does not do",
    text: "Color on press cannot be judged from a PDF — press checks stay human. Legal and regulatory sign-off stays human. The checker flags and catches; it never certifies compliance. On Monarch's site the claims are 'assist, flag, catch' — never 'guarantee, compliant, certified'.",
    tags: ["rules", "packcheck", "preflight"],
  },
  {
    source: "rules",
    title: "No hosted AI. Ever.",
    text: "Rabbitgun is the in-home AI and it stays that way. No business data — documents, numbers, notes, embeddings — is ever sent to any hosted AI service, including Anthropic or any free-tier model. Embeddings run locally with MiniLM on the home box, and any language-model generation happens on the home box too. The rule is absolute: nothing about the business leaves the hardware we own.",
    tags: ["rules", "ai", "privacy", "core"],
  },
  {
    source: "rules",
    title: "Rabbitgun is the body, Jarvis is the voice and memory",
    text: "Rabbitgun holds artifacts and evidence: files, specs, findings, approvals, metrics, and runs the checks. Jarvis is conversation, voice, and long-term recall, reading Rabbitgun through its read-only API. Rabbitgun is never a chatbot; Jarvis is never a file cabinet.",
    tags: ["rules", "jarvis", "core"],
  },
  {
    source: "rules",
    title: "Private rooms are private",
    text: "Every person gets a Private room that is theirs alone: nobody else can see what they save, and it never leaves the dashboard. The AI tells people the same: your private room is yours — no one in the company can see it. Notes in private rooms never reach the public audit log.",
    tags: ["rules", "privacy", "private"],
  },

  // ------------------------------------------------------------- rooms
  {
    source: "rooms",
    title: "The rooms of Rabbitgun",
    text: "Brief: the morning read. PackCheck: proofs and findings. Specs: the locked truth the gate checks against. Inbox: threads that move money. Runbook: obligations and owners. Pulse: revenue by entity. Money: flow and leaks. Freight: every box and exception. Vault: every document. Approvals: the receipt log. Brain: ask the business a question. Private: each person's own notes.",
    tags: ["rooms", "core"],
  },
  {
    source: "rooms",
    title: "The Brief",
    text: "The Brief opens with the one-paragraph morning read: what needs a decision today, the story behind the numbers, and the three things that matter. It shows all seven sites with their public notes and the portfolio total.",
    tags: ["rooms", "brief"],
  },

  // ------------------------------------------------------------- entities
  {
    source: "entities",
    title: "Addy DSD",
    text: "Addy DSD is the direct-store-delivery distribution business — the truck, the stores, the shelf. It is the DSD arm and feeds accounts across the valley.",
    tags: ["entity", "addy", "dsd"],
  },
  {
    source: "entities",
    title: "Hella Good Energy",
    text: "Hella Good Energy sells caffeine gummies with Marshawn Lynch. Five ninety-nine a pack, 125 mg of RCF natural caffeine, three flavors, 7.99 flat shipping. Site: hellagoodenergy.com.",
    tags: ["entity", "hellagood"],
  },
  {
    source: "entities",
    title: "Born Again Kratom",
    text: "Born Again Kratom sells whole-leaf kratom only — no extracts, no 7-OH, lab-tested and batch-traceable. Site: bornagainkratom.com. Flagship SKU: BAK-MD-250, the Maeng Da 250 g pouch.",
    tags: ["entity", "bornagain"],
  },
  {
    source: "entities",
    title: "Monarch Technologies",
    text: "Monarch Technologies is the tech and services arm — the backend engine for DSD operations, and Monarch Preflight, the packaging prepress checker sold to printers and agencies. Site: monarchtechusa.com.",
    tags: ["entity", "monarch", "preflight"],
  },
  {
    source: "entities",
    title: "Raw Coffee Fiber",
    text: "Raw Coffee Fiber (RCF) is the natural caffeine ingredient — up to 7-hour release, used in Hella Good gummies. Site: rawcoffeefiber.com.",
    tags: ["entity", "rawcoffee"],
  },
  {
    source: "entities",
    title: "WGC Paddy",
    text: "WGC Paddy sells focus supplements — the line is 'focus without a prescription'. Site: wgcpaddy.com. Its claims need a substantiation document attached before the next print run.",
    tags: ["entity", "wgc"],
  },
  {
    source: "entities",
    title: "WowCow Distributors",
    text: "WowCow Distributors is the B2B wholesale arm, distributing ADDY, CHILLAX and K-Relief. Terms: 2x keystone, 90-day money-back, 24-hour approval, up to 20% off first order, 10% always. Phone (602) 326-7730. Site: wowcowdistributors.com.",
    tags: ["entity", "wowcow", "wholesale"],
  },

  // ------------------------------------------------------------- demo narrative
  {
    source: "packcheck",
    title: "BAK-MD-250 — the Maeng Da 250 g pouch",
    text: "Born Again's flagship SKU. Spec v3 is locked by Tom: GTIN 8101234567803, net weight 250 g / 8.8 oz, warning block at 6 pt, dieline SR-POUCH-250 v5, spots PMS 485 U and PMS Black 6 U, uncoated stock. Vendor: Sunrise Packaging, contact Kerri.",
    tags: ["packcheck", "bornagain", "spec"],
  },
  {
    source: "packcheck",
    title: "The proof that got held",
    text: "Sunrise sent proof v2 of BAK-MD-250. The checker held it with three blockers: the front-panel barcode encodes 8101234567890 which scans to the wrong product; the net weight contradicts the spec; and the warning block is missing. Two smaller items: the dieline is v4 instead of v5, and the spot is named 485 C instead of 485 U on uncoated stock. Kerri booked the fill line for the 18th and wants approval by Monday to hold the 24 Nov in-hands date. The reply is drafted and waiting for approval — nothing sends by itself.",
    tags: ["packcheck", "bornagain", "sunrise"],
  },
  {
    source: "money",
    title: "Portfolio shape",
    text: "Portfolio MTD: 327,000 revenue across seven entities, 112,095 kept, 218,740 cash on hand, 3,613 orders, 252 shipments today, 11 freight exceptions, and 5,321 a month leaking across identified leaks. Born Again is down about 9% and the drop is refunds, not traffic: a 4.1% refund rate against a 1.2% baseline, clustered on the 250 g pouch. Hella Good had its best week since launch, up 18%.",
    tags: ["money", "portfolio", "demo"],
  },
  {
    source: "freight",
    title: "Freight posture",
    text: "Carriers in the mix and the exception list are on the Freight room. The standing rule: an exception older than 48 hours gets a task with an owner. One store has gone quiet — an account with 11 days and no order.",
    tags: ["freight", "rules"],
  },

  // ------------------------------------------------------------- preflight (sellable)
  {
    source: "preflight",
    title: "Monarch Preflight — the sellable version of PackCheck",
    text: "Monarch Preflight is the packaging prepress checker marketed on monarchtechusa.com: two gates, 38 automated checks, same-day report, a human signs. A mistake caught once becomes a permanent check; the checklist only grows. Every locked parameter — UPC, weights, warning language, claims, dieline version, spot colors — is one more thing verified automatically.",
    tags: ["preflight", "monarch", "sales"],
  },
  {
    source: "preflight",
    title: "Monarch Preflight pricing shape",
    text: "Single proof check around 99 to 149 dollars, a monthly plan for recurring volume, and white-label for printers and agencies. Claims discipline on the site: we flag, we don't certify.",
    tags: ["preflight", "sales", "pricing"],
  },

  // ------------------------------------------------------------- jarvis
  {
    source: "jarvis",
    title: "How Jarvis reads Rabbitgun",
    text: "Jarvis pulls the morning brief from /api/jarvis/brief and searches this knowledge index from /api/jarvis/search, both with a bearer token. The feed is read-only: Jarvis never writes to Rabbitgun. Jarvis memory (its own note store) feeds decisions back into Rabbitgun's Brain.",
    tags: ["jarvis", "api"],
  },
  {
    source: "jarvis",
    title: "How to answer questions",
    text: "Answer from the index and cite: say which source the answer came from and when it was recorded. If the index cannot support an answer, say so plainly — no uncited guesses. Numbers the dashboard shows and numbers the AI says must always match, because they come from the same store.",
    tags: ["jarvis", "rules"],
  },
];
