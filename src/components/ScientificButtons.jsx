const scientificButtons = [
  { label: "ln", action: "ln" },
  { label: "pow", action: "pow" },
  { label: "√", action: "sqrt" },
  { label: "root", action: "root" },

  { label: "x²", action: "square" },
  { label: "x!", action: "factorial" },
  { label: "(", action: "(" },
  { label: ")", action: ")" },
];

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