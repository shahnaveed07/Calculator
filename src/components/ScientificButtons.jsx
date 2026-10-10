// Configuration for scientific calculator keypad buttons
const scientificButtons = [
  { label: "DEG", action: "deg" },
  { label: "RAD", action: "rad" },
  { label: "sin", action: "sin" },
  { label: "cos", action: "cos" },

  { label: "tan", action: "tan" },
  { label: "π", action: "pi" },
  { label: "ln", action: "ln" },
  { label: "pow", action: "pow" },

  { label: "√", action: "sqrt" },
  { label: "1/x", action: "reciprocal" },
  { label: "x²", action: "square" },
  { label: "x!", action: "factorial" },

  { label: "(", action: "(" },
  { label: ")", action: ")" },
];

// Renders the scientific keypad when scientific mode is enabled
function ScientificButtons({ onPress, angleMode = "DEG" }) {
  return (
    <div className="scientific-buttons">
      {scientificButtons.map((button) => {
        const isActiveAngle =
          (button.action === "deg" && angleMode === "DEG") ||
          (button.action === "rad" && angleMode === "RAD");

        return (
          <button
            key={button.action}
            className={`scientific-button ${isActiveAngle ? "active-mode" : ""}`}
            onClick={() => onPress(button.action)}
          >
            {button.label}
          </button>
        );
      })}
    </div>
  );
}

export default ScientificButtons;