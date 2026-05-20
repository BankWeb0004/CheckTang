/**
 * Update Available Modal
 * Neon-styled popup matching the app's design theme
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X, Sparkles } from 'lucide-react';

interface UpdateModalProps {
  open: boolean;
  currentVersion: string;
  newVersion: string | null;
  onUpdate: () => void;
  onDismiss: () => void;
  lang?: 'en' | 'th';
}

export function UpdateModal({
  open,
  currentVersion,
  newVersion,
  onUpdate,
  onDismiss,
  lang = 'th',
}: UpdateModalProps) {
  const text = {
    th: {
      title: 'มีอัปเดตใหม่!',
      description: 'เวอร์ชันใหม่ของเช็คตังค์พร้อมให้ดาวน์โหลดแล้ว คุณต้องการอัปเดตตอนนี้หรือไม่?',
      updateNow: 'อัปเดตเลย',
      later: 'ภายหลัง',
      current: 'เวอร์ชันปัจจุบัน',
      new: 'เวอร์ชันใหม่',
    },
    en: {
      title: 'Update Available!',
      description: 'A new version of Check Tang is available. Would you like to download it now?',
      updateNow: 'Update Now',
      later: 'Later',
      current: 'Current version',
      new: 'New version',
    },
  };

  const t = text[lang];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDismiss()}>
      <DialogContent className="sm:max-w-[380px] p-0 overflow-hidden border-0 bg-transparent">
        {/* Neon card container */}
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #1a1a2e 0%, #0f0f1a 100%)',
            boxShadow: `
              0 0 60px rgba(0, 102, 255, 0.15),
              0 0 100px rgba(0, 212, 255, 0.1),
              0 25px 50px -12px rgba(0, 0, 0, 0.5)
            `,
          }}
        >
          {/* Neon border glow effect */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: 'linear-gradient(145deg, rgba(0, 102, 255, 0.3), rgba(0, 212, 255, 0.2))',
              padding: '1px',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
              WebkitMaskComposite: 'xor',
            }}
          />

          {/* Animated glow ring */}
          <div
            className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-30 blur-3xl"
            style={{
              background: 'linear-gradient(135deg, #0066ff, #00d4ff)',
              animation: 'pulse 3s ease-in-out infinite',
            }}
          />

          <div className="relative p-6">
            <DialogHeader className="space-y-4">
              {/* Neon icon */}
              <div className="flex justify-center">
                <div
                  className="relative h-20 w-20 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(145deg, rgba(0, 102, 255, 0.2), rgba(0, 212, 255, 0.1))',
                    boxShadow: `
                      0 0 30px rgba(0, 102, 255, 0.3),
                      inset 0 0 20px rgba(0, 212, 255, 0.1)
                    `,
                  }}
                >
                  <Sparkles
                    className="h-10 w-10"
                    style={{
                      color: '#00d4ff',
                      filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.8))',
                    }}
                  />
                </div>
              </div>

              <DialogTitle
                className="text-center text-xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #ffffff, #00d4ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 0 30px rgba(0, 212, 255, 0.3)',
                }}
              >
                {t.title}
              </DialogTitle>

              <DialogDescription className="text-center text-sm text-gray-400 leading-relaxed">
                {t.description}
              </DialogDescription>
            </DialogHeader>

            {/* Version info */}
            <div className="mt-5 flex justify-center gap-6 text-xs">
              <div className="text-center">
                <div className="text-gray-500 mb-1">{t.current}</div>
                <div
                  className="font-mono font-semibold px-3 py-1 rounded-lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#888',
                  }}
                >
                  v{currentVersion}
                </div>
              </div>
              <div className="flex items-center text-gray-600">
                <span className="text-lg">→</span>
              </div>
              <div className="text-center">
                <div className="text-gray-500 mb-1">{t.new}</div>
                <div
                  className="font-mono font-semibold px-3 py-1 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.2), rgba(0, 212, 255, 0.15))',
                    color: '#00d4ff',
                    boxShadow: '0 0 15px rgba(0, 212, 255, 0.2)',
                  }}
                >
                  v{newVersion}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex flex-col gap-2">
              <Button
                onClick={onUpdate}
                className="w-full h-12 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #0066ff, #00d4ff)',
                  color: '#fff',
                  boxShadow: `
                    0 0 20px rgba(0, 102, 255, 0.4),
                    0 4px 15px rgba(0, 0, 0, 0.3)
                  `,
                  border: 'none',
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                {t.updateNow}
              </Button>

              <Button
                variant="ghost"
                onClick={onDismiss}
                className="w-full h-10 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="h-4 w-4 mr-2" />
                {t.later}
              </Button>
            </div>
          </div>
        </div>

        {/* Pulse animation keyframes */}
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.1); }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
