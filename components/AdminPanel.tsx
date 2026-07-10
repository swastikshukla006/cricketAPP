"use client";

import { useEffect, useMemo, useState } from "react";
import { OWNER_CREDENTIALS, STORAGE_KEYS } from "@/lib/admin-config";
import { categories, defaultProducts, type InquiryItem, type ProductItem, type ProductStatus, type ReviewItem } from "@/lib/site-data";

type ProductDraft = {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  note: string;
  featured: boolean;
  status: ProductStatus;
};

const emptyDraft: ProductDraft = {
  id: "",
  title: "",
  category: "Custom Project",
  image: "",
  description: "",
  note: "Quote after brief",
  featured: false,
  status: "active"
};

function makeId() {
  return typeof crypto !== "undefined" ? crypto.randomUUID() : String(Date.now());
}

function loadProducts(): ProductItem[] {
  if (typeof window === "undefined") return defaultProducts;
  const saved = window.localStorage.getItem(STORAGE_KEYS.products);
  if (!saved) return defaultProducts;
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : defaultProducts;
  } catch {
    return defaultProducts;
  }
}

function loadInquiries(): InquiryItem[] {
  if (typeof window === "undefined") return [];
  const saved = window.localStorage.getItem(STORAGE_KEYS.inquiries);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveProducts(items: ProductItem[]) {
  window.localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(items));
}

function saveInquiries(items: InquiryItem[]) {
  window.localStorage.setItem(STORAGE_KEYS.inquiries, JSON.stringify(items));
}

function loadReviews(): ReviewItem[] {
  if (typeof window === "undefined") return [];
  const saved = window.localStorage.getItem(STORAGE_KEYS.reviews);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveReviews(items: ReviewItem[]) {
  window.localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(items));
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginMessage, setLoginMessage] = useState("Use owner credentials to manage products.");
  const [products, setProducts] = useState<ProductItem[]>(defaultProducts);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [panelMessage, setPanelMessage] = useState("Ready.");
  const [catalogueSearch, setCatalogueSearch] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setLoggedIn(window.sessionStorage.getItem(STORAGE_KEYS.adminSession) === "true");
    setProducts(loadProducts());
    setInquiries(loadInquiries());
    setReviews(loadReviews());

    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.products) setProducts(loadProducts());
      if (event.key === STORAGE_KEYS.inquiries) setInquiries(loadInquiries());
      if (event.key === STORAGE_KEYS.reviews) setReviews(loadReviews());
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const stats = useMemo(() => {
    const active = products.filter((item) => item.status === "active").length;
    const busy = products.filter((item) => item.status === "busy").length;
    const archived = products.filter((item) => item.status === "archived").length;
    const featured = products.filter((item) => item.featured).length;
    const newInquiries = inquiries.filter((item) => item.status === "new").length;
    const contactedInquiries = inquiries.filter((item) => item.status === "contacted").length;
    const doneInquiries = inquiries.filter((item) => item.status === "done").length;
    const pendingReviews = reviews.filter((item) => item.status === "pending").length;
    const approvedReviews = reviews.filter((item) => item.status === "approved").length;
    const imageCounts = products.reduce<Record<string, number>>((acc, item) => {
      const key = item.image.trim();
      if (!key) return acc;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const duplicateImages = Object.values(imageCounts).filter((count) => count > 1).length;
    const uniqueImages = Object.keys(imageCounts).length;
    const categoryBreakdown = Object.entries(products.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {})).sort((a, b) => b[1] - a[1]);
    return { active, busy, archived, featured, newInquiries, contactedInquiries, doneInquiries, pendingReviews, approvedReviews, duplicateImages, uniqueImages, categoryBreakdown };
  }, [products, inquiries, reviews]);

  const filteredProducts = useMemo(() => {
    const q = catalogueSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter((item) => [item.title, item.category, item.description, item.note].join(" ").toLowerCase().includes(q));
  }, [products, catalogueSearch]);

  function handleLogin() {
    if (loginUser === OWNER_CREDENTIALS.username && loginPass === OWNER_CREDENTIALS.password) {
      window.sessionStorage.setItem(STORAGE_KEYS.adminSession, "true");
      setLoggedIn(true);
      setLoginMessage("Login successful.");
      return;
    }
    setLoginMessage("Wrong username or password.");
  }

  function handleLogout() {
    window.sessionStorage.removeItem(STORAGE_KEYS.adminSession);
    setLoggedIn(false);
    setLoginUser("");
    setLoginPass("");
  }

  function resetDraft() {
    setDraft(emptyDraft);
    setEditingId(null);
  }

  function syncProducts(next: ProductItem[], message: string) {
    setProducts(next);
    saveProducts(next);
    setPanelMessage(message);
  }

  function saveDraft() {
    if (!draft.title.trim() || !draft.image.trim()) {
      setPanelMessage("Title and image are required.");
      return;
    }

    const normalized: ProductItem = {
      id: editingId || makeId(),
      title: draft.title.trim(),
      category: draft.category.trim() || "Custom Project",
      image: draft.image.trim(),
      description: draft.description.trim(),
      note: draft.note.trim() || "Quote after brief",
      featured: draft.featured,
      status: draft.status
    };

    const duplicateImage = products.find((item) => item.image.trim() === normalized.image && item.id !== normalized.id);
    if (duplicateImage) {
      setPanelMessage(`This image is already used by "${duplicateImage.title}". Use one image for one product only.`);
      return;
    }

    const next = editingId
      ? products.map((item) => (item.id === editingId ? normalized : item))
      : [normalized, ...products];

    syncProducts(next, editingId ? "Product updated." : "Product added.");
    resetDraft();
  }

  function startEdit(item: ProductItem) {
    setEditingId(item.id);
    setDraft({ ...item });
    setPanelMessage(`Editing ${item.title}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function removeProduct(id: string) {
    const next = products.filter((item) => item.id !== id);
    syncProducts(next, "Product removed.");
    if (editingId === id) resetDraft();
  }

  function moveProduct(id: string, direction: -1 | 1) {
    const index = products.findIndex((item) => item.id === id);
    const swapIndex = index + direction;
    if (index < 0 || swapIndex < 0 || swapIndex >= products.length) return;
    const next = [...products];
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    syncProducts(next, "Product order updated.");
  }

  function updateProduct(id: string, updates: Partial<ProductItem>) {
    const next = products.map((item) => (item.id === id ? { ...item, ...updates } : item));
    syncProducts(next, "Product updated.");
  }

  function updateInquiry(id: string, status: InquiryItem["status"]) {
    const next = inquiries.map((item) => (item.id === id ? { ...item, status } : item));
    setInquiries(next);
    saveInquiries(next);
    setPanelMessage("Inquiry updated.");
  }

  function deleteInquiry(id: string) {
    const next = inquiries.filter((item) => item.id !== id);
    setInquiries(next);
    saveInquiries(next);
    setPanelMessage("Inquiry removed.");
  }
  function updateReview(id: string, status: ReviewItem["status"]) {
    const next = reviews.map((item) => (item.id === id ? { ...item, status } : item));
    setReviews(next);
    saveReviews(next);
    setPanelMessage("Review updated.");
  }

  function deleteReview(id: string) {
    const next = reviews.filter((item) => item.id !== id);
    setReviews(next);
    saveReviews(next);
    setPanelMessage("Review removed.");
  }


  function restoreDefaults() {
    syncProducts(defaultProducts, "Default product catalogue restored.");
    resetDraft();
  }

  if (!loggedIn) {
    return (
      <main className="min-h-screen bg-paper px-4 py-10 text-ink">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/80 bg-white/75 p-6 shadow-premium backdrop-blur-xl md:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-blossom">Owner Login</p>
              <h1 className="mt-4 font-display text-5xl font-bold tracking-[-0.06em] text-ocean md:text-7xl">Admin panel</h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-ocean/70">Manage products, control featured work, review enquiries, export data, and keep the catalogue current.</p>
            </div>
            <a href="/" className="rounded-full border border-ocean/10 bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-ocean">Back to site</a>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[1.5rem] bg-sky/70 p-6">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-ocean/45">Included functions</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {["Add product", "Edit product", "Delete product", "Featured toggle", "Busy/archive status", "Move up / down", "Review inquiries", "Approve reviews", "Export JSON", "Restore defaults"].map((item) => (
                  <span key={item} className="rounded-full bg-white/90 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-ocean/70">{item}</span>
                ))}
              </div>
              <p className="mt-6 text-sm font-semibold text-ocean/60">Default credentials can be changed in <code>lib/admin-config.ts</code>.</p>
            </div>
            <div className="rounded-[1.5rem] border border-ocean/10 bg-white p-6 shadow-line md:p-8">
              <div className="grid gap-5">
                <label>
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-ocean/40">Username</span>
                  <input value={loginUser} onChange={(e) => setLoginUser(e.target.value)} className="mt-3 w-full rounded-2xl border border-ocean/10 bg-sky/40 px-4 py-4" placeholder="owner" />
                </label>
                <label>
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-ocean/40">Password</span>
                  <input type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} className="mt-3 w-full rounded-2xl border border-ocean/10 bg-sky/40 px-4 py-4" placeholder="••••••••••" />
                </label>
                <button type="button" onClick={handleLogin} className="rounded-full bg-ocean px-6 py-4 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-blossom hover:text-ocean">Login</button>
                <p className="text-sm font-semibold text-ocean/60">{loginMessage}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-8 text-ink md:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] border border-white/80 bg-white/75 p-6 shadow-premium backdrop-blur-xl md:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-blossom">Owner Dashboard</p>
              <h1 className="mt-4 font-display text-5xl font-bold tracking-[-0.06em] text-ocean md:text-7xl">Manage products & inquiries</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-ocean/70">This panel updates the website catalogue on the same browser/device. For real multi-device sync, connect the same UI to a database later.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="/" className="rounded-full border border-ocean/10 bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-ocean">View site</a>
              <button type="button" onClick={() => downloadJson("proprojects-products.json", products)} className="rounded-full border border-ocean/10 bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-ocean">Export products</button>
              <button type="button" onClick={() => downloadJson("proprojects-inquiries.json", inquiries)} className="rounded-full border border-ocean/10 bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-ocean">Export inquiries</button>
              <button type="button" onClick={() => downloadJson("proprojects-reviews.json", reviews)} className="rounded-full border border-ocean/10 bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-ocean">Export reviews</button>
              <button type="button" onClick={handleLogout} className="rounded-full bg-ocean px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white">Logout</button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            {[
              [String(products.length), "Total Products"],
              [String(stats.active), "Active"],
              [String(stats.busy), "Busy"],
              [String(stats.featured), "Featured"],
              [String(stats.newInquiries), "New Inquiries"],
              [String(stats.pendingReviews), "Pending Reviews"]
            ].map(([value, label]) => (
              <div key={label} className="rounded-[1.2rem] bg-sky/70 p-5">
                <p className="font-display text-5xl text-ocean">{value}</p>
                <p className="font-tech mt-2 text-xs font-bold uppercase tracking-[0.16em] text-ocean/45">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
            <div className="rounded-[1.5rem] border border-ocean/10 bg-white p-5 shadow-line">
              <p className="font-tech text-xs font-bold uppercase tracking-[0.18em] text-ocean/45">Catalogue analysis</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  [`${stats.uniqueImages}`, "Unique images"],
                  [`${stats.duplicateImages}`, "Duplicate-image flags"],
                  [`${stats.archived}`, "Archived products"],
                  [`${stats.approvedReviews}`, "Approved reviews"]
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl bg-sky/55 p-4">
                    <p className="font-display text-4xl text-ocean">{value}</p>
                    <p className="font-tech mt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ocean/48">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-ocean/10 bg-white p-5 shadow-line">
              <p className="font-tech text-xs font-bold uppercase tracking-[0.18em] text-ocean/45">Inquiry funnel</p>
              <div className="mt-5 space-y-4">
                {[
                  ["New", stats.newInquiries],
                  ["Contacted", stats.contactedInquiries],
                  ["Done", stats.doneInquiries]
                ].map(([label, value]) => {
                  const max = Math.max(1, inquiries.length || 1);
                  return (
                    <div key={String(label)}>
                      <div className="flex items-center justify-between text-sm text-ocean/70">
                        <span>{label}</span>
                        <strong>{value}</strong>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-sky/60">
                        <div className="h-2 rounded-full bg-ocean" style={{ width: `${(Number(value) / max) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-ocean/10 bg-white p-5 shadow-line">
              <p className="font-tech text-xs font-bold uppercase tracking-[0.18em] text-ocean/45">Category mix</p>
              <div className="mt-5 space-y-3">
                {stats.categoryBreakdown.slice(0, 5).map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3 rounded-2xl bg-sky/55 px-4 py-3 text-sm text-ocean/78">
                    <span className="truncate">{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-white/80 bg-white/75 p-6 shadow-premium backdrop-blur-xl md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-blossom">Product Editor</p>
                <h2 className="mt-3 font-display text-4xl font-bold tracking-[-0.05em] text-ocean">{editingId ? "Edit product" : "Add a new product"}</h2>
              </div>
              {editingId ? <button type="button" onClick={resetDraft} className="rounded-full border border-ocean/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-ocean">Cancel</button> : null}
            </div>

            <div className="mt-6 grid gap-4">
              <label>
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-ocean/40">Title</span>
                <input value={draft.title} onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))} className="mt-3 w-full rounded-2xl border border-ocean/10 bg-sky/40 px-4 py-4" placeholder="Blue academic file set" />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-ocean/40">Category</span>
                  <input list="categories" value={draft.category} onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))} className="mt-3 w-full rounded-2xl border border-ocean/10 bg-sky/40 px-4 py-4" placeholder="Science / Custom Project" />
                </label>
                <label>
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-ocean/40">Status</span>
                  <select value={draft.status} onChange={(e) => setDraft((prev) => ({ ...prev, status: e.target.value as ProductStatus }))} className="mt-3 w-full rounded-2xl border border-ocean/10 bg-sky/40 px-4 py-4">
                    <option value="active">Active</option>
                    <option value="busy">Busy</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
              </div>
              <label>
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-ocean/40">Image path or URL</span>
                <input value={draft.image} onChange={(e) => setDraft((prev) => ({ ...prev, image: e.target.value }))} className="mt-3 w-full rounded-2xl border border-ocean/10 bg-sky/40 px-4 py-4" placeholder="/work/blue-academic-file-set.jpg or https://..." />
              </label>
              <label>
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-ocean/40">Description</span>
                <textarea value={draft.description} onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))} className="mt-3 min-h-28 w-full rounded-2xl border border-ocean/10 bg-sky/40 px-4 py-4" placeholder="Describe finish, pages, style, and use." />
              </label>
              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <label>
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-ocean/40">Small note</span>
                  <input value={draft.note} onChange={(e) => setDraft((prev) => ({ ...prev, note: e.target.value }))} className="mt-3 w-full rounded-2xl border border-ocean/10 bg-sky/40 px-4 py-4" placeholder="Quote after brief" />
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-ocean/10 bg-white px-4 py-4">
                  <input type="checkbox" checked={draft.featured} onChange={(e) => setDraft((prev) => ({ ...prev, featured: e.target.checked }))} />
                  <span className="text-sm font-bold uppercase tracking-[0.16em] text-ocean">Featured</span>
                </label>
              </div>
              {draft.image ? <img src={draft.image} alt="Preview" className="mt-2 max-h-72 w-full rounded-[1.25rem] object-cover" /> : null}
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={saveDraft} className="rounded-full bg-ocean px-6 py-4 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-blossom hover:text-ocean">{editingId ? "Save changes" : "Add product"}</button>
                <button type="button" onClick={restoreDefaults} className="rounded-full border border-ocean/10 bg-white px-6 py-4 text-sm font-bold uppercase tracking-[0.16em] text-ocean">Restore defaults</button>
              </div>
              <p className="text-sm font-semibold text-ocean/60">{panelMessage}</p>
            </div>
            <datalist id="categories">
              {categories.map((category) => <option key={category} value={category} />)}
            </datalist>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-white/75 p-6 shadow-premium backdrop-blur-xl md:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-blossom">Catalogue</p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-[-0.05em] text-ocean">Manage current products</h2>
            <div className="mt-6 grid gap-4">
              <label>
                <span className="font-tech text-xs font-bold uppercase tracking-[0.16em] text-ocean/40">Search catalogue</span>
                <input value={catalogueSearch} onChange={(e) => setCatalogueSearch(e.target.value)} className="mt-3 w-full rounded-2xl border border-ocean/10 bg-sky/40 px-4 py-4" placeholder="Search by title, category, or note" />
              </label>
              <div className="space-y-4">
              {filteredProducts.map((product, index) => (
                <article key={product.id} className="rounded-[1.3rem] border border-ocean/10 bg-white p-4 shadow-line">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    <img src={product.image} alt={product.title} className="h-28 w-full rounded-[1rem] object-cover md:w-36" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-ocean px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">{product.category}</span>
                        {product.featured ? <span className="rounded-full bg-blossom px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-ocean">Featured</span> : null}
                        <span className="rounded-full bg-sky px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-ocean">{product.status}</span>
                      </div>
                      <h3 className="mt-4 font-display text-3xl font-bold leading-none tracking-[-0.04em] text-ocean">{product.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-ocean/68">{product.description}</p>
                      <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-blossom">{product.note}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => startEdit(product)} className="rounded-full border border-ocean/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-ocean">Edit</button>
                    <button type="button" onClick={() => updateProduct(product.id, { featured: !product.featured })} className="rounded-full border border-ocean/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-ocean">{product.featured ? "Unfeature" : "Feature"}</button>
                    <button type="button" onClick={() => updateProduct(product.id, { status: product.status === "busy" ? "active" : "busy" })} className="rounded-full border border-ocean/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-ocean">{product.status === "busy" ? "Mark active" : "Mark busy"}</button>
                    <button type="button" onClick={() => updateProduct(product.id, { status: product.status === "archived" ? "active" : "archived" })} className="rounded-full border border-ocean/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-ocean">{product.status === "archived" ? "Restore" : "Archive"}</button>
                    <button type="button" onClick={() => moveProduct(product.id, -1)} disabled={index === 0} className="rounded-full border border-ocean/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-ocean disabled:opacity-40">Up</button>
                    <button type="button" onClick={() => moveProduct(product.id, 1)} disabled={index === filteredProducts.length - 1 || products.findIndex((item) => item.id === product.id) === products.length - 1} className="rounded-full border border-ocean/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-ocean disabled:opacity-40">Down</button>
                    <button type="button" onClick={() => removeProduct(product.id)} className="rounded-full border border-red-200 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-red-600">Delete</button>
                  </div>
                </article>
              ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/80 bg-white/75 p-6 shadow-premium backdrop-blur-xl md:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-blossom">Inquiries</p>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-display text-4xl font-bold tracking-[-0.05em] text-ocean">Review incoming requests</h2>
              <p className="mt-3 max-w-2xl text-ocean/68">The public form saves enquiries here on the same browser. Mark progress, export data, or clear old entries.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {inquiries.length === 0 ? (
              <div className="rounded-[1.3rem] border border-ocean/10 bg-sky/50 p-6 text-ocean/70">No inquiries saved yet.</div>
            ) : (
              inquiries.map((inquiry) => (
                <article key={inquiry.id} className="rounded-[1.3rem] border border-ocean/10 bg-white p-5 shadow-line">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-ocean px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">{inquiry.subject || "General"}</span>
                    <span className="rounded-full bg-sky px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-ocean">{inquiry.status}</span>
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-ocean">{inquiry.name}</h3>
                  <p className="mt-1 text-sm text-ocean/55">{inquiry.phone} · {inquiry.classLevel || "Class not shared"}</p>
                  <p className="mt-4 leading-7 text-ocean/70">{inquiry.requirement}</p>
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-blossom">{new Date(inquiry.createdAt).toLocaleString()}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button type="button" onClick={() => updateInquiry(inquiry.id, "contacted")} className="rounded-full border border-ocean/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-ocean">Mark contacted</button>
                    <button type="button" onClick={() => updateInquiry(inquiry.id, "done")} className="rounded-full border border-ocean/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-ocean">Mark done</button>
                    <button type="button" onClick={() => deleteInquiry(inquiry.id)} className="rounded-full border border-red-200 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-red-600">Delete</button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/80 bg-white/75 p-6 shadow-premium backdrop-blur-xl md:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-blossom">Reviews</p>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-display text-4xl font-bold tracking-[-0.05em] text-ocean">Approve customer reviews</h2>
              <p className="mt-3 max-w-2xl text-ocean/68">Customers can submit a review and optional image from the website. Approve it here before it appears publicly.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {reviews.length === 0 ? (
              <div className="rounded-[1.3rem] border border-ocean/10 bg-sky/50 p-6 text-ocean/70">No customer reviews submitted yet.</div>
            ) : (
              reviews.map((review) => (
                <article key={review.id} className="rounded-[1.3rem] border border-ocean/10 bg-white p-5 shadow-line">
                  <div className="flex items-start gap-4">
                    {review.image ? <img src={review.image} alt={review.name} className="size-20 rounded-[1rem] object-cover" /> : <div className="grid size-20 place-items-center rounded-[1rem] bg-sky font-display text-3xl text-ocean">{review.name.charAt(0)}</div>}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-ocean px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">{review.role}</span>
                        <span className="rounded-full bg-sky px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-ocean">{review.status}</span>
                      </div>
                      <h3 className="mt-4 text-xl font-bold text-ocean">{review.name}</h3>
                      <p className="mt-4 leading-7 text-ocean/70">{review.quote}</p>
                      <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-blossom">{new Date(review.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button type="button" onClick={() => updateReview(review.id, review.status === "approved" ? "pending" : "approved")} className="rounded-full border border-ocean/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-ocean">{review.status === "approved" ? "Move to pending" : "Approve"}</button>
                    <button type="button" onClick={() => deleteReview(review.id)} className="rounded-full border border-red-200 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-red-600">Delete</button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

      </div>
    </main>
  );
}
