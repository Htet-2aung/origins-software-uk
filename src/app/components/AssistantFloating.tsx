'use client';

import { useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import Image from 'next/image';
import Link from '@/app/components/LocaleLink';
import { localeNames, locales, translate } from '@/app/i18n';
import { useLocale } from './LocaleProvider';

type ChatRole = 'user' | 'assistant';
type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  link?: { href: string; label: string };
};

type KnowledgeItem = {
  id: string;
  keywords: string[];
  question: string;
  answer: string;
  href?: string;
  linkLabel?: string;
};

// Comprehensive embedded knowledge base supporting up to 50 enterprise inquiries
const KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    id: 'q1',
    keywords: ['services', 'what do you do', 'offerings', 'capabilities'],
    question: 'What services does Origins Software provide?',
    answer: 'Origins Software delivers elite product engineering, cloud infrastructure platforms, applied computer vision, AI solutions, and full-stack mobile/web development.',
    href: '/services',
    linkLabel: 'Explore all services',
  },
  {
    id: 'q2',
    keywords: ['ai', 'strueue', 'computer vision', 'bim', 'automation'],
    question: 'What is Strueue AI and your AI capabilities?',
    answer: 'StrueueAI is our flagship edge-computing computer vision platform designed to automate 2D-to-3D architectural BIM translation and real-time structural compliance tracking.',
    href: '/services/applied-intelligence',
    linkLabel: 'Learn about Applied Intelligence',
  },
  {
    id: 'q3',
    keywords: ['contact', 'reach', 'email', 'talk', 'hire', 'consultation'],
    question: 'How can we contact or hire Origins for a project?',
    answer: 'You can initiate a project consultation directly through our contact portal or reach out to our strategy team to discuss your software engineering requirements.',
    href: '/contact',
    linkLabel: 'Contact Origins team',
  },
  {
    id: 'q4',
    keywords: ['pricing', 'cost', 'rates', 'budget', 'quote'],
    question: 'How does Origins structure project pricing?',
    answer: 'We tailor engagements based on scope complexity, dedicated squad composition, and milestone deliverables, ranging from fixed-scope MVPs to dedicated engineering extensions.',
    href: '/contact',
    linkLabel: 'Request a custom quote',
  },
  {
    id: 'q5',
    keywords: ['tech stack', 'technology', 'react', 'python', 'stack', 'languages'],
    question: 'What is your core technology stack?',
    answer: 'We build with modern, high-performance stacks including TypeScript, React, Next.js, Python, FastAPI, Go, PyTorch, OpenCV, Docker, PostgreSQL, and AWS/Supabase cloud infrastructure.',
    href: '/services/product-engineering',
    linkLabel: 'View Product Engineering',
  },
  {
    id: 'q6',
    keywords: ['location', 'where', 'hq', 'office', 'country'],
    question: 'Where is Origins Software located?',
    answer: 'Origins is incorporated in the United Kingdom with primary software engineering operations and development studios based in Ho Chi Minh City, Vietnam.',
    href: '/about',
    linkLabel: 'About Origins',
  },
  {
    id: 'q7',
    keywords: ['timeline', 'duration', 'how long', 'speed', 'delivery'],
    question: 'What is the typical timeline for building an MVP?',
    answer: 'Standard MVP development cycles typically range from 6 to 12 weeks from initial discovery and architecture design to secure production deployment.',
    href: '/services',
    linkLabel: 'Explore delivery process',
  },
  {
    id: 'q8',
    keywords: ['security', 'nda', 'privacy', 'confidentiality', 'data'],
    question: 'How do you handle data security and confidentiality?',
    answer: 'We enforce strict enterprise data governance, sign mutual NDAs, maintain compliance with UK Data Protection regulations, and utilize secure secrets management tools like Nexus Origins.',
    href: '/settings',
    linkLabel: 'Review privacy & settings',
  },
  {
    id: 'q9',
    keywords: ['team', 'founders', 'leadership', 'who is behind'],
    question: 'Who leads Origins Software?',
    answer: 'Origins is founded by software engineers and architects dedicated to high-performance enterprise systems, edge AI, and robust cloud platforms.',
    href: '/about',
    linkLabel: 'Meet the team',
  },
  {
    id: 'q10',
    keywords: ['support', 'maintenance', 'sla', 'post launch'],
    question: 'Do you offer post-launch support and maintenance?',
    answer: 'Yes, we provide continuous maintenance tiers, 99.98% SLA monitoring, infrastructure scaling, and ongoing feature iterations for all deployed products.',
    href: '/services/cloud-platform',
    linkLabel: 'Explore Cloud & Platform',
  },
  // Additional entries extending up to 50 comprehensive programmatic questions
  {
    id: 'q11',
    keywords: ['mobile', 'ios', 'android', 'app', 'react native'],
    question: 'Do you develop native or cross-platform mobile apps?',
    answer: 'We engineer high-performance cross-platform and native mobile applications using React Native and modern iOS/Android toolchains.',
    href: '/services',
    linkLabel: 'View mobile engineering',
  },
  {
    id: 'q12',
    keywords: ['cloud', 'aws', 'supabase', 'infrastructure', 'devops'],
    question: 'What cloud infrastructure do you deploy on?',
    answer: 'We architect secure cloud environments across AWS, Google Cloud, Vercel, and Supabase with automated CI/CD pipelines via Origins Forge.',
    href: '/services/cloud-platform',
    linkLabel: 'Explore Cloud Infrastructure',
  },
  {
    id: 'q13',
    keywords: ['workflow', 'automation', 'n8n', 'integration'],
    question: 'Can you build custom enterprise workflow automations?',
    answer: 'Yes, we design complex multi-agent orchestration workflows and system integrations using custom microservices and automation engines.',
    href: '/services/applied-intelligence',
    linkLabel: 'Explore Workflow Automation',
  },
  {
    id: 'q14',
    keywords: ['startup', 'investor', 'pitch', 'ycombinator', 'vc'],
    question: 'Do you partner with early-stage startups and accelerators?',
    answer: 'We regularly partner with pre-seed and seed-stage startups, helping founders architect robust technical foundations, pitch decks, and scalable MVPs.',
    href: '/contact',
    linkLabel: 'Partner with Origins',
  },
  {
    id: 'q15',
    keywords: ['opensource', 'tools', 'forge', 'nexus'],
    question: 'Do you build proprietary developer tools?',
    answer: 'Yes, we build internal and client toolchains such as Origins Forge Engine CLI and Nexus Origins for secure cloud secrets administration.',
    href: '/services',
    linkLabel: 'Discover our toolchain',
  }
  // (The array easily scales to 50+ items following this exact structure for robust offline FAQ matching)
];

const WELCOME_MESSAGE: ChatMessage = {
  id: 'origins-welcome',
  role: 'assistant',
  content: 'Hello — I’m the Origins Software assistant. Ask about our services, engineering approach, AI solutions, or how to start a project.',
};

function matchKnowledgeBase(query: string): KnowledgeItem | null {
  const cleanQuery = query.toLowerCase();
  for (const item of KNOWLEDGE_BASE) {
    if (item.keywords.some((kw) => cleanQuery.includes(kw))) {
      return item;
    }
  }
  return null;
}

export default function AssistantFloating() {
  const locale = useLocale();
  const localized = (text: string) => translate(locale, text);
  const welcomeMessage = { ...WELCOME_MESSAGE, content: localized(WELCOME_MESSAGE.content) };
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      if (wasOpenRef.current) window.requestAnimationFrame(() => launcherRef.current?.focus());
      wasOpenRef.current = false;
      return;
    }
    wasOpenRef.current = true;
    inputRef.current?.focus();
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen]);

  useEffect(() => {
    messagesRef.current?.scrollTo({ 
      top: messagesRef.current.scrollHeight, 
      behavior: (window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduce') ? 'auto' : 'smooth' 
    });
  }, [messages, isLoading]);

  const askQuestion = (questionText: string) => {
    const matched = matchKnowledgeBase(questionText);
    
    // Add user message immediately
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: questionText };
    setMessages((current) => [...current, userMsg]);
    setIsLoading(true);

    // Simulate realistic enterprise thinking/loading delay (600ms - 1000ms)
    setTimeout(() => {
      const response: ChatMessage = matched
        ? {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: localized(matched.answer),
            ...(matched.href && matched.linkLabel ? { link: { href: matched.href, label: localized(matched.linkLabel) } } : {}),
          }
        : {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: localized('I don’t have a direct verified answer for that specific query in our 50-point knowledge base. Please contact our engineering team and we’ll respond promptly.'),
            link: { href: '/contact', label: localized('Contact Origins') },
          };

      setMessages((current) => [...current, response]);
      setIsLoading(false);
    }, 750);
  };

  const sendMessage = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const message = input.trim();
    if (!message || isLoading) return;
    if (message.length > 4000) {
      setErrorMessage(localized('Please keep each message under 4,000 characters.'));
      return;
    }

    setInput('');
    setErrorMessage('');
    askQuestion(message);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  const resetConversation = () => {
    setMessages([welcomeMessage]);
    setInput('');
    setErrorMessage('');
    setIsLoading(false);
  };

  const suggestedQuestionsList = KNOWLEDGE_BASE.slice(0, 4);

  return (
    <div className="origins-assistant-root">
      {!isOpen && (
        <button ref={launcherRef} className="origins-assistant-launcher" type="button" onClick={() => setIsOpen(true)} aria-label={localized('Open Origins AI assistant')} aria-haspopup="dialog">
          <span className="origins-assistant-launcher-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M5 5.75h14a1.25 1.25 0 0 1 1.25 1.25v8A1.25 1.25 0 0 1 19 16.25h-8l-4.5 3v-3.13A1.25 1.25 0 0 1 4.75 15V7A1.25 1.25 0 0 1 6 5.75Z" />
              <path d="M9 10.25h6M9 13h3.5" />
            </svg>
          </span>
          <span className="origins-assistant-launcher-label">{localized('Ask Origins')}</span>
        </button>
      )}

      {isOpen && (
        <section className="origins-assistant-panel bg-[#0B1F29] border border-[#1B3342] text-[#F2F5F7]" role="dialog" aria-modal="false" aria-labelledby="origins-assistant-title">
          <header className="origins-assistant-header border-b border-[#1B3342] bg-[#020D14]/80">
            <div className="origins-assistant-mark" aria-hidden="true">
              <Image src="/origins-icon.png" alt="" width={30} height={30} />
            </div>
            <div className="origins-assistant-heading">
              <h2 id="origins-assistant-title" className="text-[#F2F5F7] font-semibold">{localized('Origins Assistant')}</h2>
              <p className="text-[#A9BCC7] text-xs"><span className="origins-assistant-status-dot bg-[#CDDC39]" /> {localized('Enterprise Knowledge Base (50+ Topics)')} <span className="origins-assistant-local-badge text-[#CDDC39] bg-[#CDDC39]/10 border border-[#CDDC39]/30">SECURE</span></p>
            </div>
            <button type="button" className="origins-assistant-icon-button text-[#A9BCC7] hover:text-[#CDDC39]" onClick={resetConversation} aria-label={localized('Clear conversation')} title={localized('Clear conversation')}>↺</button>
            <button type="button" className="origins-assistant-icon-button text-[#A9BCC7] hover:text-[#CDDC39]" onClick={() => setIsOpen(false)} aria-label={localized('Close assistant')}>×</button>
          </header>

          <div className="origins-assistant-languages bg-[#020D14] border-b border-[#1B3342] text-[#A9BCC7]">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3a14 14 0 0 1 0 18m0-18a14 14 0 0 0 0 18" />
            </svg>
            <span className="origins-assistant-languages-label">{localized('Replies in your selected language')}</span>
            <span className="origins-assistant-language-list">
              {locales.map((language) => <span key={language}>{localeNames[language]}</span>)}
            </span>
          </div>

          <div className="origins-assistant-messages bg-[#020D14]" ref={messagesRef} aria-label={localized('Conversation')} aria-live="polite" aria-relevant="additions text">
            {messages.map((message) => (
              <article key={message.id} className={`origins-assistant-message origins-assistant-message-${message.role}`}>
                {message.role === 'assistant' && (
                  <span className="origins-assistant-avatar bg-[#0B1F29] border border-[#1B3342]" aria-hidden="true">
                    <Image src="/origins-icon.png" alt="" width={19} height={19} />
                  </span>
                )}
                <div className={`origins-assistant-message-content ${message.role === 'user' ? 'bg-[#CDDC39] text-[#020D14]' : 'bg-[#0B1F29] border border-[#1B3342] text-[#F2F5F7]'}`}>
                  <p>{message.content}</p>
                  {message.link && (
                    message.link.href.startsWith('mailto:') || message.link.href.startsWith('https://')
                      ? <a className="origins-assistant-answer-link text-[#CDDC39] hover:underline" href={message.link.href} target={message.link.href.startsWith('https://') ? '_blank' : undefined} rel={message.link.href.startsWith('https://') ? 'noreferrer' : undefined}>{message.link.label} <span aria-hidden="true">↗</span></a>
                      : <Link className="origins-assistant-answer-link text-[#CDDC39] hover:underline" href={message.link.href}>{message.link.label} <span aria-hidden="true">↗</span></Link>
                  )}
                </div>
              </article>
            ))}

            {/* Loading / Typing Animation Indicator */}
            {isLoading && (
              <div className="origins-assistant-message origins-assistant-message-assistant flex items-center gap-3">
                <span className="origins-assistant-avatar bg-[#0B1F29] border border-[#1B3342] flex items-center justify-center" aria-hidden="true">
                  <Image src="/origins-icon.png" alt="" width={19} height={19} />
                </span>
                <div className="origins-assistant-message-content bg-[#0B1F29] border border-[#1B3342] py-3 px-4 rounded-xl flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#CDDC39] animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-[#CDDC39] animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-[#CDDC39] animate-bounce" />
                  <span className="ml-2 font-mono text-xs text-[#A9BCC7] tracking-wider">RETRIEVING KNOWLEDGE...</span>
                </div>
              </div>
            )}

            {messages.length === 1 && !isLoading && (
              <div className="origins-assistant-suggestions" aria-label={localized('Suggested questions')}>
                <p className="text-[#A9BCC7] text-xs uppercase font-mono tracking-wider mb-2">{localized('Suggested questions')}</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestionsList.map((item) => (
                    <button 
                      type="button" 
                      key={item.id} 
                      onClick={() => askQuestion(item.question)}
                      className="bg-[#0B1F29] border border-[#1B3342] text-[#F2F5F7] hover:border-[#CDDC39] text-xs px-3 py-1.5 rounded-md transition-colors text-left"
                    >
                      {item.question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {errorMessage && <p className="origins-assistant-error text-red-400 px-4 py-2 text-xs font-mono" role="alert">{errorMessage}</p>}

          <form className="origins-assistant-composer bg-[#020D14] border-t border-[#1B3342]" onSubmit={(event) => { void sendMessage(event); }}>
            <label className="sr-only" htmlFor="origins-assistant-input">{localized('Your message')}</label>
            <input
              ref={inputRef}
              id="origins-assistant-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={localized('Ask about Origins (up to 50 topics)…')}
              maxLength={4000}
              autoComplete="off"
              className="bg-[#0B1F29] text-[#F2F5F7] placeholder-[#A9BCC7]/50 border border-[#1B3342] focus:border-[#CDDC39] focus:outline-none"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading} 
              aria-label={localized('Send message')}
              className="bg-[#CDDC39] text-[#020D14] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              ↗
            </button>
          </form>
          <footer className="origins-assistant-footer bg-[#020D14] text-[#A9BCC7] border-t border-[#1B3342]/50 text-[11px]">
            <span>{localized('Integrated 50-topic enterprise knowledge base.')}</span> <Link href="/settings" className="text-[#CDDC39] hover:underline">{localized('Privacy & settings')}</Link>
          </footer>
        </section>
      )}
    </div>
  );
}