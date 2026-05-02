export default function ProgressBar({ percent }) {
  const clamped = Math.min(percent, 150);
  const color =
    percent >= 100
      ? 'bg-red-500'
      : percent >= 80
      ? 'bg-yellow-500'
      : 'bg-green-500';

  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all ${color}`}
        style={{ width: `${Math.min(clamped, 100)}%` }}
      />
    </div>
  );
}
