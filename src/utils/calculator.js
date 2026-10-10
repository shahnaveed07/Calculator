// Helper to clean trigonometric precision artifacts (e.g. 1.22e-16 -> 0, 0.49999999999999994 -> 0.5)
function cleanTrigValue(val) {
  if (Math.abs(val) < 1e-15) {
    return 0;
  }
  return Math.round(val * 1e14) / 1e14;
}

// Evaluates trigonometric functions in DEG or RAD angle mode
function calculateTrig(fn, value, angleMode = "DEG") {
  if (angleMode === "DEG") {
    if (fn === "tan") {
      const normalized = ((value % 180) + 180) % 180;
      if (Math.abs(normalized - 90) < 1e-11) {
        throw new Error("Undefined tan");
      }
    }
    const rad = (value * Math.PI) / 180;
    return cleanTrigValue(Math[fn](rad));
  }

  // RAD mode
  if (fn === "tan") {
    const multiple = value / (Math.PI / 2);
    const nearest = Math.round(multiple);
    if (Math.abs(multiple - nearest) < 1e-11 && Math.abs(nearest % 2) === 1) {
      throw new Error("Undefined tan");
    }
  }
  return cleanTrigValue(Math[fn](value));
}

// Mathematical functions supported by the calculator
const FUNCTIONS = {
  // Trigonometric functions
  sin: (value, angleMode = "DEG") => calculateTrig("sin", value, angleMode),
  cos: (value, angleMode = "DEG") => calculateTrig("cos", value, angleMode),
  tan: (value, angleMode = "DEG") => calculateTrig("tan", value, angleMode),

  // Natural logarithm (ln) with base e
  ln: (value) => {
    if (value <= 0) {
      throw new Error("Invalid ln");
    }

    return Math.log(value);
  },

  // Square root (√)
  sqrt: (value) => {
    if (value < 0) {
      throw new Error("Invalid square root");
    }

    return Math.sqrt(value);
  },

  // Cube root by default, or nth-root if degree n is provided
  root: (value, n = 3) => {
    if (n === 0) {
      throw new Error("Invalid root degree");
    }

    if (n === 3) {
      return Math.cbrt(value);
    }

    if (n === 2) {
      if (value < 0) {
        throw new Error("Invalid square root");
      }
      return Math.sqrt(value);
    }

    if (value < 0 && n % 2 === 0) {
      throw new Error("Invalid root");
    }

    if (value < 0) {
      return -Math.pow(-value, 1 / n);
    }

    return Math.pow(value, 1 / n);
  },
};

// Calculates factorial for non-negative integers up to 170
function factorial(value) {
  if (!Number.isInteger(value) || value < 0 || value > 170) {
    throw new Error("Invalid factorial");
  }

  let result = 1;

  for (let i = 2; i <= value; i += 1) {
    result *= i;
  }

  return result;
}

// Converts raw expression string into tokens (numbers, functions, operators)
function tokenize(expression) {
  // Normalize display symbols (×, ÷, −, √) for parser compatibility
  const normalized = expression
    .replaceAll("×", "*")
    .replaceAll("÷", "/")
    .replaceAll("−", "-")
    .replaceAll("√", "sqrt");

  const tokens = [];
  let index = 0;

  // Checks if the previous token was a percent, closing bracket, or pi that requires implicit multiplication
  const shouldInsertImplicitMultiply = () => {
    const last = tokens.at(-1);
    return last && (last.value === "%" || last.value === ")" || last.value === "π");
  };

  while (index < normalized.length) {
    const char = normalized[index];

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (char === "π") {
      if (shouldInsertImplicitMultiply() || tokens.at(-1)?.type === "number") {
        tokens.push({
          type: "operator",
          value: "*",
        });
      }

      tokens.push({
        type: "number",
        value: Math.PI,
      });

      index += 1;
      continue;
    }

    if (/\d|\./.test(char)) {
      if (shouldInsertImplicitMultiply()) {
        tokens.push({
          type: "operator",
          value: "*",
        });
      }

      let number = "";

      while (
        index < normalized.length &&
        /[\d.]/.test(normalized[index])
      ) {
        number += normalized[index];
        index += 1;
      }

      const value = Number(number);

      if (!Number.isFinite(value)) {
        throw new Error("Invalid number");
      }

      tokens.push({
        type: "number",
        value,
      });

      continue;
    }

    if (/[a-zA-Z]/.test(char)) {
      if (shouldInsertImplicitMultiply() || tokens.at(-1)?.type === "number") {
        tokens.push({
          type: "operator",
          value: "*",
        });
      }

      let name = "";

      while (
        index < normalized.length &&
        /[a-zA-Z]/.test(normalized[index])
      ) {
        name += normalized[index];
        index += 1;
      }

      tokens.push({
        type: "function",
        value: name,
      });

      continue;
    }

    if (char === "(" && (shouldInsertImplicitMultiply() || tokens.at(-1)?.type === "number")) {
      tokens.push({
        type: "operator",
        value: "*",
      });
    }

    if ("+-*/^!%(),".includes(char)) {
      tokens.push({
        type: "operator",
        value: char,
      });

      index += 1;
      continue;
    }

    throw new Error("Invalid character");
  }

  return tokens;
}

// Evaluates a mathematical string expression and returns the numeric result
export function evaluateExpression(expression, angleMode = "DEG") {
  const tokens = tokenize(expression);
  let position = 0;

  const peek = () => tokens[position];

  const consume = () => tokens[position++];

  // Handles addition and subtraction (+, -) with context-aware percentage
  const parseExpression = (baseValue = undefined) => {
    let left = parseTerm(baseValue);

    while (
      peek()?.value === "+" ||
      peek()?.value === "-"
    ) {
      const operator = consume().value;
      // In addition/subtraction, the percentage in the right term is calculated relative to the left-hand accumulator
      const right = parseTerm(left);

      left =
        operator === "+"
          ? left + right
          : left - right;
    }

    return left;
  };

  // Handles multiplication and division (*, /)
  const parseTerm = (baseValue = undefined) => {
    let left = parsePower(baseValue);

    while (
      peek()?.value === "*" ||
      peek()?.value === "/"
    ) {
      const operator = consume().value;
      // In multiplication/division, the percentage is a fractional value
      const right = parsePower(undefined);

      if (operator === "/" && right === 0) {
        throw new Error("Division by zero");
      }

      left =
        operator === "*"
          ? left * right
          : left / right;
    }

    return left;
  };

  // Handles power operator (^)
  const parsePower = (baseValue = undefined) => {
    let left = parseUnary(baseValue);

    if (peek()?.value === "^") {
      consume();

      // Exponent is evaluated as a pure number without additive context
      const exponent = parsePower(undefined);
      left = Math.pow(left, exponent);
    }

    return left;
  };

  // Handles unary signs (+, -)
  const parseUnary = (baseValue = undefined) => {
    if (peek()?.value === "+") {
      consume();
      return parseUnary(baseValue);
    }

    if (peek()?.value === "-") {
      consume();
      return -parseUnary(baseValue);
    }

    return parsePostfix(baseValue);
  };

  // Handles postfix operators (! for factorial, % for percentage)
  const parsePostfix = (baseValue = undefined) => {
    let item = parsePrimary(baseValue);
    let percentCount = 0;

    while (
      peek()?.value === "!" ||
      peek()?.value === "%"
    ) {
      const operator = consume().value;

      if (operator === "!") {
        item = factorial(item);
        percentCount = 0;
      } else {
        percentCount += 1;
        if (percentCount > 1) {
          throw new Error("Invalid percentage sequence");
        }

        // Conventional calculator percentage: relative to baseValue in addition/subtraction, or fractional value
        if (baseValue !== undefined) {
          item = item * (baseValue / 100);
        } else {
          item = item / 100;
        }
      }
    }

    return item;
  };

  // Handles primary values: numbers, parentheses, and functions
  const parsePrimary = (baseValue = undefined) => {
    const token = peek();

    if (!token) {
      throw new Error("Unexpected end");
    }

    if (token.type === "number") {
      consume();
      return token.value;
    }

    if (token.value === "(") {
      consume();

      const result = parseExpression(baseValue);

      if (peek()?.value !== ")") {
        throw new Error("Missing bracket");
      }

      consume();

      return result;
    }

    if (token.type === "function") {
      const functionName = consume().value;

      if (!FUNCTIONS[functionName]) {
        throw new Error("Unknown function");
      }

      if (peek()?.value !== "(") {
        throw new Error("Missing bracket");
      }

      consume();

      const args = [parseExpression(undefined)];

      while (peek()?.value === ",") {
        consume();
        args.push(parseExpression(undefined));
      }

      if (peek()?.value !== ")") {
        throw new Error("Missing bracket");
      }

      consume();

      if (["sin", "cos", "tan"].includes(functionName)) {
        return FUNCTIONS[functionName](...args, angleMode);
      }

      return FUNCTIONS[functionName](...args);
    }

    throw new Error("Invalid expression");
  };

  const result = parseExpression(undefined);

  if (position !== tokens.length) {
    throw new Error("Invalid expression");
  }

  if (!Number.isFinite(result)) {
    throw new Error("Invalid result");
  }

  return result;
}

// Formats calculated number for the display screen
export function formatResult(value) {
  if (!Number.isFinite(value)) {
    return "Error";
  }

  if (Object.is(value, -0)) {
    return "0";
  }

  // Round to 12 significant digits to avoid floating point precision artifacts
  return String(Number(value.toPrecision(12)));
}

// Formats internal expression operators for user display (e.g., * becomes ×)
export function formatExpression(expression) {
  return expression
    .replaceAll("sqrt", "√")
    .replaceAll("*", "×")
    .replaceAll("/", "÷");
}