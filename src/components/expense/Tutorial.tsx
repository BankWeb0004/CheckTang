import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useStore } from "@/lib/expense-store";
import { CheckTangLogo } from "@/components/expense/CheckTangLogo";
import { Button } from "@/components/ui/button";
import { Calculator, PieChart, Sparkles, X, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function Tutorial({ open, onClose }: Props) {
  const { t } = useStore();
  const tut = t.tutorial;
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
    {
      visual: (
        <div className="flex items-center justify-center text-foreground">
          <CheckTangLogo />
        </div>
      ),
      title: tut.s1Title,
      body: tut.s1Body,
    },
    {
      visual: (
        <div className="flex items-center justify-center">
          <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center">
            <Calculator className="h-12 w-12 text-primary" />
          </div>
        </div>
      ),
      title: tut.s2Title,
      body: tut.s2Body,
    },
    {
      visual: (
        <div className="flex items-center justify-center">
          <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center">
            <PieChart className="h-12 w-12 text-primary" />
          </div>
        </div>
      ),
      title: tut.s3Title,
      body: tut.s3Body,
    },
    {
      visual: (
        <div className="flex items-center justify-center">
          <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>
        </div>
      ),
      title: tut.s4Title,
      body: tut.s4Body,
    },
  ];

  const isLast = selected === slides.length - 1;

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      {/* Skip */}
      <div className="flex items-center justify-between p-4">
        <span className="text-xs font-semibold tracking-widest text-muted-foreground">
          {selected + 1} / {slides.length}
        </span>
        {!isLast ? (
          <button
            onClick={onClose}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg"
          >
            {tut.skip}
          </button>
        ) : (
          <button
            onClick={onClose}
            aria-label="close"
            className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Slides */}
      <div className="flex-1 overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((s, i) => (
            <div key={i} className="flex-[0_0_100%] min-w-0 h-full flex items-center justify-center px-8">
              <div className="max-w-sm w-full flex flex-col items-center text-center gap-8">
                <div className="h-32 flex items-center justify-center">{s.visual}</div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold tracking-tight text-foreground">
                    {s.title}
                  </h2>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {s.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 py-4">
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

      {/* Nav */}
      <div className="p-5 pb-8 flex items-center gap-3">
        {selected > 0 && (
          <Button
            variant="outline"
            onClick={() => emblaApi?.scrollPrev()}
            className="rounded-2xl h-12 px-5"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {tut.back}
          </Button>
        )}
        <Button
          onClick={() => {
            if (isLast) onClose();
            else emblaApi?.scrollNext();
          }}
          className="flex-1 rounded-2xl h-12 text-base font-semibold"
        >
          {isLast ? tut.getStarted : tut.next}
          {!isLast && <ChevronRight className="h-4 w-4 ml-1" />}
        </Button>
      </div>
    </div>
  );
}
