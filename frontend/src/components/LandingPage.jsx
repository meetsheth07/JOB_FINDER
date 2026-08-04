import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/* ═══════════════════════════════════════════════════════
   LANDING PAGE
   Dark console landing with self-drawing SVG diagram,
   scroll-driven flow, parallax, staggered reveals.
   ═══════════════════════════════════════════════════════ */

// ── Network Diagram SVG ────────────────────────────────
function NetworkDiagram({ svgRef }) {
  return (
    <svg
      ref={svgRef}
      viewBox="0 0 520 310"
      className="network-diagram"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Connectors drawn BEFORE nodes so nodes sit above */}
      <g className="diagram-connectors">
        {/* Source → Intermediates */}
        <path className="diagram-path-active" data-connector="true"
          d="M 130 80 C 180 80, 200 55, 230 55" />
        <path className="diagram-path-active" data-connector="true"
          d="M 130 80 C 180 80, 200 100, 230 100" />
        <path className="diagram-path-active" data-connector="true"
          d="M 130 80 C 180 80, 200 145, 230 145" />

        {/* Intermediates → Leaves */}
        <path className="diagram-path-active" data-connector="true"
          d="M 340 55 C 370 55, 380 55, 400 55" />
        <path className="diagram-path-active" data-connector="true"
          d="M 340 100 C 370 100, 380 130, 400 130" />
        <path className="diagram-path-active" data-connector="true"
          d="M 340 145 C 370 145, 380 205, 400 205" />

        {/* Inactive/alternate paths */}
        <path className="diagram-path-inactive"
          d="M 340 55 C 370 55, 380 130, 400 130" />
        <path className="diagram-path-inactive"
          d="M 340 100 C 370 100, 380 205, 400 205" />
      </g>

      {/* Source node */}
      <g>
        <rect className="diagram-node-rect" x="20" y="58" width="110" height="44" />
        <text className="diagram-node-label" x="75" y="74" textAnchor="middle">QUERY</text>
        <text className="diagram-node-value" x="75" y="92" textAnchor="middle">job_search</text>
      </g>

      {/* Intermediate nodes */}
      <g>
        <rect className="diagram-node-rect" x="230" y="33" width="110" height="44" />
        <text className="diagram-node-label" x="285" y="49" textAnchor="middle">INDEED</text>
        <text className="diagram-node-value" x="285" y="67" textAnchor="middle" data-readout="indeed">247</text>
      </g>
      <g>
        <rect className="diagram-node-rect" x="230" y="78" width="110" height="44" />
        <text className="diagram-node-label" x="285" y="94" textAnchor="middle">LINKEDIN</text>
        <text className="diagram-node-value" x="285" y="112" textAnchor="middle" data-readout="linkedin">183</text>
      </g>
      <g>
        <rect className="diagram-node-rect" x="230" y="123" width="110" height="44" />
        <text className="diagram-node-label" x="285" y="139" textAnchor="middle">GOOGLE</text>
        <text className="diagram-node-value" x="285" y="157" textAnchor="middle" data-readout="google">156</text>
      </g>

      {/* Leaf nodes */}
      <g>
        <rect className="diagram-node-rect" x="400" y="33" width="100" height="44" />
        <text className="diagram-node-label" x="450" y="49" textAnchor="middle">FILTER</text>
        <text className="diagram-node-value" x="450" y="67" textAnchor="middle" data-readout="filter">412</text>
      </g>
      <g>
        <rect className="diagram-node-rect" x="400" y="108" width="100" height="44" />
        <text className="diagram-node-label" x="450" y="124" textAnchor="middle">RANK</text>
        <text className="diagram-node-value" x="450" y="142" textAnchor="middle" data-readout="rank">386</text>
      </g>
      <g>
        <rect className="diagram-node-rect" x="400" y="183" width="100" height="44" />
        <text className="diagram-node-label" x="450" y="199" textAnchor="middle">STORE</text>
        <text className="diagram-node-value" x="450" y="217" textAnchor="middle" data-readout="store">371</text>
      </g>

      {/* Pipeline summary bar */}
      <g>
        <rect className="diagram-node-rect" x="120" y="250" width="280" height="40" style={{ fill: 'rgba(240,164,34,.06)', stroke: 'rgba(240,164,34,.2)' }} />
        <text className="diagram-node-label" x="260" y="267" textAnchor="middle" style={{ fill: '#F0A422' }}>PIPELINE THROUGHPUT</text>
        <text className="diagram-node-value" x="260" y="283" textAnchor="middle" data-readout="throughput">586 jobs/cycle</text>
      </g>
    </svg>
  );
}


export default function LandingPage() {
  const navigate = useNavigate();
  const svgRef = useRef(null);
  const heroRef = useRef(null);
  const consoleRef = useRef(null);
  const sectionsRef = useRef([]);
  const drawComplete = useRef(false);
  const connectorPathsRef = useRef([]);

  // ── Motion check ──────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!mq.matches) {
      document.documentElement.classList.add('has-motion');
    }
    return () => {
      document.documentElement.classList.remove('has-motion');
    };
  }, []);

  // ── Self-drawing diagram ──────────────────────────────
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const connectors = svg.querySelectorAll('[data-connector="true"]');
    connectorPathsRef.current = Array.from(connectors);

    connectors.forEach((path) => {
      const len = path.getTotalLength();
      path.style.strokeDasharray = `${len}`;
      path.style.strokeDashoffset = `${len}`;
      path.style.transition = 'none';
    });

    // Force reflow
    svg.getBoundingClientRect();

    // Trigger the draw animation with stagger
    const drawDelay = 600; // ms
    const stagger = 120; // ms

    connectors.forEach((path, i) => {
      setTimeout(() => {
        path.style.transition = `stroke-dashoffset .8s cubic-bezier(.4,0,.2,1)`;
        path.style.strokeDashoffset = '0';
      }, drawDelay + i * stagger);
    });

    // After draw completes, hand over to scroll-driven flow
    const totalDrawTime = drawDelay + connectors.length * stagger + 800;
    const handoverTimer = setTimeout(() => {
      connectors.forEach((path) => {
        const len = path.getTotalLength();
        path.style.transition = 'none';
        path.style.strokeDasharray = '10 14';
        path.style.strokeDashoffset = '0';
        path.dataset.pathLength = len;
      });
      drawComplete.current = true;
    }, totalDrawTime);

    return () => clearTimeout(handoverTimer);
  }, []);

  // ── Scroll-driven animations ──────────────────────────
  const onScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;

    // Parallax on hero console (travels ~190px with slight scale-down)
    if (consoleRef.current) {
      const progress = Math.min(scrollY / vh, 1);
      const translateY = progress * 190;
      const scale = 1 - progress * 0.05;
      consoleRef.current.style.transform = `translateY(${translateY}px) scale(${scale})`;
    }

    // Hero copy lifts
    if (heroRef.current) {
      const copyStack = heroRef.current.querySelector('.hero-copy');
      if (copyStack) {
        const progress = Math.min(scrollY / vh, 1);
        copyStack.style.transform = `translateY(${-progress * 40}px)`;
      }
    }

    // Drive diagram flow from scroll position
    if (drawComplete.current && connectorPathsRef.current.length > 0) {
      connectorPathsRef.current.forEach((path) => {
        // Cycle the dash pattern based on scroll
        path.style.strokeDashoffset = `${-(scrollY * 0.3) % 100}`;
      });
    }

    // Update telemetry readouts based on scroll
    const svg = svgRef.current;
    if (svg) {
      const scrollFactor = Math.min(scrollY / 600, 1);
      const base = { indeed: 247, linkedin: 183, google: 156, filter: 412, rank: 386, store: 371 };
      const readouts = svg.querySelectorAll('[data-readout]');
      readouts.forEach((el) => {
        const key = el.dataset.readout;
        if (key === 'throughput') {
          const val = Math.round(586 + scrollFactor * 42);
          el.textContent = `${val} jobs/cycle`;
        } else if (base[key] !== undefined) {
          const val = Math.round(base[key] + scrollFactor * (base[key] * 0.12));
          el.textContent = val;
        }
      });
    }

    // Drift on cards, headings, rows at different rates
    const driftEls = document.querySelectorAll('[data-drift]');
    driftEls.forEach((el) => {
      const rate = parseFloat(el.dataset.drift) || 0.03;
      const rect = el.getBoundingClientRect();
      const elCenter = rect.top + rect.height / 2;
      const offset = (elCenter - vh / 2) * rate;
      el.style.transform = `translateY(${offset}px)`;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  // ── Intersection Observer for reveals ─────────────────
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            // Stagger children
            const children = el.querySelectorAll('.reveal-card, .reveal-pill');
            children.forEach((child, i) => {
              const isCard = child.classList.contains('reveal-card');
              const stagger = isCard ? 0.06 : 0.12;
              child.style.transitionDelay = `${i * stagger}s`;
              // Use requestAnimationFrame to ensure the delay is applied
              requestAnimationFrame(() => {
                child.classList.add('revealed');
              });
            });
            el.classList.add('revealed');
            observer.unobserve(el); // Fire once, never reverse
          }
        });
      },
      { threshold: 0.15 }
    );

    // Observe all reveal blocks
    const blocks = document.querySelectorAll('.reveal-block');
    blocks.forEach((b) => observer.observe(b));

    return () => observer.disconnect();
  }, []);

  const goAuth = () => navigate('/auth');

  return (
    <div className="landing">
      {/* ── Console Chrome Nav ──────────────────────────── */}
      <nav className="console-nav">
        <div className="console-nav-brand">
          <div className="console-nav-mark" />
          <span className="console-nav-wordmark">JOB_FINDER</span>
        </div>

        <div className="console-nav-tabs">
          <button className="console-nav-tab active">SEARCH</button>
          <button className="console-nav-tab">SOURCES</button>
          <button className="console-nav-tab">STATS</button>
          <button className="console-nav-tab">API</button>
        </div>

        <div className="console-nav-actions">
          <button className="btn-ghost" onClick={goAuth}>SIGN IN</button>
          <button className="btn-accent" onClick={goAuth}>GET STARTED</button>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="hero" ref={heroRef}>
        <div className="hero-copy">
          <div className="hero-status reveal-block revealed">
            <span className="hero-status-dot" />
            SYSTEM ONLINE
          </div>

          <h1 className="hero-headline reveal-block revealed">
            Intelligent<br />
            <span className="accent">Job Discovery</span><br />
            Engine
          </h1>

          <p className="hero-lede reveal-block revealed">
            Aggregate, filter and rank job listings from multiple
            sources in real time. One search, every major platform,
            delivered to your console.
          </p>

          <div className="hero-buttons reveal-block revealed">
            <button className="btn-accent" onClick={goAuth}
              style={{ padding: '12px 28px', fontSize: '11px' }}>
              START SEARCHING
            </button>
            <button className="btn-ghost" onClick={goAuth}
              style={{ padding: '12px 20px', fontSize: '11px' }}>
              VIEW DOCS
            </button>
          </div>

          <div className="hero-pills">
            <span className="hero-pill reveal-pill revealed">
              <strong>8</strong> SOURCES
            </span>
            <span className="hero-pill reveal-pill revealed">
              <strong>24H</strong> CYCLE
            </span>
            <span className="hero-pill reveal-pill revealed">
              <strong>586</strong> JOBS/RUN
            </span>
          </div>
        </div>

        {/* Console Panel */}
        <div className="hero-console-wrapper" ref={consoleRef}>
          <div className="hero-console">
            <div className="console-titlebar">
              <div className="console-titlebar-left">
                <div className="console-status-dot" />
                <span className="console-titlebar-caption">job_pipeline.status</span>
              </div>
              <span className="console-titlebar-right">REFRESH: 15S</span>
            </div>

            <div className="console-body">
              <NetworkDiagram svgRef={svgRef} />
            </div>

            <div className="console-footer">
              <div className="console-readout">
                <span className="console-readout-label">LATENCY</span>
                <span className="console-readout-value" data-readout-footer="latency">42ms</span>
              </div>
              <div className="console-readout">
                <span className="console-readout-label">THROUGHPUT</span>
                <span className="console-readout-value" data-readout-footer="throughput">586/cyc</span>
              </div>
              <div className="console-readout">
                <span className="console-readout-label">SOURCES</span>
                <span className="console-readout-value">8</span>
              </div>
              <div className="console-readout">
                <span className="console-readout-label">QUEUE</span>
                <span className="console-readout-value" data-readout-footer="queue">12</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 01: Multi-Source Aggregation ────────── */}
      <section className="landing-section reveal-block">
        <div className="section-index">
          <span className="section-index-label">01</span>
          <div className="section-index-rule" />
        </div>

        <h2 className="section-headline" data-drift="0.02">
          Multi-Source<br />Aggregation
        </h2>
        <p className="section-lede">
          A single query fans out across every major job board.
          Results are deduplicated, normalised and merged into
          one coherent feed — no tab-switching required.
        </p>

        <div className="feature-grid">
          <div className="feature-card reveal-card">
            <div className="feature-card-key">SOURCES</div>
            <div className="feature-card-value">8</div>
            <div className="feature-card-title">Parallel Crawlers</div>
            <div className="feature-card-desc">
              Indeed, LinkedIn, Google Jobs, Glassdoor, ZipRecruiter, Naukri, Bayt and BDJobs — all queried simultaneously.
            </div>
          </div>
          <div className="feature-card reveal-card">
            <div className="feature-card-key">DEDUP</div>
            <div className="feature-card-value">94%</div>
            <div className="feature-card-title">Overlap Reduction</div>
            <div className="feature-card-desc">
              Identical listings posted on multiple boards are caught and merged, so every result is unique.
            </div>
          </div>
          <div className="feature-card reveal-card">
            <div className="feature-card-key">LATENCY</div>
            <div className="feature-card-value">&lt;3s</div>
            <div className="feature-card-title">Average Response</div>
            <div className="feature-card-desc">
              Results are streamed back as they arrive — you see matches before the last source has even responded.
            </div>
          </div>
          <div className="feature-card reveal-card">
            <div className="feature-card-key">REGIONS</div>
            <div className="feature-card-value">9</div>
            <div className="feature-card-title">Country Coverage</div>
            <div className="feature-card-desc">
              USA, India, UK, Canada, Australia, Germany, Singapore, UAE and Saudi Arabia supported out of the box.
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 02: Pipeline Processing ────────────── */}
      <section className="landing-section reveal-block">
        <div className="section-index">
          <span className="section-index-label">02</span>
          <div className="section-index-rule" />
        </div>

        <h2 className="section-headline" data-drift="0.03">
          Pipeline<br />Processing
        </h2>
        <p className="section-lede">
          Every listing passes through a structured pipeline:
          fetch, parse, normalise, filter, rank and persist.
          Each stage is instrumented and observable.
        </p>

        <div className="hairline-rows">
          <div className="hairline-row reveal-card">
            <span className="hairline-row-label">FETCH</span>
            <span className="hairline-row-desc">
              Concurrent requests across all selected job boards with automatic retry and rate limiting.
            </span>
            <span className="hairline-row-value" data-drift="0.01">586</span>
          </div>
          <div className="hairline-row reveal-card">
            <span className="hairline-row-label">PARSE</span>
            <span className="hairline-row-desc">
              Raw HTML and API responses normalised into a consistent schema — title, company, location, salary, description.
            </span>
            <span className="hairline-row-value" data-drift="0.01">572</span>
          </div>
          <div className="hairline-row reveal-card">
            <span className="hairline-row-label">FILTER</span>
            <span className="hairline-row-desc">
              Duplicates, expired listings and low-relevance results removed before they reach the database.
            </span>
            <span className="hairline-row-value" data-drift="0.01">412</span>
          </div>
          <div className="hairline-row reveal-card">
            <span className="hairline-row-label">RANK</span>
            <span className="hairline-row-desc">
              Results sorted by relevance, recency and salary data availability. Most actionable listings surface first.
            </span>
            <span className="hairline-row-value" data-drift="0.01">386</span>
          </div>
          <div className="hairline-row reveal-card">
            <span className="hairline-row-label">STORE</span>
            <span className="hairline-row-desc">
              Final results persisted to MongoDB with full metadata — ready for search, filtering and bookmarking.
            </span>
            <span className="hairline-row-value" data-drift="0.01">371</span>
          </div>
        </div>
      </section>

      {/* ── Section 03: Real-Time Intelligence ──────────── */}
      <section className="landing-section reveal-block">
        <div className="section-index">
          <span className="section-index-label">03</span>
          <div className="section-index-rule" />
        </div>

        <h2 className="section-headline" data-drift="0.04">
          Real-Time<br />Intelligence
        </h2>
        <p className="section-lede">
          Every pipeline run produces live telemetry. Monitor
          source health, throughput and data quality at a glance
          — the system shows its own state.
        </p>

        <div className="feature-grid">
          <div className="feature-card reveal-card">
            <div className="feature-card-key">CYCLE TIME</div>
            <div className="feature-card-value">24h</div>
            <div className="feature-card-title">Auto-Refresh Window</div>
            <div className="feature-card-desc">
              Configurable search freshness — filter listings by age from the past 24 hours to 7 days.
            </div>
          </div>
          <div className="feature-card reveal-card">
            <div className="feature-card-key">SAVE TTL</div>
            <div className="feature-card-value">72h</div>
            <div className="feature-card-title">Bookmark Lifespan</div>
            <div className="feature-card-desc">
              Saved jobs expire after 3 days with a visible countdown, keeping your shortlist fresh and actionable.
            </div>
          </div>
          <div className="feature-card reveal-card">
            <div className="feature-card-key">RESULTS</div>
            <div className="feature-card-value">5–100</div>
            <div className="feature-card-title">Adjustable Depth</div>
            <div className="feature-card-desc">
              Control how many listings each source returns per query — balance speed against coverage.
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA / Close ────────────────────────────────── */}
      <div className="landing-cta reveal-block">
        <div className="cta-box">
          <div className="cta-wash" />
          <div className="cta-content">
            <h2 className="cta-headline">Ready to aggregate?</h2>
            <p className="cta-fine">
              FREE ACCOUNT · 8 SOURCES · INSTANT RESULTS · BOOKMARK AND TRACK
            </p>
            <div className="cta-buttons">
              <button className="btn-accent" onClick={goAuth}
                style={{ padding: '12px 28px', fontSize: '11px' }}>
                CREATE ACCOUNT
              </button>
              <button className="btn-ghost" onClick={goAuth}
                style={{ padding: '12px 20px', fontSize: '11px' }}>
                SIGN IN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="landing-footer">
        <span className="landing-footer-item">VERSION 1.0.0</span>
        <span className="landing-footer-item">STATUS: OPERATIONAL</span>
        <span className="landing-footer-item">SOURCES: 8</span>
        <span className="landing-footer-item">REGIONS: 9</span>
      </footer>
    </div>
  );
}
