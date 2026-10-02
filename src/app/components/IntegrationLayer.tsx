'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type Integration = { name: string; group: string; mark: string; description: string; uses: string[] };

const integrations: Integration[] = [
  { name:'Gmail', group:'Communication', mark:'M', description:'Connect inbox workflows to your product, CRM or AI automation.', uses:['Lead routing','Notifications','AI email workflows'] },
  { name:'Slack', group:'Communication', mark:'S', description:'Bring operational events, approvals and alerts into team channels.', uses:['Alerts','Approvals','AI assistants'] },
  { name:'Microsoft Teams', group:'Communication', mark:'T', description:'Connect enterprise collaboration with customer and internal workflows.', uses:['Meeting workflows','Notifications','Approvals'] },
  { name:'Google Drive', group:'Workspace', mark:'D', description:'Turn documents into searchable, permission-aware product data.', uses:['Document sync','Knowledge bases','File workflows'] },
  { name:'Notion', group:'Workspace', mark:'N', description:'Connect knowledge, specifications and operational databases.', uses:['Knowledge sync','Content workflows','Project data'] },
  { name:'GitHub', group:'Engineering', mark:'GH', description:'Connect engineering activity to product operations and delivery visibility.', uses:['Deployments','Issues','Release automation'] },
  { name:'Linear', group:'Engineering', mark:'L', description:'Synchronize product planning with delivery workflows.', uses:['Issues','Roadmaps','Status automation'] },
  { name:'Jira', group:'Engineering', mark:'J', description:'Connect enterprise delivery workflows to your product ecosystem.', uses:['Tickets','Workflow automation','Reporting'] },
  { name:'Stripe', group:'Commerce', mark:'$ ', description:'Build billing, payments and subscription workflows into products.', uses:['Payments','Subscriptions','Invoices'] },
  { name:'HubSpot', group:'CRM', mark:'H', description:'Connect customer lifecycle data with product events.', uses:['CRM sync','Lead routing','Lifecycle automation'] },
  { name:'Salesforce', group:'CRM', mark:'SF', description:'Integrate enterprise customer data and workflows.', uses:['Accounts','Sales workflows','Customer events'] },
  { name:'OpenAI', group:'AI', mark:'AI', description:'Connect AI models to controlled product experiences and automations.', uses:['Assistants','Extraction','Agents'] },
];

function IntegrationMark({ item }: { item: Integration }) {
  return <span className="integration-mark" data-group={item.group}>{item.mark}</span>;
}

export default function IntegrationLayer() {
  const [selected, setSelected] = useState<Integration | null>(null);

  return (
    <section className="integration-section" id="integrations">
      <div className="shell">
        <div className="integration-head" data-reveal>
          <div>
            <div className="eyebrow">Integration layer</div>
            <h2>Your tools.<br /><em>One connected system.</em></h2>
          </div>
          <p>
            We connect the tools your team already uses instead of forcing another
            isolated platform into the stack. Select an integration to see what it can do.
          </p>
        </div>

        <div className="integration-panel" data-reveal>
          <div className="integration-orbit" aria-hidden="true">
            <span className="orbit-ring ring-a" /><span className="orbit-ring ring-b" />
            <span className="orbit-core">ORIGINS<span>OS</span></span>
          </div>
          <div className="integration-grid">
            {integrations.map((item, index) => (
              <motion.button
                key={item.name}
                type="button"
                className="integration-tile"
                onClick={() => setSelected(item)}
                whileHover={{ y: -5 }}
                whileTap={{ scale: .98 }}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: .25 }}
                transition={{ delay: index * .035, duration: .45 }}
              >
                <IntegrationMark item={item} />
                <span><strong>{item.name}</strong><small>{item.group}</small></span>
                <b aria-hidden="true">↗</b>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div className="integration-modal-backdrop" role="presentation" onClick={() => setSelected(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="integration-modal"
              role="dialog"
              aria-modal="true"
              aria-label={`${selected.name} integration`}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 24, scale: .97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: .98 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            >
              <button className="integration-modal-close" type="button" onClick={() => setSelected(null)} aria-label="Close">×</button>
              <IntegrationMark item={selected} />
              <span className="modal-kicker">{selected.group} integration</span>
              <h3>{selected.name}</h3>
              <p>{selected.description}</p>
              <div className="modal-use-grid">
                {selected.uses.map((use) => <span key={use}><i />{use}</span>)}
              </div>
              <a href="#contact" className="button button-primary" onClick={() => setSelected(null)}>
                Discuss this integration <span className="button-arrow">↗</span>
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
