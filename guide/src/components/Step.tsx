export default function Step({ num, children }: { num: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 mb-3.5">
      <span className="shrink-0 text-[15px] text-mi-gray-700 mt-[1px]">{num}.</span>
      <div className="flex-1 text-[15px] text-mi-gray-700 leading-relaxed">{children}</div>
    </div>
  );
}
