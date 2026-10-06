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
  const tokens = [];
  let index = 0;

  while (index < expression.length) {
    const char = expression[index];

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (/\d|\./.test(char)) {
      let number = "";

      while (
        index < expression.length &&
        /[\d.]/.test(expression[index])
      ) {
        number += expression[index];
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
      let name = "";

      while (
        index < expression.length &&
        /[a-zA-Z]/.test(expression[index])
      ) {
        name += expression[index];
        index += 1;
      }

      tokens.push({
        type: "function",
        value,
      });

      continue;
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

  // Handles addition and subtraction (+, -)
  const parseExpression = () => {
    let result = parseTerm();

    while (
      peek()?.value === "+" ||
      peek()?.value === "-"
    ) {
      const operator = consume().value;
      const right = parseTerm();

      result =
        operator === "+"
          ? result + right
          : result - right;
    }

    return result;
  };

  // Handles multiplication and division (*, /)
  const parseTerm = () => {
    let result = parsePower();

    while (
      peek()?.value === "*" ||
      peek()?.value === "/"
    ) {
      const operator = consume().value;
      const right = parsePower();

      if (operator === "/" && right === 0) {
        throw new Error("Division by zero");
      }

      result =
        operator === "*"
          ? result * right
          : result / right;
    }

    return result;
  };

  // Handles power operator (^)
  const parsePower = () => {
    let result = parseUnary();

    if (peek()?.value === "^") {
      consume();

      const exponent = parsePower();
      result = Math.pow(result, exponent);
    }

    return result;
  };

  // Handles unary signs (+, -)
  const parseUnary = () => {
    if (peek()?.value === "+") {
      consume();
      return parseUnary();
    }

    if (peek()?.value === "-") {
      consume();
      return -parseUnary();
    }

    return parsePostfix();
  };

  // Handles postfix operators (! for factorial, % for percentage)
  const parsePostfix = () => {
    let result = parsePrimary();

    while (
      peek()?.value === "!" ||
      peek()?.value === "%"
    ) {
      const operator = consume().value;

      if (operator === "!") {
        result = factorial(result);
      } else {
        result /= 100;
      }
    }

    return result;
  };

  // Handles primary values: numbers, parentheses, and functions
  const parsePrimary = () => {
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

      const args = [parseExpression()];

      while (peek()?.value === ",") {
        consume();
        args.push(parseExpression());
      }

      if (peek()?.value !== ")") {
        throw new Error("Missing bracket");
      }

      consume();

      return FUNCTIONS[functionName](...args);
    }

    throw new Error("Invalid expression");
  };

  const result = parseExpression();

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