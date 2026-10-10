import assert from "node:assert/strict";
import {
  evaluateExpression,
  formatExpression,
  formatResult,
} from "../src/utils/calculator.js";

// Test basic arithmetic
assert.equal(evaluateExpression("2+3"), 5, "Addition failed");
assert.equal(evaluateExpression("10-4"), 6, "Subtraction failed");
assert.equal(evaluateExpression("4*7"), 28, "Multiplication failed");
assert.equal(evaluateExpression("15/3"), 5, "Division failed");
assert.equal(evaluateExpression("2+3*4"), 14, "Operator precedence failed");
assert.equal(evaluateExpression("(2+3)*4"), 20, "Bracket precedence failed");
assert.equal(evaluateExpression("-5+8"), 3, "Unary minus failed");
assert.equal(evaluateExpression("-(2+3)"), -5, "Unary minus with brackets failed");

// Test decimals and precision
assert.equal(formatResult(evaluateExpression("0.1+0.2")), "0.3", "Decimal rounding failed");

// Test percentages (standard handheld context-aware behavior)
assert.equal(evaluateExpression("50%"), 0.5, "50% failed");
assert.equal(evaluateExpression("200*10%"), 20, "200 * 10% failed");
assert.equal(evaluateExpression("200*10%+5"), 25, "200 * 10% + 5 failed");
assert.equal(evaluateExpression("100+10%"), 110, "100 + 10% failed");
assert.equal(evaluateExpression("100-10%"), 90, "100 - 10% failed");
assert.equal(evaluateExpression("200/10%"), 2000, "200 / 10% failed");
assert.equal(evaluateExpression("25%*200"), 50, "25% * 200 failed");
assert.equal(evaluateExpression("100+7.5%"), 107.5, "Decimal percent addition failed");
assert.equal(evaluateExpression("100-12.5%"), 87.5, "Decimal percent subtraction failed");
assert.equal(evaluateExpression("(100+10%)*2"), 220, "Bracketed percentage failed");

// Test scientific functions
assert.equal(evaluateExpression("ln(1)"), 0, "ln(1) failed");
assert.ok(Math.abs(evaluateExpression("ln(2.718281828459045)") - 1) < 1e-12, "ln(e) failed");
assert.equal(evaluateExpression("sqrt(25)"), 5, "sqrt failed");
assert.equal(evaluateExpression("root(27)"), 3, "cube root failed");
assert.equal(evaluateExpression("root(-8)"), -2, "negative cube root failed");
assert.equal(evaluateExpression("root(16,4)"), 2, "nth root failed");
assert.equal(evaluateExpression("2^3"), 8, "pow failed");
assert.equal(evaluateExpression("(5)^2"), 25, "square failed");
assert.equal(evaluateExpression("0!"), 1, "0! failed");
assert.equal(evaluateExpression("5!"), 120, "5! failed");

// Test error handling
assert.throws(() => evaluateExpression("1/0"), /Division by zero/);
assert.throws(() => evaluateExpression("ln(0)"), /Invalid ln/);
assert.throws(() => evaluateExpression("ln(-5)"), /Invalid ln/);
assert.throws(() => evaluateExpression("sqrt(-4)"), /Invalid square root/);
assert.throws(() => evaluateExpression("(-2)!"), /Invalid factorial/);
assert.throws(() => evaluateExpression("2.5!"), /Invalid factorial/);
assert.throws(() => evaluateExpression("171!"), /Invalid factorial/);
assert.throws(() => evaluateExpression("root(-16,4)"), /Invalid root/);

// Test formatters
assert.equal(formatResult(Infinity), "Error");
assert.equal(formatResult(NaN), "Error");
assert.equal(formatResult(-0), "0");
assert.equal(formatExpression("sqrt(4)*2/1"), "√(4)×2÷1");

console.log("All calculator unit tests passed successfully!");
