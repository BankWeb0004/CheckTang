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
          <div className="w-full max-w-[220px] rounded-3xl border border-border bg-muted/10 p-3 text-left">
            <div className="flex gap-2 mb-3">
              <span className="rounded-full bg-primary/10 text-primary text-[11px] px-2 py-1">รายรับ</span>
              <span className="rounded-full bg-muted/20 text-muted-foreground text-[11px] px-2 py-1">รายจ่าย</span>
            </div>
            <div className="rounded-2xl bg-background border border-border p-3">
              <div className="h-9 rounded-2xl bg-slate-100 text-[11px] text-muted-foreground flex items-center justify-center">
                เลือกหมวดหมู่
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
                <span className="col-span-3 rounded-2xl bg-primary/10 text-primary py-2 text-center">หมวดหมู่</span>
                <span className="rounded-2xl bg-background border border-border py-2 text-center">กิน</span>
                <span className="rounded-2xl bg-background border border-border py-2 text-center">เดินทาง</span>
                <span className="rounded-2xl bg-background border border-border py-2 text-center">อื่นๆ</span>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm font-semibold">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', '⌫'].map((label) => (
                <div key={label} className="rounded-2xl bg-background border border-border py-2">{label}</div>
              ))}
            </div>
          </div>
        </div>
      ),
      title: tut.s2Title,
      body: tut.s2Body,
    },
    {
      visual: (
        <div className="flex items-center justify-center">
          <div className="w-full max-w-[220px] rounded-3xl border border-border bg-muted/10 p-4">
            <div className="h-20 rounded-3xl bg-slate-200 relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-1/2 bg-primary/70 rounded-r-full" />
              <div className="absolute inset-y-0 right-0 w-1/3 bg-amber-400/80 rounded-l-full" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
              <div className="rounded-2xl bg-background border border-border p-2">ยอดรวม</div>
              <div className="rounded-2xl bg-background border border-border p-2">รายรับ-รายจ่าย</div>
              <div className="rounded-2xl bg-background border border-border p-2">วงกลมสรุป</div>
              <div className="rounded-2xl bg-background border border-border p-2">เห็นชัดเลย</div>
            </div>
          </div>
        </div>
      ),
      title: tut.s3Title,
      body: tut.s3Body,
    },
    {
      visual: (
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="h-28 w-28 rounded-full bg-primary/10 shadow-[0_0_0_18px_rgba(59,130,246,0.18)] flex items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">+</div>
          </div>
          <div className="text-sm font-semibold text-primary">กดเลยตรงนี้</div>
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
            <div key={i} className="flex-[0_0_100%] min-w-0 h-full flex flex-col items-center justify-between px-8 py-4">
              <div className="max-w-md w-full flex flex-col items-center text-center gap-8">
                <div className="w-full max-w-[320px] rounded-3xl p-3 bg-muted/10 border border-border shadow-sm overflow-hidden">
                  {s.visual}
                </div>
                <div className="w-full px-2">
                  <h2 className="text-3xl font-bold tracking-tight text-foreground">
                    {s.title}
                  </h2>
                  <p className="text-base text-muted-foreground leading-relaxed mt-3">
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
