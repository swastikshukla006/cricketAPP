"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Accordion } from "@/components/Accordion";
import { MagneticButton } from "@/components/MagneticButton";
import { STORAGE_KEYS } from "@/lib/admin-config";
import {
  categories,
  defaultProducts,
  faqs,
  galleryImages,
  navItems,
  processSteps,
  reasons,
  services,
  testimonials,
  type InquiryItem,
  type ProductItem,
  type ReviewItem
} from "@/lib/site-data";

gsap.registerPlugin(ScrollTrigger);

const Grainient = dynamic(() => import("@/components/Grainient"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[linear-gradient(135deg,#f7f4ee,#8ba9c3_48%,#ece1d2)]" aria-hidden="true" />
});

const panelStyles = ["bg-white/90", "bg-sky/70", "bg-blossom/10", "bg-white/80"];

function safeProducts(raw: unknown): ProductItem[] {
  if (!Array.isArray(raw)) return defaultProducts;
  return raw
    .map((item) => ({
      id: typeof item?.id === "string" ? item.id : crypto.randomUUID(),
      title: typeof item?.title === "string" ? item.title : "Untitled Product",
      category: typeof item?.category === "string" ? item.category : "Custom Project",
      image: typeof item?.image === "string" ? item.image : "/work/blue-academic-file-set.jpg",
      description: typeof item?.description === "string" ? item.description : "Custom project file and presentation work.",
      note: typeof item?.note === "string" ? item.note : "Quote after brief",
      featured: Boolean(item?.featured),
      status: item?.status === "busy" || item?.status === "archived" ? item.status : "active"
    }))
    .filter((item) => item.title && item.image);
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}
function safeReviews(raw: unknown): ReviewItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item): ReviewItem => ({
      id: typeof item?.id === "string" ? item.id : crypto.randomUUID(),
      name: typeof item?.name === "string" ? item.name : "Anonymous",
      role: typeof item?.role === "string" ? item.role : "Customer",
      quote: typeof item?.quote === "string" ? item.quote : "",
      image: typeof item?.image === "string" ? item.image : undefined,
      createdAt: typeof item?.createdAt === "string" ? item.createdAt : new Date().toISOString(),
      status: item?.status === "approved" ? "approved" : "pending"
    }))
    .filter((item) => item.quote.trim());
}

function compressReviewImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const source = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const maxSize = 1280;
      const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) {
        URL.revokeObjectURL(source);
        reject(new Error("Image processing is unavailable."));
        return;
      }
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      URL.revokeObjectURL(source);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    image.onerror = () => {
      URL.revokeObjectURL(source);
      reject(new Error("Image upload failed."));
    };
    image.src = source;
  });
}


export function ProProjectsExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const statRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const brandTapRef = useRef(0);
  const brandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const [products, setProducts] = useState<ProductItem[]>(defaultProducts);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [formState, setFormState] = useState("Share topic, class, deadline, and budget.");
  const [reviewState, setReviewState] = useState("Write a short review after your order is completed.");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEYS.products);
    if (saved) {
      try {
        setProducts(safeProducts(JSON.parse(saved)));
      } catch {
        setProducts(defaultProducts);
      }
    }
    const savedReviews = window.localStorage.getItem(STORAGE_KEYS.reviews);
    if (savedReviews) {
      try {
        setReviews(safeReviews(JSON.parse(savedReviews)));
      } catch {
        setReviews([]);
      }
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.products && event.newValue) {
        try {
          setProducts(safeProducts(JSON.parse(event.newValue)));
        } catch {
          setProducts(defaultProducts);
        }
      }
      if (event.key === STORAGE_KEYS.reviews) {
        try {
          setReviews(safeReviews(JSON.parse(event.newValue || "[]")));
        } catch {
          setReviews([]);
        }
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    ScrollTrigger.config({ ignoreMobileResize: true });
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const context = gsap.context(() => {
      if (reduceMotion) {
        gsap.set("[data-hero-word], [data-hero-card], [data-reveal]", { clearProps: "all" });
        return;
      }

      gsap.from("[data-hero-word]", {
        yPercent: 108,
        duration: 0.78,
        ease: "power3.out",
        stagger: 0.065
      });

      gsap.from("[data-hero-card]", {
        y: 28,
        opacity: 0,
        scale: 0.985,
        duration: 0.72,
        ease: "power2.out",
        stagger: 0.06,
        delay: 0.1
      });

      ScrollTrigger.batch("[data-reveal]", {
        start: "top 92%",
        once: true,
        batchMax: 6,
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.62, ease: "power2.out", stagger: 0.055, overwrite: true }
          );
        }
      });

      statRefs.current.forEach((element) => {
        if (!element) return;
        const target = Number(element.dataset.value || "0");
        const counter = { value: 0 };
        gsap.to(counter, {
          value: target,
          duration: 0.95,
          ease: "power2.out",
          scrollTrigger: { trigger: element, start: "top 92%", once: true },
          onUpdate: () => {
            element.textContent = `${Math.round(counter.value)}${element.dataset.suffix || ""}`;
          }
        });
      });
    }, root);

    return () => context.revert();
  }, []);

  useEffect(() => {
    const locked = mobileMenuOpen || Boolean(lightbox);
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen, lightbox]);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        setLightbox(null);
      }
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.altKey && event.shiftKey && event.key.toLowerCase() === "o") {
        event.preventDefault();
        router.push("/admin");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  const activeProducts = useMemo(() => products.filter((item) => item.status !== "archived"), [products]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const productCategories = useMemo(() => ["All", ...Array.from(new Set(activeProducts.map((item) => item.category)))], [activeProducts]);
  const filteredProducts = useMemo(() => selectedCategory === "All" ? activeProducts : activeProducts.filter((item) => item.category === selectedCategory), [activeProducts, selectedCategory]);
  const heroProducts = activeProducts.slice(0, 4);
  const featuredProducts = useMemo(() => {
    const featured = activeProducts.filter((item) => item.featured);
    return (featured.length ? featured : activeProducts).slice(0, 3);
  }, [activeProducts]);
  const approvedReviews = useMemo(() => reviews.filter((item) => item.status === "approved"), [reviews]);
  const displayTestimonials = approvedReviews.length
    ? approvedReviews.map((item) => ({ name: item.name, role: item.role, quote: item.quote, image: item.image }))
    : testimonials.map((item) => ({ ...item, image: undefined }));

  function handleSecretOwnerAccess() {
    brandTapRef.current += 1;
    if (brandTimerRef.current) clearTimeout(brandTimerRef.current);
    if (brandTapRef.current >= 5) {
      brandTapRef.current = 0;
      router.push("/admin");
      return;
    }
    brandTimerRef.current = setTimeout(() => {
      brandTapRef.current = 0;
    }, 1400);
  }

  async function handleReviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("reviewName") || "").trim();
    const role = String(formData.get("reviewRole") || "Customer").trim();
    const quote = String(formData.get("reviewText") || "").trim();
    const file = formData.get("reviewImage");

    if (!name || !quote) {
      setReviewState("Please add your name and review text.");
      return;
    }

    let image: string | undefined;
    if (file instanceof File && file.size > 0) {
      if (!file.type.startsWith("image/")) {
        setReviewState("Please upload an image file only.");
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setReviewState("Please choose an image smaller than 8 MB.");
        return;
      }
      setReviewState("Optimising your image…");
      image = await compressReviewImage(file).catch(() => "");
      if (!image) {
        setReviewState("We could not process that image. Try another one.");
        return;
      }
    }

    const review: ReviewItem = {
      id: typeof crypto !== "undefined" ? crypto.randomUUID() : String(Date.now()),
      name,
      role: role || "Customer",
      quote,
      image,
      createdAt: new Date().toISOString(),
      status: "pending"
    };

    if (typeof window !== "undefined") {
      const existing = window.localStorage.getItem(STORAGE_KEYS.reviews);
      const parsed = existing ? safeReviews(JSON.parse(existing)) : [];
      const next = [review, ...parsed];
      window.localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(next));
      setReviews(next);
    }

    form.reset();
    setReviewState("Review submitted. It will appear after admin approval.");
  }

  function showInterest(product: ProductItem) {
    const subject = document.querySelector<HTMLSelectElement>('select[name="subject"]');
    const requirement = document.querySelector<HTMLTextAreaElement>('textarea[name="requirement"]');
    if (subject && categories.includes(product.category)) subject.value = product.category;
    if (requirement) requirement.value = `I am interested in ${product.title}. Please share the quote and available customisation options.`;
    document.getElementById("custom-orders")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => requirement?.focus({ preventScroll: true }), 550);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const inquiry: InquiryItem = {
      id: typeof crypto !== "undefined" ? crypto.randomUUID() : String(Date.now()),
      name: String(formData.get("name") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      classLevel: String(formData.get("classLevel") || "").trim(),
      subject: String(formData.get("subject") || "").trim(),
      requirement: String(formData.get("requirement") || "").trim(),
      createdAt: new Date().toISOString(),
      status: "new"
    };

    if (!inquiry.name || !inquiry.phone || !inquiry.requirement) {
      setFormState("Please fill name, phone, and requirement.");
      return;
    }

    if (typeof window !== "undefined") {
      const existing = window.localStorage.getItem(STORAGE_KEYS.inquiries);
      const parsed = existing ? (JSON.parse(existing) as InquiryItem[]) : [];
      window.localStorage.setItem(STORAGE_KEYS.inquiries, JSON.stringify([inquiry, ...parsed]));
    }

    event.currentTarget.reset();
    setFormState(`Inquiry saved at ${formatDate(inquiry.createdAt)}. We will review your request and get back to you.`);
  }

  return (
    <div ref={rootRef} className="relative isolate min-h-screen overflow-hidden bg-paper text-ink">
      <div className="pointer-events-none fixed inset-0 z-0">
        <Grainient
          color1="#ece1d2"
          color2="#8ba9c3"
          color3="#f7f4ee"
          timeSpeed={0.18}
          colorBalance={-0.03}
          warpStrength={0.9}
          warpFrequency={4.4}
          warpSpeed={1.15}
          warpAmplitude={70}
          blendAngle={-18}
          blendSoftness={0.15}
          rotationAmount={110}
          noiseScale={1.2}
          grainAmount={0.035}
          grainScale={1.5}
          grainAnimated
          contrast={1.04}
          saturation={0.76}
          zoom={0.98}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.54),transparent_34rem),linear-gradient(180deg,rgba(248,244,238,0.5),rgba(248,244,238,0.24)_30%,rgba(248,244,238,0.42))]" />
      </div>
      <div className="prototype-watermark font-tech text-xs uppercase">Prototype</div>
      <div className="relative z-10">
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4">
        <nav aria-label="Main navigation" className="paper-panel mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between rounded-full border border-white/60 bg-white/80 px-3 shadow-[0_18px_55px_rgba(30,74,118,0.12)] backdrop-blur-2xl sm:px-4 md:px-6">
          <button type="button" onClick={handleSecretOwnerAccess} className="focus-ring flex min-w-0 items-center gap-2 rounded-full sm:gap-3" aria-label="ProProjects.co home">
            <img src="/brand-logo.png" alt="ProProjects logo" className="size-10 shrink-0 rounded-full object-cover shadow-[0_10px_30px_rgba(0,0,0,0.16)] sm:size-11" decoding="async" />
            <span className="min-w-0 leading-none">
              <span className="block truncate font-display text-base font-bold tracking-[-0.04em] text-ocean sm:text-lg">proprojects.co</span>
              <span className="hidden font-script text-base text-ocean/58 sm:block">premium project studio</span>
            </span>
          </button>
          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map(([label, href]) => (
              <a key={label} href={href} className="focus-ring font-tech rounded-full px-4 py-2 text-sm font-semibold uppercase text-ocean/70 transition-colors duration-200 hover:bg-white hover:text-ocean">
                {label}
              </a>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <a href="https://wa.me/?text=Hi%20ProProjects%2C%20I%20want%20a%20premium%20custom%20project" className="focus-ring hidden rounded-full bg-ocean px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors duration-200 hover:bg-blossom hover:text-ocean sm:inline-flex">
              Order
            </a>
            <button
              type="button"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="focus-ring grid size-11 place-items-center rounded-full border border-ocean/10 bg-white/85 text-ocean lg:hidden"
            >
              <span className="relative block h-4 w-5" aria-hidden="true">
                <span className={`absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current transition-transform duration-200 ${mobileMenuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
                <span className={`absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-current transition-opacity duration-200 ${mobileMenuOpen ? "opacity-0" : "opacity-100"}`} />
                <span className={`absolute bottom-0 left-0 h-0.5 w-5 rounded-full bg-current transition-transform duration-200 ${mobileMenuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </nav>
        <div aria-hidden={!mobileMenuOpen} className={`paper-panel mx-auto mt-3 max-w-7xl overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/90 shadow-[0_20px_60px_rgba(30,74,118,0.14)] backdrop-blur-2xl transition-[max-height,opacity,transform] duration-300 lg:hidden ${mobileMenuOpen ? "max-h-[520px] translate-y-0 opacity-100" : "pointer-events-none max-h-0 -translate-y-2 border-transparent opacity-0"}`}>
          <div className="grid gap-1 p-3">
            {navItems.map(([label, href]) => (
              <a key={label} href={href} tabIndex={mobileMenuOpen ? 0 : -1} onClick={() => setMobileMenuOpen(false)} className="focus-ring font-tech rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-ocean/75 transition-colors hover:bg-sky/70 hover:text-ocean">
                {label}
              </a>
            ))}
            <a href="https://wa.me/?text=Hi%20ProProjects%2C%20I%20want%20a%20premium%20custom%20project" tabIndex={mobileMenuOpen ? 0 : -1} onClick={() => setMobileMenuOpen(false)} className="focus-ring mt-2 inline-flex min-h-12 items-center justify-center rounded-full bg-ocean px-5 text-xs font-bold uppercase tracking-[0.16em] text-white">
              Order on WhatsApp
            </a>
          </div>
        </div>
      </header>

      <main>
        <section id="home" className="relative overflow-hidden pt-32 md:pt-40">
          <div className="hero-wash absolute inset-0 -z-20 opacity-90" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_24%,rgba(255,255,255,0.74),transparent_20rem),radial-gradient(circle_at_84%_16%,rgba(139,169,195,0.24),transparent_20rem),linear-gradient(180deg,rgba(255,255,255,0.24),rgba(255,255,255,0.08))]" />
          <div className="section-shell grid min-h-[calc(100svh-8rem)] items-center gap-12 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
            <div className="editorial-card ripped-accent rounded-[2rem] border border-white/70 bg-white/65 p-7 shadow-[0_30px_120px_rgba(44,98,148,0.16)] backdrop-blur-2xl md:p-10">
              <p data-reveal className="mb-6 inline-flex rounded-full border border-ocean/10 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-ocean shadow-line">
                Curated by hand • styled for presentation
              </p>
              <h1 className="font-display text-[clamp(3.1rem,12vw,8rem)] font-bold leading-[0.86] tracking-[-0.07em] text-ocean md:max-w-[10ch]">
                <span className="block overflow-hidden"><span data-hero-word className="block">Turn your</span></span>
                <span className="block overflow-hidden"><span data-hero-word className="block">topic into</span></span>
                <span className="block overflow-hidden text-blossom"><span data-hero-word className="block">something worth seeing.</span></span>
              </h1>
              <p data-reveal className="mt-7 max-w-2xl text-lg leading-8 text-ocean/70 md:text-xl">
                You bring the topic. We craft it into something bold, beautiful, and worth presenting.
              </p>
              <p data-reveal className="mt-4 font-note text-2xl text-ocean/58 md:text-3xl">there is always more to present beautifully.</p>
              <div data-reveal className="mt-10 flex flex-col gap-4 sm:flex-row">
                <MagneticButton href="#product-styles">Show Interest</MagneticButton>
                <MagneticButton href="#gallery" variant="light">See Work</MagneticButton>
              </div>
            </div>

            <div className="relative hidden min-h-[560px] md:block lg:min-h-[680px]">
              <div className="absolute inset-0 rounded-[2.2rem] border border-white/70 bg-white/25 backdrop-blur-[2px]" />
              {heroProducts.map((product, index) => {
                const positions = [
                  "left-0 top-6 w-[48%]",
                  "right-[2%] top-0 w-[44%]",
                  "bottom-12 left-[10%] w-[38%]",
                  "bottom-0 right-[4%] w-[52%]"
                ];
                const aspects = ["aspect-[0.84]", "aspect-[1.08]", "aspect-[0.98]", "aspect-[0.8]"];
                return (
                  <div key={product.id} data-hero-card className={`paper-panel absolute overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/80 p-3 shadow-premium backdrop-blur-xl ${positions[index] || positions[0]}`}>
                    <img src={product.image} alt={product.title} className={`w-full rounded-[1.2rem] object-cover ${aspects[index] || aspects[0]}`} loading={index < 2 ? "eager" : "lazy"} decoding="async" fetchPriority={index === 0 ? "high" : "auto"} />
                  </div>
                );
              })}
              <div data-reveal className="paper-panel absolute bottom-5 left-5 max-w-xs rounded-[1.4rem] border border-white/75 bg-white/90 p-5 text-ocean shadow-premium backdrop-blur-xl md:bottom-8 md:left-8">
                <p className="font-script text-2xl text-blossom">Custom presentation work</p>
                <p className="mt-3 font-display text-3xl font-bold leading-none tracking-[-0.05em]">Files, covers, sheets, and subject projects finished with a clean premium look.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:hidden">
              {heroProducts.map((product, index) => (
                <button key={product.id} type="button" onClick={() => setLightbox({ src: product.image, label: product.title })} className={`focus-ring paper-panel overflow-hidden rounded-[1.3rem] border border-white/75 bg-white/85 p-2 text-left shadow-premium ${index === 0 ? "col-span-2" : ""}`}>
                  <img src={product.image} alt={product.title} className={`w-full rounded-[0.95rem] object-cover ${index === 0 ? "aspect-[1.45]" : "aspect-[0.88]"}`} loading={index === 0 ? "eager" : "lazy"} decoding="async" fetchPriority={index === 0 ? "high" : "auto"} />
                  <span className="block px-2 pb-2 pt-3 font-tech text-[11px] font-bold uppercase tracking-[0.12em] text-ocean/65">{product.title}</span>
                </button>
              ))}
              <div className="col-span-2 rounded-[1.3rem] border border-white/70 bg-white/80 p-5 text-ocean shadow-line backdrop-blur-xl">
                <p className="font-script text-2xl text-blossom">Made to look worth presenting.</p>
                <p className="mt-2 text-sm leading-6 text-ocean/68">Tap any image for a full-screen preview.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="py-24 md:py-32">
          <div className="section-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div data-reveal>
              <p className="font-note mb-4 text-2xl text-blossom">About ProProjects</p>
              <h2 className="font-display text-5xl font-bold leading-[0.94] tracking-[-0.06em] text-ocean md:text-7xl">A project studio for clean, presentable academic work.</h2>
            </div>
            <div data-reveal className="editorial-card rounded-[1.7rem] border border-ocean/10 bg-white/80 p-8 shadow-premium">
              <p className="text-lg leading-9 text-ocean/70 md:text-xl">
                ProProjects.co helps students, parents, and schools get premium-looking files, covers, handmade pages, and project presentations that feel polished from the first glance.
              </p>
            </div>
          </div>
        </section>

        <section id="services" className="py-24 md:py-32">
          <div className="section-shell">
            <div data-reveal className="max-w-4xl">
              <p className="font-note mb-4 text-2xl text-blossom">Services</p>
              <h2 className="font-display text-5xl font-bold leading-[0.94] tracking-[-0.06em] text-ocean md:text-7xl">From concept sheets to premium written projects.</h2>
            </div>
            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              {services.map((service, index) => (
                <article key={service.title} data-reveal className={`editorial-card min-h-[340px] rounded-[1.7rem] border border-white/70 p-8 shadow-premium backdrop-blur-xl transition duration-300 hover:-translate-y-1 ${panelStyles[index % panelStyles.length]}`}>
                  <span className="text-xs font-bold uppercase tracking-[0.22em] text-blossom">{service.eyebrow}</span>
                  <p className="mt-8 font-display text-6xl font-bold tracking-[-0.08em] text-ocean/15">{String(index + 1).padStart(2, "0")}</p>
                  <h3 className="mt-8 font-display text-4xl font-bold leading-none tracking-[-0.05em] text-ocean">{service.title}</h3>
                  <p className="mt-7 leading-8 text-ocean/70">{service.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="projects" className="py-24 md:py-32">
          <div className="section-shell">
            <div data-reveal className="max-w-4xl">
              <p className="font-note mb-4 text-2xl text-blossom">Featured Projects</p>
              <h2 className="font-display text-5xl font-bold leading-[0.94] tracking-[-0.06em] text-ocean md:text-7xl">Selected work, arranged like a premium catalogue.</h2>
            </div>
            <div className="mt-14 space-y-8">
              {featuredProducts.map((project, index) => (
                <article key={project.id} data-reveal className={`grid gap-8 editorial-card rounded-[2rem] border border-white/80 p-4 shadow-premium lg:grid-cols-[0.85fr_1.15fr] lg:items-center ${index % 2 === 0 ? "bg-white/80" : "bg-sky/70"}`}>
                  <figure className={`overflow-hidden rounded-[1.45rem] ${index % 2 ? "lg:order-2" : ""}`}>
                    <img src={project.image} alt={project.title} className="aspect-[0.9] w-full object-cover" loading="lazy" decoding="async" />
                  </figure>
                  <div className="p-4 md:p-9">
                    <div className="flex flex-wrap gap-3">
                      <span className="rounded-full bg-ocean px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white">{project.category}</span>
                      <span className="rounded-full border border-ocean/10 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-ocean/55">{project.status === "busy" ? "Busy" : "Available"}</span>
                    </div>
                    <h3 className="mt-8 font-display text-4xl font-bold leading-none tracking-[-0.05em] text-ocean md:text-6xl">{project.title}</h3>
                    <p className="mt-6 max-w-2xl text-lg leading-8 text-ocean/70">{project.description}</p>
                    <p className="mt-4 text-sm font-bold uppercase tracking-[0.14em] text-blossom">{project.note}</p>
                    <a href="#custom-orders" className="focus-ring mt-9 inline-flex rounded-full border border-ocean/10 bg-white/80 px-6 py-4 text-sm font-bold uppercase tracking-[0.16em] text-ocean transition hover:bg-ocean hover:text-white">
                      Start similar project
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="product-styles" className="py-24 md:py-32">
          <div className="section-shell editorial-card rounded-[2.2rem] border border-white/80 bg-white/60 p-6 shadow-[0_28px_120px_rgba(44,98,148,0.14)] backdrop-blur-2xl md:p-10">
            <div data-reveal className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <p className="font-note mb-4 text-2xl text-blossom">Product Styles</p>
                <h2 className="font-display text-5xl font-bold leading-[0.94] tracking-[-0.06em] text-ocean md:text-7xl">Project styles, no fixed-price catalogue.</h2>
              </div>
              <div className="rounded-[1.35rem] border border-ocean/10 bg-sky/70 p-6">
                <p className="text-lg font-semibold leading-8 text-ocean/70">
                  Quotes depend on subject, page count, finish, deadline, and the level of customisation. Use “Show Interest” to start the conversation.
                </p>
              </div>
            </div>

            <div className="no-scrollbar -mx-1 mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 sm:flex-wrap sm:overflow-visible">
              {productCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`focus-ring shrink-0 snap-start rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition ${selectedCategory === category ? "bg-ocean text-white shadow-[0_12px_30px_rgba(30,98,148,0.22)]" : "border border-ocean/10 bg-white/85 text-ocean/72 hover:bg-sky/70"}`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
              <p className="font-tech text-xs uppercase tracking-[0.18em] text-ocean/46">{filteredProducts.length} style{filteredProducts.length === 1 ? "" : "s"} visible</p>
              {selectedCategory !== "All" ? (
                <button type="button" onClick={() => setSelectedCategory("All")} className="focus-ring rounded-full border border-ocean/10 bg-white/85 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-ocean">Reset filter</button>
              ) : null}
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product, index) => (
                <article key={product.id} data-reveal className="group overflow-hidden editorial-card rounded-[1.5rem] border border-white/80 bg-white/90 shadow-[0_18px_70px_rgba(44,98,148,0.12)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(44,98,148,0.18)]">
                  <figure className="overflow-hidden">
                    <img src={product.image} alt={product.title} className="aspect-[0.96] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]" loading="lazy" decoding="async" />
                  </figure>
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-ocean px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white">{product.category}</span>
                      {product.featured ? <span className="rounded-full bg-blossom px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-ocean">Featured</span> : null}
                      <span className={`rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] ${product.status === "busy" ? "bg-amber-100 text-amber-700" : "bg-meadow/35 text-ocean"}`}>
                        {product.status === "busy" ? "Busy" : "Available"}
                      </span>
                    </div>
                    <h3 className="mt-5 font-display text-3xl font-bold leading-none tracking-[-0.04em] text-ocean">{product.title}</h3>
                    <p className="mt-4 min-h-24 leading-7 text-ocean/68">{product.description}</p>
                    <div className="mt-6 flex items-center justify-between gap-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-blossom">{product.note}</p>
                      <button type="button" onClick={() => showInterest(product)} className="focus-ring min-h-11 shrink-0 rounded-full bg-ocean px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors duration-200 hover:bg-blossom hover:text-ocean">
                        Show Interest
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="process" className="py-24 md:py-32">
          <div className="section-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div data-reveal>
              <p className="font-note mb-4 text-2xl text-blossom">How We Work</p>
              <h2 className="font-display text-5xl font-bold leading-[0.94] tracking-[-0.06em] text-ocean md:text-7xl">Clear process. Premium output.</h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-ocean/70">
                Every order is handled around your brief, subject, class level, and deadline so the final work feels clean, relevant, and presentation-ready.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {["Custom brief", "Neat presentation", "Deadline planning", "Subject-specific styling", "WhatsApp support", "Quote after discussion"].map((feature) => (
                  <span key={feature} className="rounded-full border border-ocean/10 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-ocean/70">{feature}</span>
                ))}
              </div>
              <div className="mt-8">
                <a href="#custom-orders" className="focus-ring inline-flex rounded-full bg-ocean px-6 py-4 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-blossom hover:text-ocean">Start your brief</a>
              </div>
            </div>
            <div data-reveal className="grid gap-5 md:grid-cols-2">
              {processSteps.map(([number, title, copy], index) => (
                <article key={title} className={`paper-panel rounded-[1.35rem] border border-white/80 p-6 shadow-premium ${panelStyles[index % panelStyles.length]}`}>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-blossom">{number}</p>
                  <h3 className="mt-5 font-display text-3xl font-bold leading-none tracking-[-0.04em] text-ocean">{title}</h3>
                  <p className="mt-4 leading-7 text-ocean/70">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 md:py-32">
          <div className="section-shell rounded-[2rem] border border-white/80 bg-white/70 p-6 shadow-premium backdrop-blur-xl md:p-10">
            <div data-reveal className="max-w-4xl">
              <p className="font-note mb-4 text-2xl text-blossom">Why Choose Us</p>
              <h2 className="font-display text-5xl font-bold leading-[0.94] tracking-[-0.06em] text-ocean md:text-7xl">Better presentation. Better first impressions.</h2>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {reasons.map((reason, index) => (
                <div key={reason} data-reveal className={`rounded-[1.3rem] border border-white/80 p-7 shadow-premium transition hover:-translate-y-1 ${panelStyles[index % panelStyles.length]}`}>
                  <h3 className="font-display text-3xl font-bold leading-none tracking-[-0.04em] text-ocean">{reason}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="gallery" className="relative overflow-hidden py-24 md:py-32">
          <div className="absolute inset-0 -z-20 bg-[linear-gradient(135deg,rgba(38,50,59,0.92),rgba(17,33,45,0.94))]" />
          <div className="absolute inset-0 -z-10 opacity-35" style={{ backgroundImage: `url(/vibes/editorial-paper-collage.png)`, backgroundSize: `720px auto`, backgroundRepeat: `repeat` }} />
          <div className="section-shell">
            <div data-reveal className="mb-14 max-w-4xl">
              <p className="font-note mb-4 text-2xl text-blossom">Gallery</p>
              <h2 className="font-display text-5xl font-bold leading-none tracking-[-0.06em] text-white md:text-7xl">Portfolio proof, arranged like a catalogue wall.</h2>
            </div>
            <div className="columns-1 gap-5 sm:columns-2 lg:columns-4">
              {galleryImages.map((photo, index) => (
                <figure key={photo.src} data-reveal className="mb-5 break-inside-avoid overflow-hidden rounded-[1.1rem] border border-white/20 bg-white/95 text-ocean shadow-[0_12px_50px_rgba(5,25,41,0.18)]">
                  <button type="button" onClick={() => setLightbox({ src: photo.src, label: photo.label })} className="focus-ring group block w-full overflow-hidden text-left" aria-label={`Open ${photo.label} image`}>
                    <img src={photo.src} alt={photo.label} className={`w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025] ${index % 3 === 0 ? "aspect-[0.78]" : "aspect-[0.92]"}`} loading="lazy" decoding="async" />
                  </button>
                  <figcaption className="font-tech p-4 text-xs font-bold uppercase tracking-[0.18em] text-ocean/50">{photo.label}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 md:py-32">
          <div className="section-shell">
            <div data-reveal className="mb-12 max-w-4xl">
              <p className="font-note mb-4 text-2xl text-blossom">Testimonials</p>
              <h2 className="font-display text-5xl font-bold leading-[0.94] tracking-[-0.06em] text-ocean md:text-7xl">Trust for parents. Confidence for students.</h2>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {displayTestimonials.map((testimonial, index) => (
                <article key={testimonial.name} data-reveal className={`rounded-[1.4rem] border border-white/80 p-7 shadow-premium ${panelStyles[index % panelStyles.length]}`}>
                  <div aria-label="Five star rating" className="mb-8 text-blossom">★★★★★</div>
                  <blockquote className="text-xl font-semibold leading-9 text-ocean/80">“{testimonial.quote}”</blockquote>
                  <div className="mt-10 flex items-center gap-4">
                    {testimonial.image ? <img src={testimonial.image} alt={testimonial.name} className="size-12 rounded-full object-cover" loading="lazy" decoding="async" /> : <div className="grid size-12 place-items-center rounded-full bg-ocean font-bold text-white">{testimonial.name.charAt(0)}</div>}
                    <div>
                      <p className="font-bold text-ocean">{testimonial.name}</p>
                      <p className="text-sm text-ocean/50">{testimonial.role}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="reviews" className="pb-24 md:pb-32">
          <div className="section-shell grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
            <div data-reveal className="editorial-card rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-premium backdrop-blur-xl md:p-8">
              <p className="font-note mb-4 text-2xl text-blossom">Leave a Review</p>
              <h2 className="font-display text-4xl font-bold leading-[0.94] tracking-[-0.05em] text-ocean md:text-6xl">Customers can submit feedback after delivery.</h2>
              <p className="mt-5 text-lg leading-8 text-ocean/68">Reviews stay in pending mode until admin approves them. You can also upload one image with your review.</p>
              <form onSubmit={handleReviewSubmit} className="mt-8 grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label>
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-ocean/40">Name</span>
                    <input name="reviewName" required autoComplete="name" className="focus-ring mt-3 w-full rounded-2xl border border-ocean/10 bg-sky/40 px-4 py-4 text-ocean" placeholder="Your name" />
                  </label>
                  <label>
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-ocean/40">Role</span>
                    <input name="reviewRole" className="focus-ring mt-3 w-full rounded-2xl border border-ocean/10 bg-sky/40 px-4 py-4 text-ocean" placeholder="Student / Parent / Teacher" />
                  </label>
                </div>
                <label>
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-ocean/40">Review</span>
                  <textarea name="reviewText" required className="focus-ring mt-3 min-h-32 w-full rounded-2xl border border-ocean/10 bg-sky/40 px-4 py-4 text-ocean" placeholder="How was the quality, presentation, and delivery?" />
                </label>
                <label>
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-ocean/40">Upload image</span>
                  <input name="reviewImage" type="file" accept="image/*" className="focus-ring mt-3 w-full rounded-2xl border border-ocean/10 bg-sky/40 px-4 py-4 text-ocean file:mr-4 file:rounded-full file:border-0 file:bg-ocean file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-[0.12em] file:text-white" />
                </label>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <button type="submit" className="focus-ring rounded-full bg-ocean px-6 py-4 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-blossom hover:text-ocean">Submit review</button>
                  <p className="max-w-md text-sm font-semibold text-ocean/60">{reviewState}</p>
                </div>
              </form>
            </div>
            <div data-reveal className="rounded-[2rem] border border-white/80 bg-white/70 p-6 shadow-premium backdrop-blur-xl md:p-8">
              <p className="font-note mb-4 text-2xl text-blossom">Approved Reviews</p>
              <div className="space-y-4">
                {approvedReviews.length === 0 ? (
                  <div className="editorial-card rounded-[1.4rem] border border-white/80 bg-white/80 p-6 text-ocean/68">No approved customer reviews yet. New submissions will appear here after admin approval.</div>
                ) : approvedReviews.slice(0, 3).map((review) => (
                  <article key={review.id} className="editorial-card rounded-[1.4rem] border border-white/80 bg-white/85 p-5 shadow-line">
                    <div className="flex items-start gap-4">
                      {review.image ? <img src={review.image} alt={review.name} className="size-14 rounded-xl object-cover" loading="lazy" decoding="async" /> : <div className="grid size-14 place-items-center rounded-xl bg-ocean font-bold text-white">{review.name.charAt(0)}</div>}
                      <div>
                        <p className="font-semibold text-ocean">{review.name}</p>
                        <p className="text-sm text-ocean/50">{review.role}</p>
                      </div>
                    </div>
                    <p className="mt-4 leading-7 text-ocean/72">“{review.quote}”</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="py-24 md:py-32">
          <div className="section-shell grid gap-12 lg:grid-cols-[0.82fr_1.18fr]">
            <div data-reveal>
              <p className="font-note mb-4 text-2xl text-blossom">FAQ</p>
              <h2 className="font-display text-5xl font-bold leading-none tracking-[-0.06em] text-ocean md:text-7xl">Before you order.</h2>
            </div>
            <div data-reveal className="editorial-card rounded-[1.8rem] border border-white/80 bg-white/80 p-3 shadow-premium backdrop-blur-xl md:p-5">
              <Accordion items={faqs} />
            </div>
          </div>
        </section>

        <section id="contact" className="pb-24 md:pb-32">
          <div className="section-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div data-reveal className="relative overflow-hidden rounded-[2rem] border border-white/60 p-8 text-white shadow-premium md:p-10">
              <div className="absolute inset-0 -z-20 bg-[linear-gradient(135deg,rgba(14,51,82,0.92),rgba(44,98,148,0.74),rgba(196,167,134,0.45))]" />
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_18rem)]" />
              <p className="font-note mb-4 text-2xl text-blossom">Contact</p>
              <h2 className="font-display text-5xl font-bold leading-[0.94] tracking-[-0.06em] md:text-7xl">Send the brief. Get the plan.</h2>
              <div className="mt-10 space-y-5 text-white/82">
                <p><span className="font-semibold text-white">Gmail:</span> <a href="mailto:pro.projects.co@gmail.com" className="underline decoration-white/30 underline-offset-4">pro.projects.co@gmail.com</a></p>
                <p><span className="font-semibold text-white">Instagram DM:</span> <a href="https://instagram.com/proprojects.co" target="_blank" rel="noreferrer" className="underline decoration-white/30 underline-offset-4">@proprojects.co</a></p>
                <p><span className="font-semibold text-white">Location:</span> India, delivery by discussion</p>
                <p><span className="font-semibold text-white">Website support:</span> <a href="mailto:vidhushukla522@gmail.com" className="underline decoration-white/30 underline-offset-4">vidhushukla522@gmail.com</a></p>
              </div>
              <a href="https://wa.me/?text=Hi%20ProProjects%2C%20I%20want%20a%20premium%20custom%20project" className="focus-ring mt-10 inline-flex rounded-full bg-white px-6 py-4 text-sm font-bold uppercase tracking-[0.16em] text-ocean transition hover:bg-blossom hover:text-ocean">
                Start on WhatsApp
              </a>
            </div>
            <form id="custom-orders" onSubmit={handleSubmit} data-reveal className="editorial-card rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-premium backdrop-blur-xl md:p-10">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold uppercase tracking-[0.16em] text-ocean/40">Name</span>
                  <input name="name" required autoComplete="name" className="focus-ring mt-3 w-full rounded-2xl border border-ocean/10 bg-sky/40 px-4 py-4 text-ocean" placeholder="Student or parent name" />
                </label>
                <label className="block">
                  <span className="text-sm font-bold uppercase tracking-[0.16em] text-ocean/40">Phone</span>
                  <input name="phone" required type="tel" inputMode="tel" autoComplete="tel" className="focus-ring mt-3 w-full rounded-2xl border border-ocean/10 bg-sky/40 px-4 py-4 text-ocean" placeholder="+91..." />
                </label>
                <label className="block">
                  <span className="text-sm font-bold uppercase tracking-[0.16em] text-ocean/40">Class</span>
                  <input name="classLevel" className="focus-ring mt-3 w-full rounded-2xl border border-ocean/10 bg-sky/40 px-4 py-4 text-ocean" placeholder="Class 8 / College" />
                </label>
                <label className="block">
                  <span className="text-sm font-bold uppercase tracking-[0.16em] text-ocean/40">Subject</span>
                  <select name="subject" required className="focus-ring mt-3 w-full rounded-2xl border border-ocean/10 bg-sky/40 px-4 py-4 text-ocean" defaultValue="">
                    <option value="" disabled>Choose subject</option>
                    {categories.map((category) => <option key={category}>{category}</option>)}
                  </select>
                </label>
              </div>
              <label className="mt-5 block">
                <span className="text-sm font-bold uppercase tracking-[0.16em] text-ocean/40">Requirement</span>
                <textarea name="requirement" required className="focus-ring mt-3 min-h-40 w-full resize-y rounded-2xl border border-ocean/10 bg-sky/40 px-4 py-4 text-ocean" placeholder="Tell us the topic, deadline, file type, page count, finish style, and budget." />
              </label>
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button type="submit" className="focus-ring rounded-full bg-ocean px-7 py-4 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-blossom hover:text-ocean">
                  Send Inquiry
                </button>
                <p aria-live="polite" className="max-w-md text-sm font-semibold text-ocean/60">{formState}</p>
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="px-4 py-12 text-white" style={{ background: "linear-gradient(135deg, rgba(17,33,45,0.96), rgba(30,48,63,0.96)), url(/vibes/editorial-paper-collage.png)", backgroundBlendMode: "multiply", backgroundSize: "cover, 720px auto" }}>
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 border-b border-white/12 pb-12 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
            <div>
              <div className="flex items-center gap-4">
                <img src="/brand-logo.png" alt="ProProjects logo" className="size-14 rounded-full object-cover" loading="lazy" decoding="async" />
                <div>
                  <p className="font-display text-5xl font-bold tracking-[-0.07em] md:text-7xl">ProProjects.co</p>
                  <p className="font-script text-2xl text-white/66">crafted with detail, not just assembled</p>
                </div>
              </div>
              <p className="mt-5 max-w-xl text-white/70">Custom files, practical records, written projects, and academic presentation work with a premium visual finish.</p>
            </div>
            <div>
              <p className="font-tech mb-5 text-sm font-bold uppercase tracking-[0.18em] text-white/40">Quick Links</p>
              <div className="grid gap-3">
                {navItems.map(([label, href]) => <a key={label} href={href} className="focus-ring w-fit text-white/76 transition hover:text-white">{label}</a>)}
              </div>
            </div>
            <div>
              <p className="font-tech mb-5 text-sm font-bold uppercase tracking-[0.18em] text-white/40">Contact</p>
              <div className="space-y-3 text-white/66">
                <p><a href="mailto:pro.projects.co@gmail.com" className="transition hover:text-white">pro.projects.co@gmail.com</a></p>
                <p><a href="mailto:vidhushukla522@gmail.com" className="transition hover:text-white">Website support — vidhushukla522@gmail.com</a></p>
                <p><a href="https://instagram.com/proprojects.co" target="_blank" rel="noreferrer" className="transition hover:text-white">Instagram DM — @proprojects.co</a></p>
                <p className="text-white/50">Subject areas: {categories.slice(0, 8).join(" / ")}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-4 pt-8 text-sm text-white/54 md:flex-row md:items-end">
            <div>
              <p>Copyright 2026 ProProjects.co. All rights reserved.</p>
              <p className="mt-2 text-white/42">Custom academic projects, crafted for enquiries.</p>
            </div>
            <p className="text-white/44">Digital styling by <span className="text-white/68">Swastik Shukla</span> · <a href="https://instagram.com/swastik_shukla__" target="_blank" rel="noreferrer" className="transition hover:text-white">@swastik_shukla__</a></p>
          </div>
        </div>
      </footer>
      </div>

      <a href="https://wa.me/?text=Hi%20ProProjects%2C%20I%20want%20to%20discuss%20a%20written%20project" aria-label="Chat with ProProjects on WhatsApp" className="focus-ring fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-3 z-[65] inline-flex min-h-11 items-center rounded-full bg-ocean px-4 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-[0_14px_40px_rgba(15,55,82,0.28)] sm:hidden">
        WhatsApp
      </a>

      {lightbox ? (
        <div role="dialog" aria-modal="true" aria-label={lightbox.label} className="fixed inset-0 z-[100] grid place-items-center bg-[#08131dcc] p-3 backdrop-blur-md sm:p-6" onClick={() => setLightbox(null)}>
          <div className="relative max-h-[92dvh] w-full max-w-5xl overflow-hidden rounded-[1.5rem] border border-white/20 bg-white p-2 shadow-[0_30px_100px_rgba(0,0,0,0.4)] sm:p-3" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setLightbox(null)} aria-label="Close image preview" className="focus-ring absolute right-4 top-4 z-10 grid size-11 place-items-center rounded-full bg-ocean/90 text-2xl text-white shadow-lg">×</button>
            <img src={lightbox.src} alt={lightbox.label} className="max-h-[82dvh] w-full rounded-[1rem] object-contain" decoding="async" />
            <p className="px-3 pb-2 pt-3 font-tech text-xs font-bold uppercase tracking-[0.14em] text-ocean/60">{lightbox.label}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
