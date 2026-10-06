import { useEffect, useState } from "react";
import Display from "./Display";
import BasicButtons from "./BasicButtons";
import ScientificButtons from "./ScientificButtons";
import {
  evaluateExpression,
  formatExpression,
  formatResult,
} from "../utils/calculator";

function Calculator() {
  const [expression, setExpression] = useState("");
  const [display, setDisplay] = useState("0");
  const [scientificMode, setScientificMode] = useState(false);
  const [justCalculated, setJustCalculated] = useState(false);

  const updateExpression = (value) => {
    setExpression(value);
    setDisplay(value ? formatExpression(value) : "0");
    setJustCalculated(false);
  };

  const clear = () => {
    setExpression("");
    setDisplay("0");
    setJustCalculated(false);
  };

  const addNumber = (number) => {
    if (justCalculated) {
      updateExpression(number);
      return;
    }

    const last = expression.at(-1);

    if (/[)!%]/.test(last) || expression.endsWith("pi") || expression.endsWith("e")) {
      updateExpression(`${expression}*${number}`);
      return;
    }

    updateExpression(expression + number);
  };

  const addDecimal = () => {
    if (justCalculated) {
      updateExpression("0.");
      return;
    }

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

  const addOperator = (operator) => {
    if (!expression) {
      if (operator === "-") {
        updateExpression("-");
      }
      return;
    }

    let value = expression;

    if (/[+\-*/^]$/.test(value)) {
      value = value.slice(0, -1) + operator;
    } else {
      value += operator;
    }

    updateExpression(value);
  };

  const addBracket = (bracket) => {
    if (bracket === "(") {
      if (justCalculated) {
        updateExpression("(");
        return;
      }

      const last = expression.at(-1);

      if (/\d|\)|%$/.test(last) || expression.endsWith("pi") || expression.endsWith("e")) {
        updateExpression(`${expression}*(`);
      } else {
        updateExpression(`${expression}(`);
      }

      return;
    }

    const open = (expression.match(/\(/g) || []).length;
    const close = (expression.match(/\)/g) || []).length;
    const last = expression.at(-1);

    if (open <= close || /[+\-*/^(]$/.test(last)) {
      return;
    }

    updateExpression(`${expression})`);
  };

  const addFunction = (functionName) => {
    if (justCalculated || !expression) {
      updateExpression(`${functionName}(`);
      return;
    }

    updateExpression(`${functionName}(${expression})`);
  };

  const applyFunction = (action) => {
    if (!expression) {
      return;
    }

    switch (action) {
      case "square":
        updateExpression(`(${expression})^2`);
        break;

      case "factorial":
        updateExpression(`(${expression})!`);
        break;

      case "sqrt":
        updateExpression(`sqrt(${expression})`);
        break;

      case "root":
        updateExpression(`root(${expression})`);
        break;

      case "ln":
        updateExpression(`ln(${expression})`);
        break;

      default:
        break;
    }
  };

  const toggleSign = () => {
    if (!expression) {
      updateExpression("-");
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

  const backspace = () => {
    if (justCalculated) {
      clear();
      return;
    }

    updateExpression(expression.slice(0, -1));
  };

  const calculate = () => {
    if (!expression || /[+\-*/^(]$/.test(expression)) {
      return;
    }

    try {
      const result = evaluateExpression(expression);

      setDisplay(formatResult(result));
      setExpression(String(result));
      setJustCalculated(true);
    } catch {
      setDisplay("Error");
      setExpression("");
      setJustCalculated(true);
    }
  };

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

      case "percent":
        applyFunction("percent");
        break;

      case "ln":
      case "sqrt":
      case "root":
      case "square":
      case "factorial":
        applyFunction(action);
        break;

      case "pow":
        addOperator("^");
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    const handleKeyboard = (event) => {
      const { key } = event;

      if (/^\d$/.test(key)) {
        handlePress(key);
      } else if (["+", "-", "*", "/"].includes(key)) {
        handlePress(key);
      } else if (key === ".") {
        handlePress(".");
      } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        handlePress("equals");
      } else if (key === "Backspace") {
        handlePress("backspace");
      } else if (key === "Escape") {
        handlePress("clear");
      } else if (key === "%") {
        handlePress("percent");
      } else if (key === "(" || key === ")") {
        handlePress(key);
      }
    };

    window.addEventListener("keydown", handleKeyboard);

    return () => {
      window.removeEventListener("keydown", handleKeyboard);
    };
  });

  return (
    <main className="app">
      <div className="calculator">
        <h1>Calculator</h1>

        <Display value={display} />

        {scientificMode && (
          <ScientificButtons onPress={handlePress} />
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