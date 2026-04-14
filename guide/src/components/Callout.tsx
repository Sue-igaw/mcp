export default function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-mi-gray-50 rounded-2xl px-6 py-5 my-5">
      <div className="text-[14px] leading-relaxed text-mi-gray-700">{children}</div>
    </div>
  );
}
