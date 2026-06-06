import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { CheckTangLogo } from "@/components/expense/CheckTangLogo";
import { Check, ChevronRight, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Universal textless onboarding carousel.
 * Visual-only — no body text. Navigated with chevron-right between slides
 * and a final checkmark to enter the app.
 */
export function Tutorial({ open, onClose }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "center" });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSel = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSel);
    onSel();
    return () => {
      emblaApi.off("select", onSel);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (open && emblaApi) {
      emblaApi.scrollTo(0, true);
      setSelected(0);
    }
  }, [open, emblaApi]);

  if (!open) return null;

  const slides = [
    // Slide 1 — logo with branded gradient backdrop
    <div key="s1" className="flex flex-col items-center justify-center gap-6 text-foreground">
      <div
        className="relative h-48 w-48 rounded-[2rem] flex items-center justify-center overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, color-mix(in oklab, var(--primary) 22%, transparent), color-mix(in oklab, var(--primary) 6%, transparent))',
          boxShadow: '0 18px 40px -16px color-mix(in oklab, var(--primary) 45%, transparent)',
        }}
      >
        <div
          className="absolute -top-8 -right-8 h-24 w-24 rounded-full"
          style={{ background: 'color-mix(in oklab, var(--primary) 30%, transparent)', filter: 'blur(18px)' }}
        />
        <div
          className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full"
          style={{ background: 'color-mix(in oklab, var(--primary) 22%, transparent)', filter: 'blur(22px)' }}
        />
        <CheckTangLogo showLabel={false} className="text-primary relative" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold tracking-tight">Check Tang</h2>
        <p className="text-sm text-muted-foreground">เช็คตังค์ทุกบาท ทุกกระเป๋า</p>
      </div>
      <div className="flex gap-3 text-3xl">💰 ✨ 📊</div>
    </div>,

    // Slide 2 — wallet with coins + floating category emojis
    <div key="s2" className="flex flex-col items-center justify-center gap-6">
      <div className="relative h-44 w-56">
        <div
          className="absolute inset-x-4 bottom-2 h-24 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, var(--primary), color-mix(in oklab, var(--primary) 60%, white))",
            boxShadow: "0 10px 24px -8px color-mix(in oklab, var(--primary) 50%, transparent)",
          }}
        />
        <div className="absolute left-1/2 -translate-x-1/2 top-14 text-4xl">👛</div>
        <div className="absolute left-2 top-2 text-3xl animate-pulse">🍔</div>
        <div className="absolute right-4 top-0 text-3xl animate-bounce">🚗</div>
        <div className="absolute left-10 top-10 text-2xl">🛍️</div>
        <div className="absolute right-2 top-12 text-2xl">🏠</div>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-2 w-12 rounded-full bg-primary/30" />
        <span className="h-2 w-2 rounded-full bg-primary" />
        <span className="h-2 w-12 rounded-full bg-primary/30" />
      </div>
    </div>,

    // Slide 3 — chart morphing into transaction blocks
    <div key="s3" className="flex flex-col items-center justify-center gap-6">
      <div className="relative h-44 w-56 flex items-center gap-4 justify-center">
        {/* donut */}
        <svg viewBox="0 0 80 80" className="h-32 w-32">
          <circle cx="40" cy="40" r="30" fill="none" stroke="var(--muted)" strokeWidth="14" />
          <circle
            cx="40"
            cy="40"
            r="30"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="14"
            strokeDasharray="120 188"
            transform="rotate(-90 40 40)"
          />
          <circle
            cx="40"
            cy="40"
            r="30"
            fill="none"
            stroke="var(--income)"
            strokeWidth="14"
            strokeDasharray="40 188"
            strokeDashoffset="-120"
            transform="rotate(-90 40 40)"
          />
        </svg>
        <ChevronRight className="h-6 w-6 text-muted-foreground" />
        <div className="flex flex-col gap-1.5">
          <div className="h-3 w-20 rounded-full bg-primary/70" />
          <div className="h-3 w-16 rounded-full bg-income/70" style={{ background: "var(--income)" }} />
          <div className="h-3 w-24 rounded-full bg-expense/70" style={{ background: "var(--expense)" }} />
          <div className="h-3 w-14 rounded-full bg-muted" />
        </div>
      </div>
    </div>,

    // Slide 4 — big + button
    <div key="s4" className="flex flex-col items-center justify-center gap-6">
      <div className="h-36 w-36 rounded-full bg-primary/15 flex items-center justify-center">
        <div
          className="h-24 w-24 rounded-full text-white flex items-center justify-center text-5xl font-light"
          style={{
            background: "var(--primary)",
            boxShadow: "0 16px 36px -12px color-mix(in oklab, var(--primary) 60%, transparent)",
          }}
        >
          +
        </div>
      </div>
      <div className="text-5xl">🎉</div>
    </div>,
  ];

  const isLast = selected === slides.length - 1;

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4">
        <span className="text-[11px] font-semibold tracking-widest text-muted-foreground">
          {selected + 1} / {slides.length}
        </span>
        <button
          onClick={onClose}
          aria-label="close"
          className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Slides */}
      <div className="flex-1 overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((s, i) => (
            <div
              key={i}
              className="flex-[0_0_100%] min-w-0 h-full flex items-center justify-center px-8 py-4"
            >
              {s}
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 py-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className="h-2 rounded-full transition-all"
            style={{
              width: i === selected ? 24 : 8,
              background: i === selected ? "var(--primary)" : "var(--muted)",
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Nav button (icon-only) */}
      <div className="p-6 pb-10 flex items-center justify-center">
        <button
          onClick={() => {
            if (isLast) onClose();
            else emblaApi?.scrollNext();
          }}
          aria-label={isLast ? "done" : "next"}
          className="h-16 w-16 rounded-full text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
          style={{
            background: "var(--primary)",
            boxShadow: "0 14px 30px -10px color-mix(in oklab, var(--primary) 60%, transparent)",
          }}
        >
          {isLast ? <Check className="h-7 w-7" /> : <ChevronRight className="h-7 w-7" />}
        </button>
      </div>
    </div>
  );
}
