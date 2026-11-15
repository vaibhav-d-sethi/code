export default function StatCard({ label, value, tone }) {
  return (
    <div className="stat">
      <div className="label">{label}</div>
      <div className="value">
        {tone ? <span className={`badge ${tone}`}>{value}</span> : value}
      </div>
    </div>
  );
}
