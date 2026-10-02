'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const examples = [
  'A client portal with AI support and real-time messaging',
  'A marketplace for local service businesses',
  'An internal operations platform for a growing team',
];

const stages = [
  ['01', 'Understand', 'AI turns the idea into users, workflows and constraints.'],
  ['02', 'Shape', 'The system proposes product surfaces, integrations and data flows.'],
  ['03', 'Ship', 'Origins engineers turn the blueprint into a production-ready system.'],
];

export default function AIProductArchitect() {
  const [idea, setIdea] = useState('');
  const [generated, setGenerated] = useState(false);
  const [busy, setBusy] = useState(false);

  const blueprint = useMemo(() => {
    const text = idea.toLowerCase();
    const kind = text.includes('market') ? 'Marketplace' : text.includes('portal') ? 'Client platform' : text.includes('internal') ? 'Operations platform' : 'Digital product';
    const integrations = text.includes('messag') ? ['Slack', 'Gmail', 'Microsoft Teams'] : ['Google Workspace', 'Slack', 'GitHub'];
    return { kind, integrations };
  }, [idea]);

  const generate = () => {
    if (!idea.trim()) return;
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setGenerated(true);
    }, 650);
  };

  return (
    <section className="ai-architect-section" id="ai-architect">
      <div className="shell">
        <div className="ai-architect-head" data-reveal>
          <div>
            <div className="eyebrow"><span className="ai-spark" /> AI-native studio</div>
            <h2>Start with an idea.<br /><em>Leave with a blueprint.</em></h2>
          </div>
          <p>
            Describe what you want to build in plain language. Our AI-first workflow
            turns the brief into a product shape your engineering team can actually use.
          </p>
        </div>

        <div className="ai-architect-card" data-reveal>
          <div className="ai-architect-input">
            <div className="ai-architect-toolbar">
              <span className="ai-live-dot" /> PRODUCT ARCHITECT
              <span className="ai-toolbar-status">Local preview · no account required</span>
            </div>
            <textarea
              value={idea}
              onChange={(e) => { setIdea(e.target.value); setGenerated(false); }}
              placeholder="Tell us what you want to build..."
              aria-label="Describe your product idea"
              rows={5}
            />
            <div className="ai-example-row">
              {examples.map((example) => (
                <button key={example} type="button" onClick={() => setIdea(example)}>{example}</button>
              ))}
            </div>
            <button className="ai-generate" type="button" disabled={!idea.trim() || busy} onClick={generate}>
              <span>{busy ? 'Mapping your product…' : generated ? 'Blueprint refreshed' : 'Generate product blueprint'}</span>
              <span aria-hidden="true">↗</span>
            </button>
          </div>

          <div className="ai-architect-output">
            <AnimatePresence mode="wait">
              {!generated ? (
                <motion.div className="ai-empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="ai-orbit"><span /><span /><span /></div>
                  <strong>Your product map will appear here.</strong>
                  <small>Architecture, workflows, integrations and delivery shape.</small>
                </motion.div>
              ) : (
                <motion.div className="ai-blueprint" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} key="blueprint">
                  <div className="blueprint-top">
                    <div><span>GENERATED BLUEPRINT</span><h3>{blueprint.kind}</h3></div>
                    <span className="blueprint-badge">AI READY</span>
                  </div>
                  <div className="blueprint-flow">
                    {stages.map(([n, title, text]) => (
                      <div className="blueprint-step" key={n}>
                        <b>{n}</b><div><strong>{title}</strong><p>{text}</p></div>
                      </div>
                    ))}
                  </div>
                  <div className="blueprint-integrations">
                    <span>Suggested integrations</span>
                    <div>{blueprint.integrations.map((item) => <i key={item}>{item}</i>)}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
