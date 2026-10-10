import { useEffect, useRef, useState } from "react";
import Display from "./Display";
import BasicButtons from "./BasicButtons";
import ScientificButtons from "./ScientificButtons";
import {
  evaluateExpression,
  formatExpression,
  formatResult,
} from "../utils/calculator";

function Calculator() {
  // Stores the raw mathematical expression string
  const [expression, setExpression] = useState("");
  // Formatted string displayed on screen
  const [display, setDisplay] = useState("0");
  // Holds the completed expression history (e.g. "200 × 10% =")
  const [history, setHistory] = useState("");
  // Toggle state for showing/hiding scientific buttons
  const [scientificMode, setScientificMode] = useState(false);
  // Angle mode for scientific trigonometric functions ("DEG" or "RAD")
  const [angleMode, setAngleMode] = useState("DEG");
  // Tracks if the current screen value was just produced by a calculation
  const [justCalculated, setJustCalculated] = useState(false);

  // Updates expression state and formats it for user display
  const updateExpression = (value) => {
    setExpression(value);
    setDisplay(value ? formatExpression(value) : "0");
    setJustCalculated(false);
  };

  // Clears the entire expression and resets the display to 0
  const clear = () => {
    setExpression("");
    setDisplay("0");
    setHistory("");
    setJustCalculated(false);
  };

  // Appends a digit (0-9) to the expression
  const addNumber = (number) => {
    if (justCalculated) {
      updateExpression(number);
      return;
    }

    const last = expression.at(-1);

    // If previous character was a closing bracket, insert implicit multiplication
    if (last === ")") {
      updateExpression(`${expression}*${number}`);
      return;
    }

    updateExpression(expression + number);
  };

  // Appends a decimal point, ensuring no number contains multiple decimals
  const addDecimal = () => {
    if (justCalculated) {
      updateExpression("0.");
      return;
    }

    // Prevent attaching decimal point directly after percent or closing bracket
    if (expression.endsWith("%") || expression.endsWith(")")) {
      return;
    }

    // Find the current active number segment after any operator or bracket
    const currentNumber = expression.match(/(\d*\.?\d*)$/)?.[1] ?? "";

    if (currentNumber.includes(".")) {
      return;
    }

    if (!expression || /[+\-*/^(]$/.test(expression)) {
      updateExpression(`${expression}0.`);
      return;
    }

    updateExpression(`${expression}.`);
  };

  // Appends or updates arithmetic operators (+, -, *, /)
  const addOperator = (operator) => {
    if (!expression) {
      if (operator === "-") {
        updateExpression("-");
      }
      return;
    }

    let value = expression;

    // Replace previous operator if user changes operator before entering a number
    if (/[+\-*/^]$/.test(value)) {
      value = value.slice(0, -1) + operator;
    } else {
      value += operator;
    }

    updateExpression(value);
  };

  // Appends percentage operator to the expression
  const addPercent = () => {
    if (!expression || /[+\-*/^(]$/.test(expression) || expression.endsWith("%")) {
      return;
    }

    updateExpression(`${expression}%`);
  };

  // Handles adding opening and closing brackets
  const addBracket = (bracket) => {
    if (bracket === "(") {
      if (justCalculated) {
        updateExpression("(");
        return;
      }

      const last = expression.at(-1);

      // Insert implicit multiplication before bracket if preceded by digit or close bracket
      if (/\d|\)$/.test(last)) {
        updateExpression(`${expression}*(`);
      } else {
        updateExpression(`${expression}(`);
      }

      return;
    }

    const open = (expression.match(/\(/g) || []).length;
    const close = (expression.match(/\)/g) || []).length;
    const last = expression.at(-1);

    // Prevent closing bracket if no open bracket exists or if directly after an operator
    if (open <= close || /[+\-*/^(]$/.test(last)) {
      return;
    }

    updateExpression(`${expression})`);
  };

  // Appends the pi (π) constant, inserting implicit multiplication if after a number, bracket, percent, or constant
  const addPi = () => {
    if (justCalculated) {
      updateExpression("π");
      return;
    }

    if (!expression) {
      updateExpression("π");
      return;
    }

    const last = expression.at(-1);

    if (/\d|\)|%|π|e$/.test(last)) {
      updateExpression(`${expression}*π`);
      return;
    }

    updateExpression(`${expression}π`);
  };

  // Appends Euler's number (e), inserting implicit multiplication if after a number, bracket, percent, or constant
  const addEuler = () => {
    if (justCalculated) {
      updateExpression("e");
      return;
    }

    if (!expression) {
      updateExpression("e");
      return;
    }

    const last = expression.at(-1);

    if (/\d|\)|%|π|e$/.test(last)) {
      updateExpression(`${expression}*e`);
      return;
    }

    updateExpression(`${expression}e`);
  };

  // Applies scientific functions (sin, cos, tan, ln, log, sqrt, reciprocal, square, factorial)
  const applyScientificFunction = (action) => {
    switch (action) {
      case "sin":
      case "cos":
      case "tan":
      case "ln":
      case "log":
      case "sqrt": {
        // If empty or ends with operator/bracket, start the function call
        if (!expression || /[+\-*/^(]$/.test(expression)) {
          updateExpression(`${expression}${action}(`);
          return;
        }

        // If an expression already exists, wrap it in the function call
        updateExpression(`${action}(${expression})`);
        break;
      }

      case "reciprocal": {
        // If empty or ends with operator/bracket, start reciprocal division 1/(
        if (!expression || /[+\-*/^(]$/.test(expression)) {
          updateExpression(`${expression}1/(`);
          return;
        }

        // Wrap current expression in parentheses to calculate reciprocal 1/(expression)
        updateExpression(`1/(${expression})`);
        break;
      }

      case "square": {
        if (!expression || /[+\-*/^(]$/.test(expression)) {
          return;
        }
        updateExpression(`(${expression})^2`);
        break;
      }

      case "factorial": {
        if (!expression || /[+\-*/^(]$/.test(expression)) {
          return;
        }
        updateExpression(`(${expression})!`);
        break;
      }

      default:
        break;
    }
  };

  // Toggles positive/negative sign of the current expression
  const toggleSign = () => {
    if (!expression) {
      updateExpression("-");
      return;
    }

    if (expression === "-") {
      updateExpression("");
      return;
    }

    if (expression.startsWith("-(") && expression.endsWith(")")) {
      updateExpression(expression.slice(2, -1));
      return;
    }

    if (/^-?\d*\.?\d+$/.test(expression)) {
      updateExpression(
        expression.startsWith("-")
          ? expression.slice(1)
          : `-${expression}`
      );
      return;
    }

    updateExpression(`-(${expression})`);
  };

  // Deletes the last character or trailing function token
  const backspace = () => {
    if (justCalculated) {
      clear();
      return;
    }

    // Cleanly delete function tokens in one step
    if (expression.endsWith("sqrt(")) {
      updateExpression(expression.slice(0, -5));
      return;
    }
    if (expression.endsWith("sin(") || expression.endsWith("cos(") || expression.endsWith("tan(")) {
      updateExpression(expression.slice(0, -4));
      return;
    }
    if (expression.endsWith("log(")) {
      updateExpression(expression.slice(0, -4));
      return;
    }
    if (expression.endsWith("1/(")) {
      updateExpression(expression.slice(0, -3));
      return;
    }
    if (expression.endsWith("ln(")) {
      updateExpression(expression.slice(0, -3));
      return;
    }

    updateExpression(expression.slice(0, -1));
  };

  // Evaluates the current mathematical expression
  const calculate = () => {
    if (!expression) {
      return;
    }

    try {
      let evalExpr = expression;

      // Auto-close any unclosed opening brackets before calculating
      const openCount = (evalExpr.match(/\(/g) || []).length;
      const closeCount = (evalExpr.match(/\)/g) || []).length;
      if (openCount > closeCount) {
        evalExpr += ")".repeat(openCount - closeCount);
      }

      const result = evaluateExpression(evalExpr, angleMode);

      setHistory(`${formatExpression(evalExpr)} =`);
      setDisplay(formatResult(result));
      setExpression(String(result));
      setJustCalculated(true);
    } catch {
      setHistory(`${formatExpression(expression)} =`);
      setDisplay("Error");
      setExpression("");
      setJustCalculated(true);
    }
  };

  // Dispatches actions based on the clicked calculator button
  const handlePress = (action) => {
    if (/^\d$/.test(action)) {
      addNumber(action);
      return;
    }

    switch (action) {
      case ".":
        addDecimal();
        break;

      case "+":
      case "-":
      case "*":
      case "/":
        addOperator(action);
        break;

      case "(":
      case ")":
        addBracket(action);
        break;

      case "clear":
        clear();
        break;

      case "backspace":
        backspace();
        break;

      case "equals":
        calculate();
        break;

      case "plusMinus":
        toggleSign();
        break;

      case "%":
      case "percent":
        addPercent();
        break;

      case "deg":
        setAngleMode("DEG");
        break;

      case "rad":
        setAngleMode("RAD");
        break;

      case "pi":
        addPi();
        break;

      case "e":
        addEuler();
        break;

      case "pow":
        addOperator("^");
        break;

      case "sin":
      case "cos":
      case "tan":
      case "ln":
      case "log":
      case "sqrt":
      case "reciprocal":
      case "square":
      case "factorial":
        applyScientificFunction(action);
        break;

      default:
        break;
    }
  };

  // Keep a stable ref to handlePress for keyboard listener
  const handlePressRef = useRef(handlePress);

  useEffect(() => {
    handlePressRef.current = handlePress;
  });

  // Listens for physical keyboard events
  useEffect(() => {
    const handleKeyboard = (event) => {
      const { key } = event;
      const press = handlePressRef.current;

      if (/^\d$/.test(key)) {
        press(key);
      } else if (["+", "-", "*", "/"].includes(key)) {
        press(key);
      } else if (key === "x" || key === "X") {
        press("*");
      } else if (key === ".") {
        press(".");
      } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        press("equals");
      } else if (key === "Backspace") {
        press("backspace");
      } else if (key === "Escape") {
        press("clear");
      } else if (key === "%") {
        press("percent");
      } else if (key === "p" || key === "P") {
        press("pi");
      } else if (key === "e" || key === "E") {
        press("e");
      } else if (key === "l" || key === "L") {
        press("ln");
      } else if (key === "(" || key === ")") {
        press(key);
      } else if (key === "^") {
        press("pow");
      } else if (key === "!") {
        press("factorial");
      }
    };

    window.addEventListener("keydown", handleKeyboard);

    return () => {
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, []);

  return (
    <main className="app">
      <div className="calculator">
        <h1>Calculator</h1>

        <Display
          value={display}
          history={history}
          angleMode={scientificMode ? angleMode : null}
        />

        {scientificMode && (
          <ScientificButtons onPress={handlePress} angleMode={angleMode} />
        )}

        <BasicButtons
          scientificMode={scientificMode}
          onModeToggle={() => setScientificMode((value) => !value)}
          onPress={handlePress}
        />
      </div>
    </main>
  );
}

export default Calculator;