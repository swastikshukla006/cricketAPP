export type FeaturedProject = {
  title: string;
  subject: string;
  classLevel: string;
  description: string;
  image: string;
};

export type ProductStatus = "active" | "busy" | "archived";

export type ProductItem = {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  note: string;
  featured: boolean;
  status: ProductStatus;
};

export type InquiryItem = {
  id: string;
  name: string;
  phone: string;
  classLevel: string;
  subject: string;
  requirement: string;
  createdAt: string;
  status: "new" | "contacted" | "done";
};

export type ReviewItem = {
  id: string;
  name: string;
  role: string;
  quote: string;
  image?: string;
  createdAt: string;
  status: "pending" | "approved";
};

export const navItems = [
  ["About", "#about"],
  ["Services", "#services"],
  ["Projects", "#projects"],
  ["Products", "#product-styles"],
  ["Gallery", "#gallery"],
  ["FAQ", "#faq"],
  ["Contact", "#contact"]
] as const;

export const services = [
  {
    title: "Custom Written Projects",
    eyebrow: "Subject Files",
    copy: "From rough brief to submission-ready file, every project is planned around the class level, subject, deadline, and page requirement."
  },
  {
    title: "Premium File Covers & Records",
    eyebrow: "Presentation Finish",
    copy: "Handmade cover pages, journals, records, bibliographies, and themed written work finished for neat scoring and a strong first impression."
  },
  {
    title: "Research Sheets & Documentation",
    eyebrow: "Written Work Only",
    copy: "Editorial academic sheets, acknowledgements, index pages, bibliography pages, and subject documentation crafted with a polished handmade look."
  }
];

export const categories = [
  "Business Studies",
  "Commerce Project",
  "Mathematics",
  "Science",
  "Geography",
  "Economics",
  "History",
  "English",
  "Hindi",
  "Biology",
  "Chemistry",
  "Physics",
  "Research File",
  "Teacher Training",
  "Bibliography Page",
  "Subject Cover Pack",
  "Custom Written Projects"
];

export const defaultProducts: ProductItem[] = [
  {
    id: "blue-academic-file-set",
    title: "Blue Academic File Set",
    category: "Custom Written Projects",
    image: "/work/blue-academic-file-set.jpg",
    description: "A coordinated blue file set with profile, acknowledgement, borders, page frames, and presentation-ready written sections.",
    note: "Show interest for a custom quote",
    featured: true,
    status: "active"
  },
  {
    id: "management-principles-file",
    title: "Management Principles Cover",
    category: "Business Studies",
    image: "/work/management-principles-file.jpg",
    description: "A green themed business-studies file cover with bold lettering, layered cut-outs, receipt styling, and clean presentation.",
    note: "Quote depends on brief and finish",
    featured: true,
    status: "active"
  },
  {
    id: "teaching-practice-record",
    title: "Teaching Practice Record",
    category: "Teacher Training",
    image: "/work/teaching-practice-record.jpg",
    description: "A complete teaching-practice record with introduction, recommendations, observations, lesson plans, acknowledgement, and coordinated section pages.",
    note: "Deadline-based quote",
    featured: true,
    status: "active"
  },
  {
    id: "geography-cyclone-pages",
    title: "Geography Cyclone Project",
    category: "Geography",
    image: "/work/geography-cyclone-pages.jpg",
    description: "A polished geography project with introduction, cyclone topic pages, map work, index, bibliography, and soft blue presentation styling.",
    note: "Pages and level decide the quote",
    featured: true,
    status: "active"
  },
  {
    id: "science-cover-file",
    title: "Science Cover File",
    category: "Science",
    image: "/work/science-cover-file.jpg",
    description: "A high-contrast science cover file with hand-drawn scientific illustrations, grid detail, and premium handmade styling.",
    note: "Quote after brief",
    featured: false,
    status: "active"
  },
  {
    id: "mathematics-cover-file",
    title: "Mathematics Cover File",
    category: "Mathematics",
    image: "/work/mathematics-cover-file.jpg",
    description: "Minimal mathematics cover work with chalkboard contrast, doodled geometry motifs, and a neat handmade header strip.",
    note: "Show interest",
    featured: false,
    status: "active"
  },
  {
    id: "pink-research-file-set",
    title: "Pink Research File Set",
    category: "Research File",
    image: "/work/pink-research-file-set.jpg",
    description: "A soft pink written project bundle with introduction, acknowledgement, bibliography, research sheets, and handwritten details.",
    note: "Quote after discussion",
    featured: false,
    status: "active"
  },
  {
    id: "business-studies-bundle",
    title: "Business Studies Bundle",
    category: "Business Studies",
    image: "/work/business-studies-bundle.jpg",
    description: "An academic business-studies bundle arranged section-by-section with colourful grids, observations, roles, tools used, and presentation pages.",
    note: "Custom quote",
    featured: false,
    status: "active"
  },
  {
    id: "fayol-principles-file",
    title: "Fayol's Principles Application File",
    category: "Business Studies",
    image: "/work/fayol-principles-file.jpg",
    description: "A themed principles file with cafe-inspired visual language, layered paper effects, and a strong handwritten display style.",
    note: "Show interest",
    featured: false,
    status: "active"
  },
  {
    id: "starbucks-project-bundle",
    title: "Cafe Theme Project Bundle",
    category: "Commerce Project",
    image: "/work/starbucks-project-bundle.jpg",
    description: "A grouped set of cover pages and written sections built around a café-inspired moodboard and layered paper textures.",
    note: "Quote after brief",
    featured: false,
    status: "active"
  },
  {
    id: "starbucks-cover-board",
    title: "Cafe Cover Board",
    category: "Commerce Project",
    image: "/work/starbucks-cover-board.jpg",
    description: "A clean cover board with central title work, editorial collage accents, and a premium handmade composition.",
    note: "Custom finish available",
    featured: false,
    status: "active"
  },
  {
    id: "bibliography-reference-page",
    title: "Bibliography Reference Page",
    category: "Bibliography Page",
    image: "/work/bibliography-reference-page.jpg",
    description: "A neat bibliography page with torn-paper cards, illustrated references, and a tidy academic layout.",
    note: "Useful add-on page",
    featured: false,
    status: "active"
  },
  {
    id: "subject-portfolio-pack",
    title: "Subject Portfolio Pack",
    category: "Subject Cover Pack",
    image: "/work/subject-portfolio-pack.jpg",
    description: "A mixed cover-file pack for multiple written subjects with different colour palettes, clean lettering, and handmade decorative elements.",
    note: "Quote after subject list",
    featured: false,
    status: "busy"
  }
];

export const galleryImages = [
  { src: "/work/blue-academic-file-set.jpg", label: "Blue academic file set" },
  { src: "/work/management-principles-file.jpg", label: "Management principles cover" },
  { src: "/work/teaching-practice-record.jpg", label: "Teaching practice record" },
  { src: "/work/geography-cyclone-pages.jpg", label: "Geography cyclone project" },
  { src: "/work/geography-project-set.jpg", label: "Geography project set" },
  { src: "/work/bibliography-reference-page.jpg", label: "Bibliography reference page" },
  { src: "/work/mathematics-cover-file.jpg", label: "Mathematics cover file" },
  { src: "/work/science-cover-file.jpg", label: "Science cover file" },
  { src: "/work/business-studies-bundle.jpg", label: "Business studies bundle" },
  { src: "/work/fayol-principles-file.jpg", label: "Fayol principles file" },
  { src: "/work/starbucks-project-bundle.jpg", label: "Cafe theme bundle" },
  { src: "/work/starbucks-outline-page.jpg", label: "Cafe outline page" },
  { src: "/work/starbucks-cover-board.jpg", label: "Cafe cover board" },
  { src: "/work/pink-research-file-set.jpg", label: "Pink research file set" },
  { src: "/work/subject-portfolio-pack.jpg", label: "Subject portfolio pack" },
  { src: "/work/teaching-practice-spread.jpg", label: "Teaching practice spread" }
];

export const processSteps = [
  ["01", "Choose Subject", "Pick the subject, topic, class level, file type, and deadline."],
  ["02", "Share Requirements", "Send reference photos, school rules, page count, style direction, and delivery details."],
  ["03", "We Design", "The written project is planned, styled, lettered, and documented with care."],
  ["04", "Quality Check", "Finish, layout, neatness, page sequence, and presentation are reviewed before handover."],
  ["05", "Delivery", "Receive the completed written work ready for submission and presentation."]
] as const;

export const reasons = [
  "Premium handmade finish",
  "Written work only",
  "Deadline-focused delivery",
  "Professional presentation",
  "Budget-aware planning",
  "WhatsApp support"
];

export const testimonials = [
  {
    name: "Aarav S.",
    role: "Class 10 Student",
    quote: "The file looked polished, the sections were neat, and I could submit it with confidence."
  },
  {
    name: "Mrs. Mehra",
    role: "Parent",
    quote: "They understood the school requirements quickly and delivered a project that felt neat, premium, and age-appropriate."
  },
  {
    name: "School Faculty",
    role: "School Coordinator",
    quote: "The written projects are made with a rare level of presentation discipline. They look student-friendly but professionally finished."
  }
];

export const faqs = [
  {
    question: "Do you make fully custom projects?",
    answer: "Yes. Share your topic, class, deadline, budget, page requirements, and any school instructions. The final written work is planned around your exact need."
  },
  {
    question: "Do you only provide written work?",
    answer: "Yes. ProProjects focuses on written project files, journals, records, research sheets, practical-style files, bibliography pages, and presentation-ready documentation."
  },
  {
    question: "Do you provide explanation support?",
    answer: "Projects can include a clear explanation sheet, labelled sections, and demo notes so students can present confidently."
  },
  {
    question: "How do I place an order?",
    answer: "Use the inquiry form or WhatsApp CTA. Send your subject, topic, class level, deadline, and reference ideas to get a quote."
  }
];

export const stats = [
  ["500+", "Students Served"],
  ["350+", "Premium Files"],
  ["40+", "Schools Served"],
  ["100%", "Custom Written Work"]
] as const;
