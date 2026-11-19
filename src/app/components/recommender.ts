/**
 * Origins assistant: retrieval + recommendation engine.
 * Pure TypeScript, no dependencies, safe to run client-side.
 *
 * Two jobs:
 *  1. search():    rank knowledge-base items against a free-text query
 *                  (token-level TF-IDF, field weights, phrase bonus, typo tolerance)
 *  2. recommend(): suggest the next questions to ask, from
 *                  query runner-ups + content similarity + curated links +
 *                  category affinity + a "journey" nudge toward contact/pricing,
 *                  then re-ranked with MMR so the chips are diverse.
 */

export interface RecItem {
  id: string;
  keywords: string[];
  question: string;
  answer: string;
}

export type ItemMeta = {
  category: 'services' | 'ai' | 'engineering' | 'commercial' | 'company' | 'trust';
  /** Curated "people who ask this also ask..." links (ids). */
  related: string[];
  /** Higher = shown earlier on a cold start. */
  priority: number;
};

export type Scored<T extends RecItem = RecItem> = { item: T; score: number };

export type RecContext<T extends RecItem = RecItem> = {
  /** Item ids already shown to the user, oldest -> newest. */
  history: string[];
  /** Output of search() for the latest query (used for "did you mean"). */
  ranked?: Scored<T>[];
  limit?: number;
};

/* ------------------------------------------------------------------ */
/* Tuning knobs                                                        */
/* ------------------------------------------------------------------ */

export const MIN_ANSWER_SCORE = 2.5; // below this, don't auto-answer
const W_KEYWORD = 3;
const W_QUESTION = 1.5;
const W_ANSWER = 0.7;
const PHRASE_BONUS = 4;
const FUZZY_FACTOR = 0.6;

const W_QUERY = 0.35;
const W_SIMILAR = 0.25;
const W_RELATED = 0.25;
const W_CATEGORY = 0.1;
const FUNNEL_BOOST = 0.15; // pushes contact/pricing after 2+ answers
const MMR_LAMBDA = 0.7; // 1 = pure relevance, 0 = pure diversity
const RECENCY_DECAY = 0.6;

/* ------------------------------------------------------------------ */
/* Curated metadata for the current knowledge base (q1 to q15)         */
/* Add a line here whenever you add a KNOWLEDGE_BASE entry.            */
/* Missing entries still work: they fall back to content similarity.   */
/* ------------------------------------------------------------------ */

export const ITEM_META: Record<string, ItemMeta> = {
  q1: { category: 'services', related: ['q2', 'q5', 'q11', 'q12'], priority: 10 },
  q2: { category: 'ai', related: ['q13', 'q1', 'q5'], priority: 9 },
  q3: { category: 'commercial', related: ['q4', 'q7'], priority: 8 },
  q4: { category: 'commercial', related: ['q7', 'q3', 'q14'], priority: 7 },
  q5: { category: 'engineering', related: ['q12', 'q11', 'q1'], priority: 6 },
  q6: { category: 'company', related: ['q9', 'q8'], priority: 3 },
  q7: { category: 'commercial', related: ['q4', 'q3', 'q10'], priority: 5 },
  q8: { category: 'trust', related: ['q10', 'q6'], priority: 4 },
  q9: { category: 'company', related: ['q6', 'q14'], priority: 2 },
  q10: { category: 'trust', related: ['q8', 'q12', 'q7'], priority: 2 },
  q11: { category: 'engineering', related: ['q5', 'q12'], priority: 1 },
  q12: { category: 'engineering', related: ['q5', 'q10', 'q15'], priority: 1 },
  q13: { category: 'ai', related: ['q2', 'q1'], priority: 1 },
  q14: { category: 'commercial', related: ['q4', 'q3', 'q7'], priority: 1 },
  q15: { category: 'engineering', related: ['q12', 'q5'], priority: 1 },
};

/* ------------------------------------------------------------------ */
/* Text utilities                                                      */
/* ------------------------------------------------------------------ */

const STOP = new Set(
  ('a an the and or but of to in on at for from by with about as is are was were be been it its this that these those ' +
    'do does did can could would should will you your we our us i me my they them their what which who whom how why ' +
    'when where please tell want need like have has had get').split(' '),
);

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const stem = (t: string) => (t.length > 3 && t.endsWith('s') && !t.endsWith('ss') ? t.slice(0, -1) : t);

const tokenize = (s: string): string[] =>
  normalize(s)
    .split(' ')
    .filter((t) => t.length > 1 && !STOP.has(t))
    .map(stem);

/** Levenshtein distance, bails out early once above `max`. */
function lev(a: string, b: string, max = 1): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      cur.push(v);
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

/** 1 = exact, FUZZY_FACTOR = one typo (only for longer words), 0 = miss. */
function tokenHit(q: string, set: Set<string>): number {
  if (set.has(q)) return 1;
  if (q.length >= 5) {
    for (const t of set) if (t.length >= 5 && lev(q, t) <= 1) return FUZZY_FACTOR;
  }
  return 0;
}

/* ------------------------------------------------------------------ */
/* Index                                                               */
/* ------------------------------------------------------------------ */

type Doc<T extends RecItem> = {
  item: T;
  phrases: string[]; // normalized multi-word keywords
  kw: Set<string>;
  q: Set<string>;
  a: Set<string>;
  vec: Map<string, number>; // tf-idf vector for similarity
  norm: number;
};

export class Recommender<T extends RecItem> {
  private docs: Doc<T>[];
  private byId = new Map<string, Doc<T>>();
  private idf = new Map<string, number>();

  constructor(items: T[], private meta: Record<string, ItemMeta> = ITEM_META) {
    // 1. tokenise every field
    this.docs = items.map((item) => {
      const kwTokens = item.keywords.flatMap(tokenize);
      return {
        item,
        phrases: item.keywords.map(normalize).filter((p) => p.includes(' ')),
        kw: new Set(kwTokens),
        q: new Set(tokenize(item.question)),
        a: new Set(tokenize(item.answer)),
        vec: new Map(),
        norm: 1,
      };
    });

    // 2. inverse document frequency over all fields
    const df = new Map<string, number>();
    for (const d of this.docs) {
      for (const t of new Set([...d.kw, ...d.q, ...d.a])) df.set(t, (df.get(t) ?? 0) + 1);
    }
    const N = this.docs.length;
    df.forEach((n, t) => this.idf.set(t, Math.max(0.5, Math.log(1 + N / n))));

    // 3. tf-idf vectors (keywords count 3x, question 2x, answer 1x)
    for (const d of this.docs) {
      const tf = new Map<string, number>();
      const add = (set: Set<string>, w: number) => set.forEach((t) => tf.set(t, (tf.get(t) ?? 0) + w));
      add(d.kw, 3);
      add(d.q, 2);
      add(d.a, 1);
      let sq = 0;
      tf.forEach((v, t) => {
        const w = v * (this.idf.get(t) ?? 1);
        d.vec.set(t, w);
        sq += w * w;
      });
      d.norm = Math.sqrt(sq) || 1;
      this.byId.set(d.item.id, d);
    }
  }

  get(id: string): T | undefined {
    return this.byId.get(id)?.item;
  }

  /* ---------------------------- search ---------------------------- */

  /** Ranked matches for a query (score > 0 only). Auto-answer if top score >= MIN_ANSWER_SCORE. */
  search(query: string): Scored<T>[] {
    const qNorm = ` ${normalize(query)} `;
    const qTokens = [...new Set(tokenize(query))];
    if (!qTokens.length) return [];

    const out: Scored<T>[] = [];
    for (const d of this.docs) {
      let score = 0;
      for (const p of d.phrases) if (qNorm.includes(` ${p} `)) score += PHRASE_BONUS;
      for (const t of qTokens) {
        const idf = this.idf.get(t) ?? 1;
        score += idf * (W_KEYWORD * tokenHit(t, d.kw) + W_QUESTION * tokenHit(t, d.q) + W_ANSWER * tokenHit(t, d.a));
      }
      if (score > 0) out.push({ item: d.item, score });
    }
    return out.sort((x, y) => y.score - x.score);
  }

  /* -------------------------- recommend --------------------------- */

  private cosine(a: Doc<T>, b: Doc<T>): number {
    const [small, big] = a.vec.size < b.vec.size ? [a, b] : [b, a];
    let dot = 0;
    small.vec.forEach((w, t) => {
      const o = big.vec.get(t);
      if (o) dot += w * o;
    });
    return dot / (a.norm * b.norm);
  }

  recommend(ctx: RecContext<T>): T[] {
    const limit = ctx.limit ?? 3;
    const seen = new Set(ctx.history);
    const candidates = this.docs.filter((d) => !seen.has(d.item.id));
    if (!candidates.length) return [];

    // Cold start: best-priority item from each category first, then the rest by priority.
    if (!ctx.history.length && !ctx.ranked?.length) return this.coldStart(candidates, limit);

    const recent = ctx.history.map((id) => this.byId.get(id)).filter(Boolean) as Doc<T>[];
    const topQuery = ctx.ranked?.[0]?.score || 1;
    const queryScore = new Map((ctx.ranked ?? []).map((r) => [r.item.id, r.score / topQuery]));

    // category affinity = share of the user's history in each category
    const catShare = new Map<string, number>();
    for (const d of recent) {
      const c = this.meta[d.item.id]?.category;
      if (c) catShare.set(c, (catShare.get(c) ?? 0) + 1 / recent.length);
    }

    const scored = candidates.map((d) => {
      const m = this.meta[d.item.id];
      let sim = 0;
      let rel = 0;
      let weight = 1;
      let wSum = 0;
      // newest answer counts most, older ones decay
      for (let i = recent.length - 1; i >= 0; i--) {
        sim += weight * this.cosine(d, recent[i]);
        if (this.meta[recent[i].item.id]?.related.includes(d.item.id)) rel += weight;
        wSum += weight;
        weight *= RECENCY_DECAY;
      }
      sim /= wSum || 1;
      rel = Math.min(1, rel / (wSum || 1) + (rel > 0 ? 0.3 : 0));

      let s =
        W_QUERY * (queryScore.get(d.item.id) ?? 0) +
        W_SIMILAR * sim +
        W_RELATED * rel +
        W_CATEGORY * (m ? catShare.get(m.category) ?? 0 : 0) +
        0.01 * (m?.priority ?? 0) / 10; // tiny tie-breaker
      if (recent.length >= 2 && m?.category === 'commercial') s += FUNNEL_BOOST;
      return { d, s };
    });

    return this.mmr(scored, limit).map((x) => x.d.item);
  }

  private coldStart(candidates: Doc<T>[], limit: number): T[] {
    const byPriority = [...candidates].sort(
      (a, b) => (this.meta[b.item.id]?.priority ?? 0) - (this.meta[a.item.id]?.priority ?? 0),
    );
    const picked: Doc<T>[] = [];
    const cats = new Set<string>();
    for (const d of byPriority) {
      const c = this.meta[d.item.id]?.category ?? d.item.id;
      if (!cats.has(c)) {
        cats.add(c);
        picked.push(d);
      }
      if (picked.length === limit) break;
    }
    for (const d of byPriority) {
      if (picked.length >= limit) break;
      if (!picked.includes(d)) picked.push(d);
    }
    return picked.map((d) => d.item);
  }

  /** Maximal Marginal Relevance: relevance minus similarity to already-picked chips. */
  private mmr(scored: { d: Doc<T>; s: number }[], k: number) {
    const pool = [...scored];
    const out: typeof pool = [];
    while (out.length < k && pool.length) {
      let best = 0;
      let bestVal = -Infinity;
      pool.forEach((c, i) => {
        const redundancy = out.length ? Math.max(...out.map((o) => this.cosine(c.d, o.d))) : 0;
        const val = MMR_LAMBDA * c.s - (1 - MMR_LAMBDA) * redundancy;
        if (val > bestVal) {
          bestVal = val;
          best = i;
        }
      });
      out.push(pool.splice(best, 1)[0]);
    }
    return out;
  }
}