import { motion } from "motion/react";
import { 
  ArrowUpRight, 
  CheckCircle2, 
  CreditCard, 
  Layout, 
  Plus, 
  ShieldCheck, 
  Clock, 
  MessageSquare, 
  TrendingUp,
  Smartphone,
  Zap,
  ChevronRight,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import type { LeadFieldsInput } from "../lib/leadValidation";
import {
  getEmailWarning,
  getPhoneWarning,
  normalizeIndianPhoneForSubmit,
  validateLeadForm,
} from "../lib/leadValidation";

const BRAND_COLOR = "#2D5ED3";
const BRAND_COLOR_LIGHT = "#3A78F2";
const BRAND_GRADIENT = `linear-gradient(135deg, ${BRAND_COLOR}, ${BRAND_COLOR_LIGHT})`;

type LeadFields = LeadFieldsInput;

const emptyLead: LeadFields = {
  name: "",
  email: "",
  phone: "",
  telegram: "",
  business: "",
  why: "",
};

const MODAL_FORM_FIELDS: Array<{
  key: keyof LeadFields;
  label: string;
  placeholder: string;
  type: string;
  full?: boolean;
  maxLength?: number;
  inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";
}> = [
  {
    key: "name",
    label: "Name",
    placeholder: "Your full name",
    type: "text",
    maxLength: 200,
  },
  {
    key: "email",
    label: "Email",
    placeholder: "you@company.com",
    type: "email",
    maxLength: 254,
  },
  {
    key: "phone",
    label: "Phone",
    placeholder: "+1, +44, +971, +91…",
    type: "tel",
    maxLength: 28,
    inputMode: "tel",
  },
  {
    key: "telegram",
    label: "Telegram / WhatsApp",
    placeholder: "@username",
    type: "text",
    maxLength: 300,
  },
  {
    key: "business",
    label: "What's your current business?",
    placeholder: "e.g. Affiliate, Broker, Fintech...",
    type: "text",
    full: true,
    maxLength: 4000,
  },
  {
    key: "why",
    label: "Why do you want to launch?",
    placeholder: "e.g. New revenue stream, monetize traffic...",
    type: "text",
    full: true,
    maxLength: 4000,
  },
];

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [contactLead, setContactLead] = useState<LeadFields>({ ...emptyLead });
  const [contactConsent, setContactConsent] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const [modalLead, setModalLead] = useState<LeadFields>({ ...emptyLead });
  const [modalConsent, setModalConsent] = useState(false);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (isModalOpen) {
      setModalSuccess(false);
      setModalError(null);
    }
  }, [isModalOpen]);

  async function submitLead(
    fields: LeadFields,
    consent: boolean,
    source: "contact-section" | "modal",
    opts: {
      setSubmitting: (v: boolean) => void;
      setSuccess: (v: boolean) => void;
      setError: (v: string | null) => void;
    }
  ) {
    opts.setError(null);
    opts.setSuccess(false);
    if (!consent) {
      opts.setError("Please accept the terms to continue.");
      return;
    }
    if (!fields.name.trim() || !fields.email.trim()) {
      opts.setError("Name and email are required.");
      return;
    }
    const validationError = validateLeadForm(fields);
    if (validationError) {
      opts.setError(validationError);
      return;
    }
    opts.setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          phone:
            normalizeIndianPhoneForSubmit(fields.phone) ||
            fields.phone.trim().slice(0, 56),
          consent: true,
          source,
        }),
      });
      const raw = await res.text();
      let data: { error?: string } = {};
      try {
        data = JSON.parse(raw) as { error?: string };
      } catch {
        /* non-JSON body (e.g. 404 HTML) */
      }
      if (!res.ok) {
        console.error("[NEXA lead form]", res.status, data, raw.slice(0, 500));
        opts.setError(
          "Something went wrong. Please try again in a moment."
        );
        return;
      }
      opts.setSuccess(true);
      if (source === "contact-section") {
        setContactLead({ ...emptyLead });
        setContactConsent(false);
      } else {
        setModalLead({ ...emptyLead });
        setModalConsent(false);
      }
    } catch (e) {
      console.error("[NEXA lead form] network", e);
      opts.setError(
        "Something went wrong. Please check your connection and try again."
      );
    } finally {
      opts.setSubmitting(false);
    }
  }

  const navLinks = [
    { name: "Benefits", href: "#benefits" },
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
  ];

  const contactEmailWarning = getEmailWarning(contactLead.email);
  const modalEmailWarning = getEmailWarning(modalLead.email);
  const contactPhoneWarning = getPhoneWarning(contactLead.phone);
  const modalPhoneWarning = getPhoneWarning(modalLead.phone);

  const floatingLogos = [
    {
      src: "/logos/Bitcoin-Logo.png",
      pos: "top-[6%] left-[2%] md:top-[24%] md:left-[22%]",
      name: "Bitcoin",
    },
    {
      src: "/logos/solana-sol-icon.png",
      pos: "top-[2%] left-[26%] md:top-[14%] md:left-[38%]",
      name: "Solana",
    },
    {
      src: "/logos/au.png",
      pos: "top-[2%] right-[26%] md:top-[14%] md:right-[38%]",
      name: "Gold",
    },
    {
      src: "/logos/tesla.png",
      pos: "top-[6%] right-[2%] md:top-[24%] md:right-[22%]",
      name: "Tesla",
    },
    {
      src: "/logos/nvidia_logo_icon_169902.webp",
      pos: "bottom-[28%] left-[2%] md:bottom-[26%] md:left-[22%]",
      name: "NVIDIA",
    },
    {
      src: "/logos/14446160.png",
      pos: "bottom-[28%] right-[2%] md:bottom-[26%] md:right-[22%]",
      name: "Market",
    },
    {
      src: "/logos/747.png",
      pos: "bottom-[6%] left-[26%] md:bottom-[12%] md:left-[38%]",
      name: "Finance",
    },
    {
      src: "/logos/trading-candle.webp",
      pos: "bottom-[6%] right-[26%] md:bottom-[12%] md:right-[38%]",
      name: "Trading",
    },
  ];

  const faqs = [
    {
      q: "How fast can we launch?",
      a: "We can take your brand live in as little as 7 business days. Our team handles the technical setup, legal onboarding, and domain configuration while you focus on your marketing strategy."
    },
    {
      q: "Do I need a license?",
      a: "No. We provide an 'Un-Licensed' model where you can operate under our established legal umbrella. This bypasses the typical 6-12 month regulatory wait times and heavy capital requirements."
    },
    {
      q: "What payment systems are supported?",
      a: "The platform is ready out-of-the-box with VISA, MC, GPay, Apple Pay. We also offer native crypto processing for BTC, SOL, and ETH, as well as high-conversion local methods like PIX for LATAM markets."
    },
    {
      q: "Can I use my own branding?",
      a: "Yes. NEXA is 100% white-labeled. From the logo in the dashboard to the domain name and primary colors, the platform looks and feels entirely like your own proprietary technology."
    },
    {
      q: "What markets are available?",
      a: "You get access to 30+ high-engagement markets including major FX pairs, leading Cryptocurrencies, global Indices, Stocks, and Commodities like Gold and Oil."
    },
    {
      q: "What's included in the Basic plan?",
      a: "The setup package includes your full white-labeled trading environment, integrated payment systems, legal structure coverage, and a dedicated launch manager to guide you to your first trade."
    },
    {
      q: "Are there any monthly fees?",
      a: "We believe in a growth-aligned model. That means $0 monthly maintenance fees. We grow when you grow, allowing you to retain maximum revenue from your traffic."
    }
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={scrollToTop}>
            <div
              className="w-10 h-10 p-1 rounded-lg group-hover:scale-110 transition-transform"
              style={{ backgroundColor: BRAND_COLOR }}
            >
              <img src="/nexalogo.svg" alt="NEXA logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 uppercase">NEXA</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-semibold text-slate-500 hover:text-brand transition-colors"
                style={{ "--brand": BRAND_COLOR } as any}
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 md:px-6 md:py-3 rounded-xl text-white font-bold text-sm md:text-base transition-all shadow-lg shadow-brand/20 hover:scale-105 active:scale-95"
              style={{ background: BRAND_GRADIENT }}
            >
              Request a Demo
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 md:pt-32 pb-5 md:pb-16 lg:pb-28 lg:min-h-screen px-6 overflow-hidden grid-bg">
        {/* Floating Icons */}
        <div className="absolute inset-0 pointer-events-none block opacity-90 md:opacity-100">
          {floatingLogos.map((logo, index) => (
            <motion.div
              key={index}
              initial={{ y: 0 }}
              animate={{ y: [0, -12, 0] }}
              transition={{ 
                duration: 5 + Math.random() * 2, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: index * 0.4 
              }}
              className={`absolute p-2 md:p-3 bg-white/95 md:bg-white backdrop-blur-[6px] border border-slate-200/90 rounded-lg md:rounded-xl shadow-md shadow-slate-300/40 md:shadow-slate-200/60 ring-1 ring-slate-200/60 ${logo.pos}`}
            >
              <img
                src={logo.src}
                alt={logo.name}
                className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 object-contain"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          ))}
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-2 rounded-full border border-gray-100 bg-white text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase mb-6 shadow-sm"
          >
            Simplified Brokerage Infrastructure
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 leading-[0.95] mb-8"
          >
            Get Your Own <br className="hidden md:block" />
            Brokerage Brand with <br className="hidden md:block" />
            $0 Monthly Fee
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed font-medium"
          >
            A simplified trading platform designed for a better user experience. 
            Everything you need - nothing you don't.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-4 rounded-xl text-white font-black text-lg shadow-2xl shadow-brand/30 transition-all hover:scale-105 active:scale-95"
              style={{ background: BRAND_GRADIENT }}
            >
              Request a Demo
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-4 rounded-xl text-slate-900 font-black text-lg border-2 border-slate-100 hover:bg-slate-50 transition-all bg-white shadow-sm"
            >
              Explore Platform
            </button>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="mt-4 md:mt-12 lg:mt-10 xl:mt-12 lg:h-screen px-4 md:px-8 lg:px-12 py-14 md:py-16 lg:py-6 bg-white lg:flex lg:items-center">
        <div className="max-w-[1280px] w-full mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tighter leading-tight">
              A premium launch model with less friction
            </h2>
            <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
              High-conversion brokerage infrastructure focused on speed, clarity, and practical execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-5">
            {/* Left Column */}
            <div className="flex flex-col gap-5 md:col-span-3">
              {/* 30+ Markets */}
              <div className="bg-[#050B15] rounded-[32px] p-6 text-white relative flex flex-col justify-between group min-h-[250px] border border-slate-800 shadow-xl">
                <div className="flex justify-between items-start">
                  <h3 className="text-4xl font-black" style={{ color: BRAND_COLOR }}>30+</h3>
                  <ArrowUpRight className="w-8 h-8 text-slate-500 group-hover:text-white transition-colors" />
                </div>
                <div className="mt-5">
                  <h4 className="text-xl font-black mb-2">Popular Markets</h4>
                  <p className="text-slate-400 text-sm md:text-base leading-relaxed font-medium">Forex, Crypto, Stocks, Commodities — curated for maximum trader engagement.</p>
                </div>
                <div className="flex gap-3 mt-5">
                   {[
                     { icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.png", bg: "bg-orange-500/10" },
                     { icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png", bg: "bg-blue-500/10" },
                     { icon: "https://cryptologos.cc/logos/tether-usdt-logo.png", bg: "bg-emerald-500/10" },
                     { icon: "https://cryptologos.cc/logos/solana-sol-logo.png", bg: "bg-purple-500/10" }
                   ].map((coin, i) => (
                     <div key={i} className={`w-10 h-10 rounded-xl border border-slate-800 ${coin.bg} flex items-center justify-center p-2 shadow-inner`}>
                       <img src={coin.icon} className="w-full h-full object-contain" alt="" referrerPolicy="no-referrer" />
                     </div>
                   ))}
                </div>
              </div>

              {/* Pre-integrated PSPs */}
              <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-lg flex flex-col justify-between min-h-[180px] group">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <CreditCard className="w-8 h-8 text-brand" style={{ color: BRAND_COLOR }} />
                  </div>
                  <ArrowUpRight className="w-6 h-6 text-slate-300 group-hover:text-brand transition-colors" style={{'--brand': BRAND_COLOR} as any} />
                </div>
                <div>
                  <h4 className="text-xl font-black mb-2">Pre-integrated PSPs</h4>
                  <p className="text-slate-500 leading-relaxed font-medium text-base">Ready-to-use payment service providers — accept deposits from day one with zero setup overhead.</p>
                </div>
              </div>
            </div>

            {/* Middle Column - Trading App Display */}
            <div className="bg-slate-950 rounded-[32px] overflow-hidden group relative shadow-2xl h-full min-h-[360px] border border-slate-800 md:col-span-6">
              <img 
                src="/mainimg1.svg" 
                alt="Trading Interface" 
                className="w-full h-full object-contain object-left opacity-85 group-hover:opacity-100 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex items-end p-6">
                 <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-xl w-full flex items-center justify-between">
                    <div>
                      <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] mb-0.5">Live Trading Interface</p>
                      <p className="text-white text-base font-bold">Smart Order Matching</p>
                    </div>
                    <div className="p-2.5 bg-brand rounded-lg" style={{ backgroundColor: BRAND_COLOR }}>
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                 </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-5 md:col-span-3">
              {/* 100% Customizable */}
              <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-lg flex flex-col justify-between min-h-[180px] group">
                <div className="flex justify-between items-start">
                  <h3 className="text-4xl font-black" style={{ color: BRAND_COLOR }}>100%</h3>
                  <ArrowUpRight className="w-6 h-6 text-slate-300 group-hover:text-brand transition-colors" style={{'--brand': BRAND_COLOR} as any} />
                </div>
                <div className="mt-5">
                  <h4 className="text-xl font-black mb-2">Customizable</h4>
                  <p className="text-slate-500 text-base leading-relaxed font-medium">Your brand, your logo, your domain — fully white-labeled from day one.</p>
                </div>
              </div>

              {/* 0 License Needed */}
              <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-lg flex flex-col justify-between min-h-[190px] group">
                <div className="flex justify-between items-start">
                  <h3 className="text-4xl font-black" style={{ color: BRAND_COLOR }}>0</h3>
                  <ArrowUpRight className="w-6 h-6 text-slate-300 group-hover:text-brand transition-colors" style={{'--brand': BRAND_COLOR} as any} />
                </div>
                <div className="mt-5">
                  <h4 className="text-xl font-black mb-2">License Needed</h4>
                  <p className="text-slate-500 leading-relaxed font-medium text-base">We cover the complete legal and regulatory structure for you.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-slate-950 text-white overflow-hidden">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter leading-tight">Next-Generation <br className="hidden md:block" />Trading Platform</h2>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
              Give your traders a seamless, top-notch trading experience with a lightweight and modern product architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Clean Design */}
            <div className="md:col-span-4 bg-slate-900 rounded-[40px] p-8 flex flex-col border border-slate-800 shadow-2xl group overflow-hidden min-h-[400px]">
              <div className="mb-8 relative z-10">
                <h3 className="text-2xl font-black mb-4">Clean Design</h3>
                <p className="text-base text-slate-400 font-medium leading-relaxed">A lightweight interface designed to reduce user friction and simplify user experience.</p>
              </div>
              <div className="relative mt-auto flex justify-center translate-y-8">
                <div className="absolute inset-0 bg-brand/10 blur-[80px] rounded-full group-hover:bg-brand/20 transition-all duration-1000" style={{ backgroundColor: BRAND_COLOR + '22' }} />
                <motion.img 
                  initial={{ y: 0 }}
                  whileInView={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  src="/mainimg2.svg" 
                  alt="Mobile Mockup" 
                  className="w-[85%] h-auto rounded-[32px] shadow-2xl border-4 border-slate-800 bg-slate-950 relative z-10"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* One Mechanic */}
              <div className="bg-white rounded-[32px] p-5 text-slate-900 flex flex-col justify-between min-h-[125px] shadow-xl border border-slate-50 group hover:shadow-2xl transition-all">
                <div>
                  <h3 className="text-lg font-black tracking-tight mb-2">One Mechanic</h3>
                  <p className="text-sm text-slate-500 font-medium leading-[1.4]">One trading mechanic: buy and sell in one click. Simple by design.</p>
                </div>
                <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all shadow-sm" style={{'--brand': BRAND_COLOR} as any}>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* High Conversion */}
              <div className="bg-white rounded-[32px] p-5 text-slate-900 flex flex-col justify-between min-h-[125px] shadow-xl border border-slate-50 group hover:shadow-2xl transition-all">
                <div>
                  <h3 className="text-lg font-black tracking-tight mb-2">High Conversion</h3>
                  <p className="text-sm text-slate-500 font-medium leading-[1.4]">Simple interface increases conversion from the first interaction.</p>
                </div>
                <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all shadow-sm" style={{'--brand': BRAND_COLOR} as any}>
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>

              {/* Payments Ready */}
              <div className="bg-white rounded-[32px] p-5 text-slate-900 shadow-xl border border-slate-50 flex flex-col justify-between min-h-[170px]">
                <div>
                  <h3 className="text-lg font-black tracking-tight mb-2">Payments Ready</h3>
                  <p className="text-sm text-slate-500 font-medium leading-[1.4]">Pre-integrated payment methods for quick deposits.</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                    {["VISA", "MC", "GPay", "Apple", "BTC", "SOL"].map((k) => (
                      <div key={k} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[8px] font-black tracking-widest text-slate-400">
                        {k}
                      </div>
                    ))}
                </div>
              </div>

              {/* Profit Retention */}
              <div className="bg-white rounded-[32px] p-5 text-slate-900 shadow-xl border border-slate-50 flex items-center gap-5 min-h-[170px]">
                <div className="relative w-20 h-20 shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                    <motion.circle 
                      initial={{ strokeDashoffset: 219.9 }}
                      whileInView={{ strokeDashoffset: 219.9 * (1 - 0.85) }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      cx="40" cy="40" r="35" 
                      stroke="currentColor" strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray={219.9} 
                      strokeLinecap="round"
                      style={{ color: BRAND_COLOR }} 
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-black text-lg italic tracking-tighter">85%</div>
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight mb-1">Profit Retention</h3>
                  <p className="text-sm text-slate-500 font-medium leading-[1.4]">Keep the majority of revenue from your traffic.</p>
                </div>
              </div>

              {/* Web & Instant App */}
              <div className="sm:col-span-2 bg-white rounded-[32px] p-5 text-slate-900 shadow-xl border border-slate-50 flex flex-col md:flex-row gap-6 overflow-hidden items-center group relative min-h-[215px]">
                  <div className="flex-1 relative z-10">
                    <h3 className="text-xl font-black mb-2 tracking-tight">Web & Instant App</h3>
                    <p className="text-sm text-slate-500 font-medium leading-[1.4] mb-6">Works on every device. Seamless trading experience both web and mobile.</p>
                    <div className="flex gap-2">
                        <div className="px-5 py-2.5 bg-[#0B1221] text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
                          <Smartphone className="w-4 h-4" /> 
                          <span>Mobile</span>
                        </div>
                        <div className="px-5 py-2.5 bg-[#F8FAFC] text-[#0B1221] rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-slate-100 shadow-sm">
                          <Layout className="w-4 h-4" /> 
                          <span>Desktop</span>
                        </div>
                    </div>
                  </div>
                  <div className="flex-1 h-[165px] flex items-end justify-center transform group-hover:translate-x-1 transition-transform duration-700">
                    <div className="w-[94%] h-full bg-slate-950 rounded-t-2xl border-x-2 border-t-2 border-slate-100 shadow-xl overflow-hidden relative">
                      <img src="/mainimg3.svg" className="w-full h-full object-contain object-left" alt="Web and mobile interface preview" />
                      <div className="absolute inset-0 bg-brand/5" style={{ backgroundColor: BRAND_COLOR + '0A' }} />
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-slate-50">
        <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-20 items-center">
          <div className="lg:w-1/2">
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-8 tracking-[0.02em] leading-[0.85] italic">Launch fast. <br className="hidden md:block" />Minimal cost.</h2>
            <p className="text-xl text-slate-500 mb-12 max-w-lg leading-relaxed font-medium">
              One transparent entry package with essential setup, legal structure, and core support included.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              {[
                { icon: <Plus className="w-5 h-5" />, title: "No hidden fees", desc: "Flat one-time setup with clear terms" },
                { icon: <Clock className="w-5 h-5" />, title: "7-day launch", desc: "From agreement to live trading" },
                { icon: <ShieldCheck className="w-5 h-5" />, title: "Legal covered", desc: "No licence required to start" },
                { icon: <MessageSquare className="w-5 h-5" />, title: "Dedicated manager", desc: "Personal onboarding support" }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xl shadow-brand/10 border border-brand/10" style={{ color: BRAND_COLOR, backgroundColor: BRAND_COLOR + '11' }}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 mb-1">{item.title}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/2 w-full max-w-xl relative">
            <div className="absolute inset-0 bg-brand/5 blur-[120px] rounded-full pointer-events-none" style={{ backgroundColor: BRAND_COLOR + '11' }} />
            <motion.div 
               whileHover={{ y: -10, scale: 1.01 }}
               className="bg-white rounded-[40px] shadow-2xl shadow-slate-200 overflow-hidden border border-white relative z-10"
            >
              <div
                className="absolute top-0 left-8 right-8 h-[2px] rounded-full opacity-90"
                style={{ background: `linear-gradient(90deg, transparent, ${BRAND_COLOR_LIGHT}, transparent)` }}
              />
              <motion.div
                className="absolute top-0 h-[3px] w-28 rounded-full blur-[1px]"
                style={{ background: BRAND_GRADIENT }}
                initial={{ x: "-120%" }}
                animate={{ x: ["-120%", "520%"] }}
                transition={{ duration: 3.2, ease: "linear", repeat: Infinity }}
              />
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                   <div className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-brand border border-brand/5" style={{ color: BRAND_COLOR, backgroundColor: BRAND_COLOR + '11' }}>
                    Starter Package
                   </div>
                   <div className="text-4xl font-black tracking-tighter" style={{ color: BRAND_COLOR }}>$15,000</div>
                </div>

                <h3 className="text-3xl font-black text-slate-900 mb-8 italic">BASIC Plan</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-12">
                   {[
                     "Web Traderoom", "Dealing Desk", "Liquidity", "KYC", "Antifraud", "Affiliate Module",
                     "CRM and Back Office", "Billing", "Servers", "Options", "SMS"
                   ].map((feature) => (
                     <div key={feature} className="flex items-center gap-3">
                       <div className="w-5 h-5 rounded-full flex items-center justify-center text-brand" style={{ color: BRAND_COLOR, backgroundColor: BRAND_COLOR + '11' }}>
                         <CheckCircle2 className="w-3.5 h-3.5" />
                       </div>
                       <span className="text-base font-bold text-slate-700">{feature}</span>
                     </div>
                   ))}
                </div>

                <button 
                  className="w-full py-4 rounded-2xl text-white font-black text-xl shadow-2xl shadow-brand/30 transition-all hover:scale-[1.02] active:scale-95"
                  style={{ background: BRAND_GRADIENT }}
                >
                  Get Started
                </button>
              </div>
              <div className="bg-slate-50 p-6 border-t border-slate-100 flex items-center gap-4">
                 <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                 </div>
                 <p className="text-sm text-slate-500 font-medium leading-relaxed">Full support during setup. No risk — if we can't deliver, you get a refund.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-[1280px] mx-auto rounded-[48px] bg-slate-950 relative overflow-hidden p-12 md:p-20 text-center shadow-2xl">
           <div className="absolute inset-0">
              <img src="/bgimg.svg" className="w-full h-full object-cover opacity-70" alt="" />
              <div className="absolute inset-0 bg-gradient-to-br from-slate-950/65 via-slate-950/45 to-slate-950/30" />
           </div>
           
           <div className="relative z-10">
             <h2 className="text-4xl md:text-6xl font-black italic text-white mb-8 tracking-tighter leading-none">Kickstart your broker <br className="hidden md:block" />within 7 days</h2>
             <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-12 font-medium leading-relaxed opacity-80">
               Fill out the form and chat with our managers to discuss your project and see how quickly you can set up your brokerage business.
             </p>
             <button 
               className="px-12 py-5 rounded-2xl text-white font-black text-xl shadow-2xl shadow-brand/50 transition-all hover:scale-110 active:scale-95"
               style={{ background: BRAND_GRADIENT }}
             >
               Leave Request
             </button>
           </div>
        </div>
      </section>

      {/* Launch Process */}
      <section className="py-24 px-6 bg-slate-50/50">
        <div className="max-w-[1280px] mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-none italic tracking-tighter">Launch Process</h2>
            <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed">From initial request to live platform in five simple steps.</p>
          </div>

          <div className="relative">
            <div className="absolute top-[3.5rem] left-0 w-full h-[2px] bg-slate-200 hidden lg:block" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { n: "1", title: "Leave request", desc: "Fill out the form and tell us about your project." },
                { n: "2", title: "Check out the demo", desc: "Explore the platform and its trading interface." },
                { n: "3", title: "Customise the platform", desc: "Apply your branding, logo, and domain settings." },
                { n: "4", title: "Sign the contract", desc: "Finalize terms and complete the agreement." },
                { n: "5", title: "Get brokerage solution", desc: "Your platform goes live and is ready for traders." }
              ].map((step, i) => (
                <div key={i} className="relative z-10 group">
                  <div className="bg-white rounded-[24px] p-8 border border-white shadow-xl shadow-slate-200 flex flex-col h-full hover:-translate-y-2 transition-all duration-500">
                    <div 
                      className="w-12 h-12 rounded-xl text-white font-black text-xl flex items-center justify-center mb-8 shrink-0 shadow-xl shadow-brand/30 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: BRAND_COLOR }}
                    >
                      {step.n}
                    </div>
                    <h4 className="text-lg font-black text-slate-900 mb-4 tracking-tight leading-tight">{step.title}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="lg:h-screen px-4 md:px-8 lg:px-12 py-14 md:py-16 lg:py-6 bg-white lg:flex lg:items-center">
        <div className="max-w-[1280px] w-full mx-auto flex flex-col lg:flex-row gap-8 lg:gap-10">
          <div className="lg:w-2/5">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-5 md:mb-6 italic leading-[0.85] tracking-tighter">Frequently <br />Asked <br />Questions</h2>
            <p className="text-base md:text-lg text-slate-500 mb-7 md:mb-8 leading-relaxed font-medium">
              Can't find the answer you're looking for? Reach out to our team — we're happy to help.
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-4 rounded-2xl text-white font-black text-lg md:text-xl shadow-2xl shadow-brand/40 transition-all hover:scale-105 active:scale-95"
              style={{ background: BRAND_GRADIENT }}
            >
              Contact Us
            </button>
          </div>

          <div className="lg:w-3/5 flex flex-col gap-3.5 md:gap-3">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="group cursor-pointer"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div className={`bg-white border-2 rounded-[20px] p-4 transition-all ${openFaq === i ? 'border-slate-200 shadow-xl shadow-slate-100/80' : 'border-slate-50 hover:border-slate-200 hover:shadow-lg'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-base md:text-lg font-black tracking-tight transition-colors ${openFaq === i ? 'text-brand' : 'text-slate-800'}`} style={{ color: openFaq === i ? BRAND_COLOR : undefined }}>
                      {faq.q}
                    </span>
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-inner ${openFaq === i ? 'bg-brand text-white rotate-45' : 'bg-slate-50 text-brand group-hover:bg-brand group-hover:text-white'}`}
                      style={{ 
                        backgroundColor: openFaq === i ? BRAND_COLOR : undefined,
                        '--brand': BRAND_COLOR
                      } as any}
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </div>
                  </div>
                  <motion.div
                    initial={false}
                    animate={{ 
                      height: openFaq === i ? "auto" : 0,
                      opacity: openFaq === i ? 1 : 0,
                      marginTop: openFaq === i ? 16 : 0
                    }}
                    className="overflow-hidden"
                  >
                    <p className="text-sm text-slate-500 font-medium leading-[1.6] max-w-xl">
                      {faq.a}
                    </p>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="lg:h-screen px-4 md:px-8 lg:px-12 py-14 md:py-16 lg:py-6 lg:flex lg:items-center">
        <div className="max-w-[1280px] w-full mx-auto rounded-[40px] overflow-hidden p-6 md:p-8 lg:p-10 border border-cyan-400/15 flex flex-col lg:flex-row gap-8 lg:gap-10 shadow-2xl relative backdrop-blur-sm bg-slate-950/75">
           <div className="absolute inset-0 pointer-events-none">
             <div className="absolute inset-0 bg-linear-to-br from-[#040b24] via-[#03173d] to-[#08243d]" />
             <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-cyan-400/10 blur-3xl" />
             <div className="absolute -bottom-28 right-0 w-[26rem] h-[26rem] rounded-full bg-blue-500/10 blur-3xl" />
             <div className="absolute inset-0 bg-white/[0.02]" />
           </div>
           <div className="lg:w-1/2 relative z-10">
             <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-5 md:mb-6 italic leading-[0.9] tracking-tighter">Start your <br />brokerage <br />project</h2>
             <p className="text-base md:text-lg text-slate-400 font-medium leading-relaxed max-w-sm">
               Share a few details and our managers will prepare a tailored rollout plan for your market.
             </p>
           </div>
           
           <div className="lg:w-1/2 relative z-10 bg-white/[0.02] border border-white/8 rounded-[24px] p-4 md:p-5 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
              {contactSuccess ? (
                <div className="text-center py-12 px-4">
                  <p className="text-3xl font-black text-white mb-3 tracking-tight">Thank you!</p>
                  <p className="text-slate-400 font-medium leading-relaxed text-base max-w-md mx-auto mb-8">
                    We have received your submission. Our team will reach out to you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setContactSuccess(false);
                      setContactError(null);
                    }}
                    className="px-6 py-3 rounded-xl text-white font-bold text-sm border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Submit another request
                  </button>
                </div>
              ) : (
              <form
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  void submitLead(contactLead, contactConsent, "contact-section", {
                    setSubmitting: setContactSubmitting,
                    setSuccess: setContactSuccess,
                    setError: setContactError,
                  });
                }}
              >
                 <div className="flex flex-col gap-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Name</label>
                   <input
                     type="text"
                     name="name"
                     autoComplete="name"
                     value={contactLead.name}
                     onChange={(e) =>
                       setContactLead((s) => ({ ...s, name: e.target.value }))
                     }
                     placeholder="Your full name"
                     maxLength={200}
                     className="bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-brand font-bold text-base disabled:opacity-50"
                     style={{'--brand': BRAND_COLOR} as any}
                     disabled={contactSubmitting}
                   />
                 </div>
                 <div className="flex flex-col gap-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Email</label>
                   <input
                     type="email"
                     name="email"
                     autoComplete="email"
                     value={contactLead.email}
                     onChange={(e) =>
                       setContactLead((s) => ({ ...s, email: e.target.value }))
                     }
                     placeholder="you@company.com"
                     maxLength={254}
                     className="bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-brand font-bold text-base disabled:opacity-50"
                     style={{'--brand': BRAND_COLOR} as any}
                     disabled={contactSubmitting}
                   />
                   {contactEmailWarning && (
                     <p className="text-[11px] text-amber-400/95 leading-snug">
                       {contactEmailWarning}
                     </p>
                   )}
                 </div>
                 <div className="flex flex-col gap-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Phone</label>
                   <input
                     type="tel"
                     name="phone"
                     autoComplete="tel"
                     inputMode="tel"
                     value={contactLead.phone}
                     onChange={(e) =>
                       setContactLead((s) => ({ ...s, phone: e.target.value }))
                     }
                     placeholder="Include country code (+1, +44, +91…)"
                     maxLength={28}
                     className="bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-brand font-bold text-base disabled:opacity-50"
                     style={{'--brand': BRAND_COLOR} as any}
                     disabled={contactSubmitting}
                   />
                   {contactPhoneWarning && (
                     <p className="text-[11px] text-amber-400/95 leading-snug">
                       {contactPhoneWarning}
                     </p>
                   )}
                 </div>
                 <div className="flex flex-col gap-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Telegram / WhatsApp</label>
                   <input
                     type="text"
                     name="telegram"
                     value={contactLead.telegram}
                     onChange={(e) =>
                       setContactLead((s) => ({ ...s, telegram: e.target.value }))
                     }
                     placeholder="@username"
                     maxLength={300}
                     className="bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-brand font-bold text-base disabled:opacity-50"
                     style={{'--brand': BRAND_COLOR} as any}
                     disabled={contactSubmitting}
                   />
                 </div>
                 <div className="flex flex-col gap-2 sm:col-span-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">What's your current business?</label>
                   <input
                     type="text"
                     name="business"
                     value={contactLead.business}
                     onChange={(e) =>
                       setContactLead((s) => ({ ...s, business: e.target.value }))
                     }
                     placeholder="e.g. Affiliate, Broker, Fintech..."
                     maxLength={4000}
                     className="bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-brand font-bold text-base disabled:opacity-50"
                     style={{'--brand': BRAND_COLOR} as any}
                     disabled={contactSubmitting}
                   />
                 </div>
                 <div className="flex flex-col gap-2 sm:col-span-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Why do you want to launch?</label>
                   <input
                     type="text"
                     name="why"
                     value={contactLead.why}
                     onChange={(e) =>
                       setContactLead((s) => ({ ...s, why: e.target.value }))
                     }
                     placeholder="e.g. New revenue stream, monetize traffic..."
                     maxLength={4000}
                     className="bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-brand font-bold text-base disabled:opacity-50"
                     style={{'--brand': BRAND_COLOR} as any}
                     disabled={contactSubmitting}
                   />
                 </div>
                 <div className="sm:col-span-2 flex gap-4 mt-1 p-4 bg-slate-900/30 rounded-2xl border border-slate-900">
                   <input
                     type="checkbox"
                     id="contact-consent"
                     checked={contactConsent}
                     onChange={(e) => setContactConsent(e.target.checked)}
                     className="mt-1 accent-brand w-5 h-5 shrink-0"
                     style={{ color: BRAND_COLOR } as any}
                     disabled={contactSubmitting}
                   />
                   <label htmlFor="contact-consent" className="text-xs text-slate-500 font-medium leading-relaxed cursor-pointer">
                     By checking the box I consent to the terms and conditions and privacy policy.
                   </label>
                 </div>
                 {contactError && (
                   <div className="sm:col-span-2 text-sm font-medium">
                     <p className="text-red-400">{contactError}</p>
                   </div>
                 )}
                 <button
                   type="submit"
                   className="sm:col-span-2 py-4 rounded-2xl text-white font-black text-xl shadow-2xl transition-all hover:scale-[1.02] active:scale-95 mt-2 disabled:opacity-60 disabled:pointer-events-none"
                  style={{ background: BRAND_GRADIENT }}
                  disabled={contactSubmitting}
                 >
                   {contactSubmitting ? "Sending…" : "Send Request"}
                 </button>
              </form>
              )}
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 pt-20 pb-12 px-6 text-slate-400 border-t border-slate-900">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={scrollToTop}>
              <div
                className="w-10 h-10 p-1 rounded-lg group-hover:scale-110 transition-transform"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                <img src="/nexalogo.svg" alt="NEXA logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white italic uppercase">NEXA</span>
            </div>
            <div className="flex gap-8 text-[11px] font-black uppercase tracking-[0.2em]">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors border-l border-slate-800 pl-8">Terms & Conditions</a>
            </div>
          </div>
          <div className="pt-8 text-center text-[9px] font-black text-slate-700 uppercase tracking-[0.5em] border-t border-slate-900/50">
            © 2026 NEXA. All rights reserved.
          </div>
        </div>
      </footer>
      {/* Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-2xl bg-slate-900/60 backdrop-blur-2xl rounded-[32px] p-6 md:p-8 shadow-[0_0_100px_rgba(0,0,0,0.6)] relative z-10 border border-white/10 overflow-hidden flex flex-col max-h-[95vh]"
          >
            {/* Background Decorative Gradients */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-brand/20 blur-[80px] rounded-full pointer-events-none" style={{"--brand": BRAND_COLOR} as any} />
            <div
              className="absolute bottom-0 left-0 -ml-24 -mb-24 w-80 h-80 blur-[100px] rounded-full pointer-events-none"
              style={{ backgroundColor: BRAND_COLOR_LIGHT + "1A" }}
            />
            
            {/* Grid Overlay for texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
              style={{ backgroundImage: `radial-gradient(${BRAND_COLOR} 1px, transparent 1px)`, backgroundSize: '24px 24px' }} 
            />

            {/* Close Button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5 z-20"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2 relative z-10">
              {!modalSuccess && (
              <div className="mb-6 lg:mb-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-2xl md:text-3xl font-black text-white mb-1 tracking-tighter">
                    Leave your <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(90deg, ${BRAND_COLOR}, ${BRAND_COLOR_LIGHT})` }}>request</span> now
                  </h2>
                  <p className="text-white/40 font-medium text-sm md:text-base">We'll contact you within days to discuss your vision.</p>
                </motion.div>
              </div>
              )}

              {modalSuccess ? (
                <div className="text-center py-10 px-4">
                  <p className="text-3xl font-black text-white mb-3 tracking-tight">Thank you!</p>
                  <p className="text-white/50 font-medium leading-relaxed text-base max-w-md mx-auto mb-8">
                    We have received your submission. Our team will reach out to you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setModalSuccess(false);
                      setModalError(null);
                      setIsModalOpen(false);
                    }}
                    className="px-8 py-4 rounded-2xl text-white font-black text-lg shadow-2xl transition-all hover:brightness-110"
                    style={{ background: BRAND_GRADIENT }}
                  >
                    Close
                  </button>
                </div>
              ) : (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  void submitLead(modalLead, modalConsent, "modal", {
                    setSubmitting: setModalSubmitting,
                    setSuccess: setModalSuccess,
                    setError: setModalError,
                  });
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {MODAL_FORM_FIELDS.map((field, idx) => (
                    <motion.div 
                      key={field.key} 
                      className={`space-y-1.5 ${field.full ? 'md:col-span-2' : ''}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + idx * 0.05 }}
                    >
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">{field.label}</label>
                      <input 
                        type={field.type} 
                        placeholder={field.placeholder}
                        name={field.key}
                        value={modalLead[field.key]}
                        onChange={(e) =>
                          setModalLead((s) => ({
                            ...s,
                            [field.key]: e.target.value,
                          }))
                        }
                        disabled={modalSubmitting}
                        maxLength={field.maxLength}
                        inputMode={field.inputMode}
                        autoComplete={
                          field.key === "name"
                            ? "name"
                            : field.key === "email"
                              ? "email"
                              : field.key === "phone"
                                ? "tel"
                                : "off"
                        }
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3 text-white placeholder:text-white/10 focus:outline-none focus:border-brand/40 focus:bg-white/[0.05] transition-all font-medium text-sm hover:border-white/20 shadow-inner disabled:opacity-50"
                        style={{"--brand": BRAND_COLOR} as any}
                      />
                      {field.key === "email" && modalEmailWarning && (
                        <p className="text-[11px] text-amber-300/90 leading-snug px-1">
                          {modalEmailWarning}
                        </p>
                      )}
                      {field.key === "phone" && modalPhoneWarning && (
                        <p className="text-[11px] text-amber-300/90 leading-snug px-1">
                          {modalPhoneWarning}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>

                <motion.div 
                  className="flex items-start gap-3 pt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="relative flex items-center h-4 mt-0.5">
                    <input 
                      type="checkbox" 
                      id="consent" 
                      checked={modalConsent}
                      onChange={(e) => setModalConsent(e.target.checked)}
                      className="w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-brand transition-all cursor-pointer accent-brand" 
                      disabled={modalSubmitting}
                    />
                  </div>
                  <label htmlFor="consent" className="text-xs text-white/30 leading-tight cursor-pointer hover:text-white/50 transition-colors">
                    By checking the box I consent to the terms and conditions and privacy policy.
                  </label>
                </motion.div>

                {modalError && (
                  <div className="text-sm font-medium">
                    <p className="text-red-300">{modalError}</p>
                  </div>
                )}

                <motion.div 
                  className="pt-4 sticky bottom-0 bg-transparent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <button 
                    type="submit"
                    className="w-full py-4.5 rounded-[22px] text-white font-black text-lg transition-all hover:brightness-110 active:scale-[0.98] shadow-2xl shadow-brand/30 flex items-center justify-center gap-2 group relative overflow-hidden disabled:opacity-60 disabled:pointer-events-none"
                    style={{ 
                      background: BRAND_GRADIENT
                    }}
                    disabled={modalSubmitting}
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{modalSubmitting ? "Sending…" : "Send Request"}</span>
                    <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </motion.div>
              </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
