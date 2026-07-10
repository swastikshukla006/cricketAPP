"use client";

import { useState } from "react";

type AccordionItem = {
  question: string;
  answer: string;
};

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="divide-y divide-ink/10 border-y border-ink/10">
      {items.map((item, index) => {
        const isOpen = activeIndex === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${index}`}
              onClick={() => setActiveIndex(isOpen ? -1 : index)}
              className="focus-ring flex w-full items-center justify-between gap-6 py-7 text-left"
            >
              <span className="font-display text-2xl font-black tracking-[-0.03em] md:text-3xl">{item.question}</span>
              <span
                aria-hidden="true"
                className={`grid size-10 shrink-0 place-items-center rounded-full border border-ink/10 text-xl transition-[transform,background-color,color] duration-300 ease-out ${isOpen ? "rotate-45 bg-ink text-white" : "bg-white"}`}
              >
                +
              </span>
            </button>
            <div
              id={`faq-panel-${index}`}
              className={`grid transition-[grid-template-rows,padding] duration-300 ease-out ${isOpen ? "grid-rows-[1fr] pb-7" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <p className="max-w-3xl text-base leading-8 text-ink/70 md:text-lg">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
