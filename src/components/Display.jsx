// Renders the calculator display screen with current formatted value, expression history, and active angle mode badge
function Display({ value, history, angleMode }) {
  return (
    <div className="display">
      <div className="display-top-row">
        {angleMode ? <span className="angle-mode-badge">{angleMode}</span> : <span />}
        {history && <span className="display-history">{history}</span>}
      </div>
      <span className="display-value" title={value}>{value}</span>
    </div>
  );
}

export default Display;