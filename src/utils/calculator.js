const FUNCTIONS = {
  ln: (value) => {
    if (value <= 0) {
      throw new Error("Invalid ln");
    }

    return Math.log(value);
  },

  sqrt: (value) => {
    if (value < 0) {
      throw new Error("Invalid square root");
    }

    return Math.sqrt(value);
  },

  root: (value) => {
    if (value < 0) {
      return -Math.pow(Math.abs(value), 1 / 2);
    }

    return Math.sqrt(value);
  },
};

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
        value: name,
      });

      continue;
    }

    if ("+-*/^!%()".includes(char)) {
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

export function evaluateExpression(expression) {
  const tokens = tokenize(expression);
  let position = 0;

  const peek = () => tokens[position];

  const consume = () => tokens[position++];

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

  const parsePower = () => {
    let result = parseUnary();

    if (peek()?.value === "^") {
      consume();

      const exponent = parsePower();
      result = Math.pow(result, exponent);
    }

    return result;
  };

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

      const value = parseExpression();

      if (peek()?.value !== ")") {
        throw new Error("Missing bracket");
      }

      consume();

      return FUNCTIONS[functionName](value);
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

export function formatResult(value) {
  if (!Number.isFinite(value)) {
    return "Error";
  }

  if (Object.is(value, -0)) {
    return "0";
  }

  return String(Number(value.toPrecision(12)));
}

export function formatExpression(expression) {
  return expression
    .replaceAll("sqrt", "√")
    .replaceAll("*", "×")
    .replaceAll("/", "÷");
}