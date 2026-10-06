// Renders the calculator display screen with the current formatted value
function Display({ value }) {
  return (
    <div className="display">
      <span>{value}</span>
    </div>
  );
}

export default Display;