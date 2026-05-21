import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckTangNeonIcon } from "@/components/expense/CheckTangNeonIcon";
import { Download, Sparkles } from "lucide-react";
import type { VersionManifest } from "@/lib/app-config";

type UpdateModalProps = {
  open: boolean;
  updateInfo: VersionManifest | null;
  currentVersion: string;
  onUpdate: () => void;
  onDismiss: () => void;
};

export function UpdateModal({
  open,
  updateInfo,
  currentVersion,
  onUpdate,
  onDismiss,
}: UpdateModalProps) {
  if (!updateInfo) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onDismiss();
      }}
    >
      <DialogContent
        className="max-w-[340px] border-0 bg-transparent p-0 shadow-none [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div
          className="relative overflow-hidden rounded-3xl border p-6"
          style={{
            background: "linear-gradient(160deg, #0f0f1a 0%, #1a1a2e 55%, #12121f 100%)",
            borderColor: "rgba(0, 212, 255, 0.35)",
            boxShadow:
              "0 0 0 1px rgba(0, 102, 255, 0.15), 0 0 40px rgba(0, 102, 255, 0.25), 0 24px 48px rgba(0, 0, 0, 0.45)",
          }}
        >
          <div
            className="pointer-events-none absolute -top-16 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full blur-3xl"
            style={{ background: "rgba(0, 212, 255, 0.35)" }}
          />
          <div
            className="pointer-events-none absolute -bottom-10 -right-6 h-28 w-28 rounded-full blur-2xl"
            style={{ background: "rgba(0, 102, 255, 0.3)" }}
          />

          <DialogHeader className="relative space-y-4 text-center sm:text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl"
              style={{
                background: "rgba(0, 102, 255, 0.12)",
                boxShadow: "0 0 24px rgba(0, 212, 255, 0.25)",
              }}
            >
              <CheckTangNeonIcon size={64} />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                style={{
                  color: "#7ee8ff",
                  background: "rgba(0, 212, 255, 0.12)",
                  border: "1px solid rgba(0, 212, 255, 0.28)",
                }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Update Available
              </div>

              <DialogTitle
                className="text-xl font-bold tracking-tight"
                style={{
                  color: "#f4f8ff",
                  textShadow: "0 0 18px rgba(0, 212, 255, 0.35)",
                }}
              >
                New version ready
              </DialogTitle>

              <DialogDescription className="text-sm leading-relaxed" style={{ color: "#9eb4d4" }}>
                v{currentVersion} →{" "}
                <span className="font-semibold" style={{ color: "#00d4ff" }}>
                  v{updateInfo.version}
                </span>
              </DialogDescription>
            </div>
          </DialogHeader>

          {updateInfo.releaseNotes ? (
            <p
              className="relative mt-4 rounded-2xl px-3 py-2.5 text-center text-xs leading-relaxed"
              style={{
                color: "#b8c9e6",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(0, 212, 255, 0.15)",
              }}
            >
              {updateInfo.releaseNotes}
            </p>
          ) : null}

          <DialogFooter className="relative mt-6 flex-col gap-2 sm:flex-col sm:space-x-0">
            <Button
              className="h-11 w-full rounded-2xl border-0 text-sm font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, #0066ff 0%, #00a8ff 55%, #00d4ff 100%)",
                boxShadow: "0 8px 24px rgba(0, 102, 255, 0.45)",
              }}
              onClick={onUpdate}
            >
              <Download className="h-4 w-4" />
              Update Now
            </Button>
            <Button
              variant="ghost"
              className="h-10 w-full rounded-2xl text-sm font-medium hover:bg-white/5"
              style={{ color: "#8fa8c8" }}
              onClick={onDismiss}
            >
              Later
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
