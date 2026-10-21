'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DOCS_CATEGORIES, DOCS_DATA } from '../app/documentation/docsContent';
import '../app/documentation/documentation.css';

/**
 * Icons helper for category navigation
 */
function CategoryIcon({ type }) {
  if (type === 'rocket') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
      </svg>
    );
  }
  if (type === 'cpu') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="16" height="16" x="4" y="4" rx="2"/>
        <rect width="6" height="6" x="9" y="9" rx="1"/>
        <path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>
      </svg>
    );
  }
  if (type === 'layers') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/>
        <polyline points="2 17 12 22 22 17"/>
        <polyline points="2 12 12 17 22 12"/>
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

/**
 * Modern code block with copy button and language identifier
 */
function CodeSnippet({ code, language = 'text' }) {
  const [copied, setCopied] = useState(false);
  const cleanCode = typeof code === 'string' ? code.replace(/\n$/, '') : String(code || '');

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modern-code-block">
      <div className="modern-code-header">
        <div className="modern-code-dots">
          <span className="dot dot-red"></span>
          <span className="dot dot-yellow"></span>
          <span className="dot dot-green"></span>
          <span className="modern-code-lang">{language}</span>
        </div>
        <button onClick={handleCopy} className="modern-copy-btn">
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="code-pre-element">
        <code className="code-content-element">{cleanCode}</code>
      </pre>
    </div>
  );
}

export default function DocumentationViewer() {
  const [activeDocId, setActiveDocId] = useState('platform-overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCodeTab, setSelectedCodeTab] = useState('');
  const [feedbackGiven, setFeedbackGiven] = useState(null);

  const searchInputRef = useRef(null);

  const currentDoc = DOCS_DATA[activeDocId] || DOCS_DATA['platform-overview'];

  // Handle active code tab default
  useEffect(() => {
    if (currentDoc.codeTabs) {
      setSelectedCodeTab(Object.keys(currentDoc.codeTabs)[0]);
    } else {
      setSelectedCodeTab('');
    }
    setFeedbackGiven(null);
  }, [activeDocId]);

  // Handle Ctrl+K / Cmd+K search shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus search input when modal opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Search filter
  const query = searchQuery.trim().toLowerCase();
  const searchResults = query
    ? Object.values(DOCS_DATA).filter((doc) =>
        doc.title.toLowerCase().includes(query) ||
        doc.subtitle.toLowerCase().includes(query) ||
        doc.content.toLowerCase().includes(query)
      )
    : [];

  const handleSelectDoc = (id) => {
    setActiveDocId(id);
    setIsSearchOpen(false);
    setSearchQuery('');
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToAnchor = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="modern-docs-root">
      {/* Top Banner / Navigation Bar */}
      <header className="docs-topbar">
        <div className="docs-topbar-inner">
          <div className="docs-topbar-left">
            <button
              className="docs-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="docs-brand">
              <span className="docs-brand-logo">⚡ ThingsNXT</span>
              <span className="docs-brand-badge">Docs</span>
            </div>
            <div className="docs-status-pill">
              <span className="status-dot"></span>
              <span>API Gateway v1.0.4 Online</span>
            </div>
          </div>

          <div className="docs-topbar-center">
            <button className="docs-search-trigger" onClick={() => setIsSearchOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>Search documentation...</span>
              <kbd className="docs-search-kbd">⌘K</kbd>
            </button>
          </div>

          <div className="docs-topbar-right">
            <div className="docs-quick-links">
              <Link
                href="/dashboard"
                className="docs-top-tab"
                style={{
                  backgroundColor: "#FFF7ED",
                  color: "#EA580C",
                  border: "1px solid #FFEDD5",
                  fontWeight: "700",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>← Dashboard</span>
              </Link>
              <button
                className={`docs-top-tab ${activeDocId === 'mqtt-guide' ? 'active' : ''}`}
                onClick={() => handleSelectDoc('mqtt-guide')}
              >
                MQTT (1883)
              </button>
              <button
                className={`docs-top-tab ${activeDocId === 'http-rest-guide' ? 'active' : ''}`}
                onClick={() => handleSelectDoc('http-rest-guide')}
              >
                HTTP (4001)
              </button>
              <button
                className={`docs-top-tab ${activeDocId === 'websocket-streaming' ? 'active' : ''}`}
                onClick={() => handleSelectDoc('websocket-streaming')}
              >
                WebSockets
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container: 3-column layout (Sidebar, Main Content, TOC) */}
      <div className="docs-main-layout">
        {/* Left Sidebar */}
        <aside className={`docs-left-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-filter-wrapper">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Quick filter..."
              className="sidebar-filter-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <nav className="docs-sidebar-nav">
            {DOCS_CATEGORIES.map((category) => {
              const items = category.items.filter((item) => {
                if (!query) return true;
                const doc = DOCS_DATA[item.id];
                return (
                  doc.title.toLowerCase().includes(query) ||
                  doc.subtitle.toLowerCase().includes(query) ||
                  doc.content.toLowerCase().includes(query)
                );
              });

              if (items.length === 0) return null;

              return (
                <div key={category.id} className="sidebar-section">
                  <div className="sidebar-section-header">
                    <span className="sidebar-section-icon">
                      <CategoryIcon type={category.icon} />
                    </span>
                    <span className="sidebar-section-title">{category.name}</span>
                  </div>
                  <ul className="sidebar-section-items">
                    {items.map((item) => {
                      const isActive = activeDocId === item.id;
                      return (
                        <li key={item.id}>
                          <button
                            className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
                            onClick={() => handleSelectDoc(item.id)}
                          >
                            <span className="nav-link-indicator"></span>
                            <span className="nav-link-text">{item.title}</span>
                            <span className="nav-link-badge">{item.badge}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Center Main Article */}
        <main className="docs-center-content">
          <div className="docs-article-wrapper">
            {/* Breadcrumb Trail */}
            <div className="docs-breadcrumb-bar">
              <span>Docs</span>
              <span className="breadcrumb-sep">/</span>
              <span>{currentDoc.category}</span>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-current">{currentDoc.title}</span>
            </div>

            {/* Document Header */}
            <header className="docs-article-header">
              <div className="docs-header-badge-row">
                <span className="docs-article-badge">{currentDoc.badge}</span>
                <span className="docs-updated-date">Updated: {currentDoc.lastUpdated}</span>
              </div>
              <h1 className="docs-title-main">{currentDoc.title}</h1>
              <p className="docs-subtitle-main">{currentDoc.subtitle}</p>
            </header>

            {/* Multi-Language Code Tabs (if applicable) */}
            {currentDoc.codeTabs && (
              <div className="code-tabs-container">
                <div className="code-tabs-bar">
                  <div className="code-tabs-list">
                    {Object.entries(currentDoc.codeTabs).map(([key, tab]) => (
                      <button
                        key={key}
                        className={`code-tab-btn ${selectedCodeTab === key ? 'active' : ''}`}
                        onClick={() => setSelectedCodeTab(key)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
                {selectedCodeTab && currentDoc.codeTabs[selectedCodeTab] && (
                  <CodeSnippet
                    code={currentDoc.codeTabs[selectedCodeTab].code}
                    language={currentDoc.codeTabs[selectedCodeTab].language}
                  />
                )}
              </div>
            )}

            {/* Markdown Body */}
            <div className="docs-markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code: ({ node, inline, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children || '').replace(/\n$/, '');

                    // Multi-line code block or explicit language
                    if (!inline && (match || codeString.includes('\n'))) {
                      return (
                        <CodeSnippet
                          code={codeString}
                          language={match ? match[1] : 'json'}
                        />
                      );
                    }

                    // Inline code snippet
                    return (
                      <code className="inline-code-pill" {...props}>
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => <>{children}</>,
                }}
              >
                {currentDoc.content}
              </ReactMarkdown>
            </div>

            {/* Previous and Next Navigation Footer */}
            <div className="docs-pager-nav">
              {currentDoc.prev ? (
                <button
                  className="pager-btn pager-prev"
                  onClick={() => handleSelectDoc(currentDoc.prev.id)}
                >
                  <span className="pager-direction">← Previous</span>
                  <span className="pager-title">{currentDoc.prev.title}</span>
                </button>
              ) : (
                <div />
              )}

              {currentDoc.next ? (
                <button
                  className="pager-btn pager-next"
                  onClick={() => handleSelectDoc(currentDoc.next.id)}
                >
                  <span className="pager-direction">Next →</span>
                  <span className="pager-title">{currentDoc.next.title}</span>
                </button>
              ) : (
                <div />
              )}
            </div>

            {/* Helpfulness Feedback Widget */}
            <div className="docs-feedback-card">
              <span className="feedback-question">Was this page helpful?</span>
              <div className="feedback-actions">
                <button
                  className={`feedback-btn ${feedbackGiven === 'yes' ? 'selected' : ''}`}
                  onClick={() => setFeedbackGiven('yes')}
                >
                  👍 Yes
                </button>
                <button
                  className={`feedback-btn ${feedbackGiven === 'no' ? 'selected' : ''}`}
                  onClick={() => setFeedbackGiven('no')}
                >
                  👎 No
                </button>
              </div>
              {feedbackGiven && (
                <span className="feedback-thanks">Thank you for your feedback!</span>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar: "On this page" TOC */}
        <aside className="docs-right-toc">
          <div className="toc-sticky-box">
            <h4 className="toc-heading">On this page</h4>
            {currentDoc.toc && currentDoc.toc.length > 0 ? (
              <ul className="toc-list">
                {currentDoc.toc.map((heading) => (
                  <li key={heading.id}>
                    <button
                      className="toc-link"
                      onClick={() => scrollToAnchor(heading.id)}
                    >
                      {heading.title}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="toc-empty">No section anchors</p>
            )}

            <div className="toc-divider" />

            <div className="toc-resources">
              <h5 className="toc-subheading">Quick Tools</h5>
              <a
                href="#interactive-code"
                className="toc-resource-link"
                onClick={() => {
                  if (activeDocId !== 'mqtt-guide') handleSelectDoc('mqtt-guide');
                }}
              >
                <span>⚡</span> ESP32 Firmware Snippet
              </a>
              <a
                href="#single-endpoint"
                className="toc-resource-link"
                onClick={() => {
                  if (activeDocId !== 'http-rest-guide') handleSelectDoc('http-rest-guide');
                }}
              >
                <span>🚀</span> cURL Test Request
              </a>
              <div className="toc-status-card">
                <span className="status-indicator-dot"></span>
                <span>Fastify & MQTT Microservices Operational</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Global Instant Search Modal (Cmd+K / Ctrl+K) */}
      {isSearchOpen && (
        <div className="search-modal-backdrop" onClick={() => setIsSearchOpen(false)}>
          <div className="search-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-input-bar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                className="search-modal-input"
                placeholder="Search across all docs, topics, APIs and firmware..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="search-modal-close" onClick={() => setIsSearchOpen(false)}>
                ESC
              </button>
            </div>

            <div className="search-modal-results">
              {query && searchResults.length > 0 && (
                <div className="search-results-list">
                  {searchResults.map((res) => (
                    <button
                      key={res.id}
                      className="search-result-item"
                      onClick={() => handleSelectDoc(res.id)}
                    >
                      <div className="search-result-category">{res.category}</div>
                      <div className="search-result-title">{res.title}</div>
                      <div className="search-result-subtitle">{res.subtitle}</div>
                    </button>
                  ))}
                </div>
              )}

              {query && searchResults.length === 0 && (
                <div className="search-no-results">
                  <p>No documentation found matching "{searchQuery}"</p>
                  <span>Try searching for "MQTT", "HTTP", "WebSockets", "Workspaces", or "Provisioning"</span>
                </div>
              )}

              {!query && (
                <div className="search-quick-suggestions">
                  <span className="search-suggestion-title">Popular Guides:</span>
                  <div className="search-suggestion-pills">
                    <button onClick={() => handleSelectDoc('mqtt-guide')}>MQTT Protocol (1883)</button>
                    <button onClick={() => handleSelectDoc('http-rest-guide')}>HTTP Ingestion (4001)</button>
                    <button onClick={() => handleSelectDoc('websocket-streaming')}>WebSocket Stream</button>
                    <button onClick={() => handleSelectDoc('workspaces-management')}>Workspaces & RBAC</button>
                    <button onClick={() => handleSelectDoc('automations-rules')}>Automations Engine</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
