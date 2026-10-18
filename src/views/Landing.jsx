import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, FileUp, Layers, Search, Users } from "lucide-react";
import { signalAPI } from "@/api/signals";
import { useAuth } from "@/lib/AuthContext";
import { setPendingPaper } from "@/lib/pendingPaper";
import { EXAMPLES_COLLECTION, EXAMPLE_ASSETS } from "@/lib/exampleAssets";
import { FLAGSHIP_SIGNAL, MEDIUMS, mediumLabel, outputLabel } from "@/lib/signalOptions";
import PlatformHeader from "@/components/signals/PlatformHeader";
import SignalCard from "@/components/signals/SignalCard";
import MediumIcon from "@/components/signals/MediumIcon";
import CellVideoBackground from "@/components/signals/CellVideoBackground";
import Footer from "@/components/podcast/Footer";

const ease = [0.16, 1, 0.3, 1];

export default function Landing() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const pendingFormat = useRef(null);
  const [file, setFile] = useState(null);
  const [signals, setSignals] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [medium, setMedium] = useState("all");
  const [stats, setStats] = useState(null);
  const [exampleItems, setExampleItems] = useState({});

  useEffect(() => {
    signalAPI.items(EXAMPLES_COLLECTION.slug)
      .then((data) => {
        const byPaper = {};
        for (const item of data.items || []) {
          if (item.status !== "completed" || !item.published) continue;
          const key = `${item.pmid}:${item.medium}`;
          if (!byPaper[key]) byPaper[key] = item;
        }
        setExampleItems(byPaper);
      })
      .catch(() => setExampleItems({}));
  }, []);

  useEffect(() => {
    signalAPI.listPublic()
      .then((data) => setSignals(data.signals || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const firstView = typeof sessionStorage !== "undefined" && !sessionStorage.getItem("nci-digest-view");
    if (firstView) sessionStorage.setItem("nci-digest-view", "1");
    signalAPI.stats(firstView)
      .then((data) => setStats(data.stats || null))
      .catch(() => setStats(null));
  }, []);

  useEffect(() => {
    if (!user) {
      setMine([]);
      return;
    }
    signalAPI.listMine()
      .then((data) => setMine(data.signals || []))
      .catch(() => setMine([]));
  }, [user]);

  useEffect(() => {
    if (location.hash === "#community" && !loading) {
      document.getElementById("community")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.hash, loading]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("upload") !== "1") return undefined;
    fileRef.current?.click();
    navigate("/", { replace: true });
  }, [location.search, navigate]);

  const gallery = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [FLAGSHIP_SIGNAL, ...signals].filter((signal) => {
      if (medium !== "all" && signal.medium !== medium) return false;
      if (!q) return true;
      return [signal.title, signal.description, signal.author?.name, signal.criteria?.keywords, signal.cover?.title]
        .some((value) => value?.toLowerCase().includes(q));
    });
  }, [signals, query, medium]);

  function acceptFile(next) {
    if (!next) return;
    if (next.type && next.type !== "application/pdf" && !next.name?.toLowerCase().endsWith(".pdf")) return;
    setFile(next);
    const format = pendingFormat.current;
    pendingFormat.current = null;
    if (format) goToCollection(next, [format]);
  }

  function goToCollection(pdf, mediums) {
    const title = (pdf.name || "Uploaded paper").replace(/\.pdf$/i, "").replace(/[_-]+/g, " ");
    setPendingPaper({ file: pdf, title, mediums });
    const next = "/signals/new";
    navigate(user ? next : `/login?next=${encodeURIComponent(next)}`);
  }

  function onFormatClick(id) {
    if (file) {
      goToCollection(file, [id]);
      return;
    }
    pendingFormat.current = id;
    fileRef.current?.click();
  }

  return (
    <div className="min-h-screen bg-alabaster">
      <section id="convert" className="relative min-h-screen flex flex-col">
        <CellVideoBackground />
        <PlatformHeader overlay onUpload={() => fileRef.current?.click()} />
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={(e) => acceptFile(e.target.files?.[0] || null)}
        />

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 md:px-16 pt-6 pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease }}
            className="max-w-4xl mx-auto space-y-5"
          >
            <p className="font-mono text-[11px] tracking-[0.4em] uppercase text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">NCI Digest</p>
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.08] italic drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)]">
              Upload a paper. 
            </h1>
            <p className="font-body text-base md:text-lg text-white leading-relaxed max-w-2xl mx-auto drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              Turn NCI-funded publications into podcasts, TED-style talks, slide decks with a narrated video.
              Every explainer provides information about where to find the original data and tools used in each study.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease }}
            className="mt-12 flex flex-col items-center"
          >
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                acceptFile(e.dataTransfer.files?.[0] || null);
              }}
              className="group flex flex-col items-center justify-center gap-4 rounded-[2.5rem] border-2 border-dashed border-white/70 bg-black/35 px-16 py-12 backdrop-blur-md hover:border-white hover:bg-black/50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-4 focus:ring-offset-[#06101c]"
              aria-label="Upload a paper PDF"
            >
              <FileUp className="w-32 h-32 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" strokeWidth={1.25} />
              <span className="font-mono text-xs tracking-[0.28em] uppercase text-white">
                {file ? file.name : "Upload a paper"}
              </span>
              <span className="font-body text-sm text-white">PDF, then pick a format</span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease }}
            className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-5xl"
          >
            {MEDIUMS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onFormatClick(m.id)}
                className="flex flex-col items-center text-center rounded-3xl border border-white/50 bg-black/40 px-4 py-8 backdrop-blur-md hover:bg-white hover:text-[#06101c] transition-colors focus:outline-none focus:ring-2 focus:ring-white group"
              >
                <MediumIcon medium={m.id} className="w-20 h-20 text-white group-hover:text-cobalt drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
                <p className="font-heading text-lg md:text-xl font-semibold text-white group-hover:text-graphite mt-5">
                  {m.action}
                </p>
                <p className="font-body text-xs text-white group-hover:text-graphite/70 mt-2 leading-relaxed">
                  {m.blurb}
                </p>
              </button>
            ))}
          </motion.div>

          <p className="relative z-10 mt-8 font-body text-sm text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            After picking the explainer format, you will be able to add it to collections.
            You can generate more than one type of explainer format from the same publication.
          </p>
          <a
            href="#examples"
            className="relative z-10 mt-6 font-mono text-xs uppercase tracking-widest text-white hover:text-white/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
          >
            See example explainers
          </a>
        </div>
      </section>

      {mine.length > 0 && (
        <section className="px-6 md:px-16 py-16 max-w-7xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.4em] uppercase text-cobalt mb-6">Your collections</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mine.map((signal, i) => (
              <SignalCard key={signal.id} signal={signal} index={i} />
            ))}
          </div>
        </section>
      )}

      <section id="examples" className="px-6 md:px-16 py-16 md:py-24 max-w-7xl mx-auto scroll-mt-8">
        <div className="mb-12 max-w-3xl">
          <p className="font-mono text-[11px] tracking-[0.4em] uppercase text-cobalt mb-3">Examples</p>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-graphite italic">
            NCI-supported papers and their public data
          </h2>
          <p className="font-body text-base text-graphite/50 mt-4">
            A selection of explainers created from published studies supported by the National Cancer
            Institute (NCI). Each explainer provides links to the datasets associated with the publication
            in the Genomic Data Commons (GDC), the Gene Expression Omnibus (GEO), dbGaP, and related public
            repositories.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EXAMPLE_ASSETS.map((asset, i) => (
            <ExampleAssetCard
              key={asset.id}
              asset={asset}
              index={i}
              item={exampleItems[`${asset.pmid}:${asset.medium}`]}
            />
          ))}
        </div>
      </section>

      <section id="community" className="px-6 md:px-16 py-16 md:py-24 max-w-7xl mx-auto scroll-mt-8">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div>
            <p className="font-mono text-[11px] tracking-[0.4em] uppercase text-cobalt mb-3">Gallery</p>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-graphite italic">Community collections</h2>
            <p className="font-body text-base text-graphite/50 mt-4 max-w-lg">
              Public collections from other researchers, each focused on a corner of cancer research.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center border-b border-graphite/15 pb-1 focus-within:border-cobalt transition-colors">
              <Search className="w-4 h-4 text-graphite/30 mr-2" />
              <input
                type="text"
                placeholder="Search collections…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-transparent font-body text-sm text-graphite placeholder:text-graphite/30 outline-none py-2 w-48"
              />
            </div>
            <select
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              className="font-mono text-xs uppercase tracking-widest bg-transparent border-b border-graphite/15 py-2 outline-none"
            >
              <option value="all">All formats</option>
              {MEDIUMS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Collections created", value: stats?.collections, icon: Layers },
            { label: "Papers uploaded", value: stats?.papers, icon: FileUp },
            { label: "Site views", value: stats?.views, icon: Eye },
            { label: "Users", value: stats?.users, icon: Users },
          ].map((metric) => (
            <MetricStat key={metric.label} {...metric} />
          ))}
        </div>

        {error && <p className="font-mono text-xs text-red-500 mb-6">{error}</p>}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-graphite/10 border-t-cobalt rounded-full animate-spin" />
          </div>
        ) : gallery.length === 0 ? (
          <p className="font-mono text-[11px] tracking-widest uppercase text-graphite/40 py-24 text-center">
            No matching collections
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.map((signal, i) => (
              <SignalCard key={signal.slug} signal={signal} index={i} />
            ))}
          </div>
        )}
      </section>

      <Footer platform />
    </div>
  );
}

function MetricStat({ label, value, icon: Icon }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.45 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || typeof value !== "number") return undefined;
    if (value <= 0) {
      setShown(0);
      return undefined;
    }
    const started = performance.now();
    const duration = 1600;
    let frame;
    const tick = (now) => {
      const t = Math.min(1, (now - started) / duration);
      const eased = 1 - (1 - t) ** 5;
      setShown(Math.round(value * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, value]);

  return (
    <div ref={ref} className="rounded-xl border border-graphite/10 bg-white px-5 py-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="font-mono text-[10px] tracking-widest uppercase text-graphite/40">{label}</p>
        <Icon className="w-4 h-4 text-cobalt" />
      </div>
      <p className="font-heading text-3xl md:text-4xl font-bold text-graphite tabular-nums">
        {typeof value === "number" ? shown.toLocaleString() : "—"}
      </p>
    </div>
  );
}

function ExampleAssetCard({ asset, index, item }) {
  const stretched = "after:absolute after:inset-0 after:rounded-xl focus:outline-none";
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: Math.min(index, 8) * 0.05, ease }}
      className="group relative flex h-full flex-col rounded-xl border border-graphite/10 bg-white p-6 transition-colors hover:border-cobalt/40 focus-within:border-cobalt/40"
    >
      <div className="flex items-center justify-between gap-3 mb-5">
        <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase text-cobalt">
          <MediumIcon medium={asset.medium} className="w-4 h-4" />
          {mediumLabel(asset.medium)}
        </span>
        <span className="px-2 py-1 rounded-full border border-mint/30 font-mono text-[9px] tracking-widest uppercase text-mint">
          Example
        </span>
      </div>
      <h3 className="font-heading text-xl font-semibold text-graphite leading-snug group-hover:text-cobalt transition-colors">
        {item ? (
          <Link to={`/signals/${EXAMPLES_COLLECTION.slug}/items/${item.id}`} className={stretched}>
            {asset.title}
          </Link>
        ) : (
          <a href={asset.paper_url} target="_blank" rel="noopener noreferrer" className={stretched}>
            {asset.title}
          </a>
        )}
      </h3>
      <p className="font-body text-xs text-graphite/45 mt-2 line-clamp-2">{asset.paper_title}</p>
      <p className="font-body text-sm text-graphite/55 leading-relaxed mt-3">{asset.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {asset.outputs.map((output) => (
          <a
            key={`${output.type}-${output.id}`}
            href={output.url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 px-2 py-0.5 rounded-full border border-mint/30 font-mono text-[9px] uppercase tracking-wider text-mint hover:border-mint"
          >
            {outputLabel(output)}
          </a>
        ))}
      </div>
      <div className="mt-auto pt-5 flex items-center justify-between">
        <span className="font-mono text-[11px] text-graphite/45">{asset.author}</span>
        <span className="font-mono text-[11px] text-graphite/35">
          {item ? item.duration || asset.duration : "Read paper ↗"}
        </span>
      </div>
    </motion.article>
  );
}
