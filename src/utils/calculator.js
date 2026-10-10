// Mathematical functions supported by the calculator
const FUNCTIONS = {
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

  // Checks if the previous token was a percent or closing bracket that requires implicit multiplication
  const shouldInsertImplicitMultiply = () => {
    const last = tokens.at(-1);
    return last && (last.value === "%" || last.value === ")");
  };

  while (index < normalized.length) {
    const char = normalized[index];

    if (/\s/.test(char)) {
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
      if (shouldInsertImplicitMultiply()) {
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

    if (char === "(" && shouldInsertImplicitMultiply()) {
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
export function evaluateExpression(expression) {
  const tokens = tokenize(expression);
  let position = 0;

  const peek = () => tokens[position];

  const consume = () => tokens[position++];

  // Handles addition and subtraction (+, -) with context-aware percentage
  const parseExpression = () => {
    let left = parseTerm();

    while (
      peek()?.value === "+" ||
      peek()?.value === "-"
    ) {
      const operator = consume().value;
      const right = parseTerm();

      // In addition/subtraction, percentage is relative to previous accumulator (e.g. 100 + 10% = 110)
      let rightValue = right.value;
      if (right.isPercent) {
        rightValue = left.value * right.value;
      }

      left = {
        value:
          operator === "+"
            ? left.value + rightValue
            : left.value - rightValue,
        isPercent: false,
      };
    }

    return left;
  };

  // Handles multiplication and division (*, /)
  const parseTerm = () => {
    let left = parsePower();

    while (
      peek()?.value === "*" ||
      peek()?.value === "/"
    ) {
      const operator = consume().value;
      const right = parsePower();

      if (operator === "/" && right.value === 0) {
        throw new Error("Division by zero");
      }

      left = {
        value:
          operator === "*"
            ? left.value * right.value
            : left.value / right.value,
        isPercent: false,
      };
    }

    return left;
  };

  // Handles power operator (^)
  const parsePower = () => {
    let left = parseUnary();

    if (peek()?.value === "^") {
      consume();

      const exponent = parsePower();
      left = { value: Math.pow(left.value, exponent.value), isPercent: false };
    }

    return left;
  };

  // Handles unary signs (+, -)
  const parseUnary = () => {
    if (peek()?.value === "+") {
      consume();
      const next = parseUnary();
      return { value: next.value, isPercent: next.isPercent };
    }

    if (peek()?.value === "-") {
      consume();
      const next = parseUnary();
      return { value: -next.value, isPercent: next.isPercent };
    }

    return parsePostfix();
  };

  // Handles postfix operators (! for factorial, % for percentage)
  const parsePostfix = () => {
    let item = parsePrimary();
    let percentCount = 0;

    while (
      peek()?.value === "!" ||
      peek()?.value === "%"
    ) {
      const operator = consume().value;

      if (operator === "!") {
        item = { value: factorial(item.value), isPercent: false };
        percentCount = 0;
      } else {
        percentCount += 1;
        if (percentCount > 1) {
          throw new Error("Invalid percentage sequence");
        }
        item = { value: item.value / 100, isPercent: true };
      }
    }

    return item;
  };

  // Handles primary values: numbers, parentheses, and functions
  const parsePrimary = () => {
    const token = peek();

    if (!token) {
      throw new Error("Unexpected end");
    }

    if (token.type === "number") {
      consume();
      return { value: token.value, isPercent: false };
    }

    if (token.value === "(") {
      consume();

      const result = parseExpression();

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

      const args = [parseExpression().value];

      while (peek()?.value === ",") {
        consume();
        args.push(parseExpression().value);
      }

      if (peek()?.value !== ")") {
        throw new Error("Missing bracket");
      }

      consume();

      return { value: FUNCTIONS[functionName](...args), isPercent: false };
    }

    throw new Error("Invalid expression");
  };

  const result = parseExpression();

  if (position !== tokens.length) {
    throw new Error("Invalid expression");
  }

  if (!Number.isFinite(result.value)) {
    throw new Error("Invalid result");
  }

  return result.value;
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