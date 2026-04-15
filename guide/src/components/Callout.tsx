export default function Callout({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "danger" }) {
  const styles = {
    default: "bg-mi-gray-50 text-mi-gray-700",
    danger: "bg-red-50 border border-red-200 text-red-800",
  };

  return (
    <div className={`rounded-2xl px-6 py-5 my-5 ${styles[variant]}`}>
      <div className="text-[14px] leading-relaxed">{children}</div>
    </div>
  );
}
