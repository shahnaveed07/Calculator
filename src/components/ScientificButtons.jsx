// Configuration for scientific calculator keypad buttons
const scientificButtons = [
  { label: "ln", action: "ln" },
  { label: "pow", action: "pow" },
  { label: "√", action: "sqrt" },
  { label: "1/x", action: "reciprocal" },

  { label: "x²", action: "square" },
  { label: "x!", action: "factorial" },
  { label: "(", action: "(" },
  { label: ")", action: ")" },
];

// Renders the scientific keypad row when scientific mode is enabled
function ScientificButtons({ onPress }) {
  return (
    <div className="scientific-buttons">
      {scientificButtons.map((button) => (
        <button
          key={button.action}
          className="scientific-button"
          onClick={() => onPress(button.action)}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
}

export default ScientificButtons;