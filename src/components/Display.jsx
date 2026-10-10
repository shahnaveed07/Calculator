// Renders the calculator display screen with current formatted value and optional angle mode badge
function Display({ value, angleMode }) {
  return (
    <div className="display">
      {angleMode && <span className="angle-mode-badge">{angleMode}</span>}
      <span className="display-value">{value}</span>
    </div>
  );
}

export default Display;