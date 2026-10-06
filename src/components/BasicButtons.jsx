const buttons = [
  { label: "AC", action: "clear", className: "utility" },
  { label: "⌫", action: "backspace", className: "utility" },
  { label: "%", action: "percent", className: "utility" },
  { label: "÷", action: "/", className: "operator" },

  { label: "7", action: "7" },
  { label: "8", action: "8" },
  { label: "9", action: "9" },
  { label: "×", action: "*", className: "operator" },

  { label: "4", action: "4" },
  { label: "5", action: "5" },
  { label: "6", action: "6" },
  { label: "−", action: "-", className: "operator" },

  { label: "1", action: "1" },
  { label: "2", action: "2" },
  { label: "3", action: "3" },
  { label: "+", action: "+", className: "operator" },
];

function BasicButtons({
  scientificMode,
  onModeToggle,
  onPress,
}) {
  return (
    <div className="basic-buttons">
      {buttons.map((button) => (
        <button
          key={button.action}
          className={`calc-button ${button.className || ""}`}
          onClick={() => onPress(button.action)}
        >
          {button.label}
        </button>
      ))}

      <button
        className="calc-button mode-toggle"
        onClick={onModeToggle}
      >
        {scientificMode ? "BASIC" : "SCI"}
      </button>

      <button
        className="calc-button"
        onClick={() => onPress("0")}
      >
        0
      </button>

      <button
        className="calc-button"
        onClick={() => onPress(".")}
      >
        .
      </button>

      <button
        className="calc-button equals"
        onClick={() => onPress("equals")}
      >
        =
      </button>
    </div>
  );
}

export default BasicButtons;