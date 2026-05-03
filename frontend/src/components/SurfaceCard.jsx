export default function SurfaceCard({ children, className = '', padding = 'p-6' }) {
  return <div className={`bg-white rounded-xl shadow-sm ${padding} ${className}`}>{children}</div>;
}
