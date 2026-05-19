import { CheckTangNeonIcon } from "@/components/expense/CheckTangNeonIcon";

export function IconPreview() {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center gap-12">
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-muted-foreground">Size: 120px</p>
        <CheckTangNeonIcon size={120} />
      </div>
      
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-muted-foreground">Size: 160px</p>
        <CheckTangNeonIcon size={160} />
      </div>

      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-muted-foreground">Size: 200px</p>
        <CheckTangNeonIcon size={200} />
      </div>

      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-muted-foreground">Dark Background</p>
        <div className="bg-slate-900 p-8 rounded-2xl">
          <CheckTangNeonIcon size={160} />
        </div>
      </div>
    </div>
  );
}
