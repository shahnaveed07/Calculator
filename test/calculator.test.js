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

// Test percentages (conventional context-aware behavior)
assert.equal(evaluateExpression("50%"), 0.5, "50% failed");
assert.equal(evaluateExpression("8% × 3"), 0.24, "8% × 3 failed");
assert.equal(evaluateExpression("8%×3"), 0.24, "8%×3 failed");
assert.equal(evaluateExpression("50% × 200"), 100, "50% × 200 failed");
assert.equal(evaluateExpression("50% * 200"), 100, "50% * 200 failed");
assert.equal(evaluateExpression("200 × 10%"), 20, "200 × 10% failed");
assert.equal(evaluateExpression("200 * 10%"), 20, "200 * 10% failed");
assert.equal(evaluateExpression("457 ÷ 500 × 100"), 91.4, "457 ÷ 500 × 100 failed");
assert.equal(evaluateExpression("457 / 500 * 100"), 91.4, "457 / 500 * 100 failed");
assert.equal(evaluateExpression("457%500"), 2285, "457%500 failed");
assert.equal(evaluateExpression("200 ÷ 10%"), 2000, "200 ÷ 10% failed");
assert.equal(evaluateExpression("200 / 10%"), 2000, "200 / 10% failed");
assert.equal(evaluateExpression("100 + 10%"), 110, "100 + 10% failed");
assert.equal(evaluateExpression("100 − 10%"), 90, "100 − 10% failed");
assert.equal(evaluateExpression("100 - 10%"), 90, "100 - 10% failed");
assert.equal(evaluateExpression("100 + 10% × 2"), 120, "100 + 10% × 2 failed");
assert.equal(evaluateExpression("100 + 10% * 2"), 120, "100 + 10% * 2 failed");
assert.equal(evaluateExpression("(50%) × 200"), 100, "(50%) × 200 failed");
assert.equal(evaluateExpression("(50%) * 200"), 100, "(50%) * 200 failed");
assert.equal(evaluateExpression("25.5%"), 0.255, "25.5% failed");
assert.equal(evaluateExpression("200 * 10% + 5"), 25, "200 * 10% + 5 failed");
assert.equal(evaluateExpression("50%8%"), 0.04, "50%8% failed");
assert.equal(evaluateExpression("50% 8%"), 0.04, "50% 8% failed");
assert.equal(evaluateExpression("100+7.5%"), 107.5, "Decimal percent addition failed");
assert.equal(evaluateExpression("100-12.5%"), 87.5, "Decimal percent subtraction failed");
assert.equal(evaluateExpression("(100+10%)*2"), 220, "Bracketed percentage failed");

// Test invalid percentage sequences & regression cases
assert.throws(() => evaluateExpression("%"), /Invalid expression/);
assert.throws(() => evaluateExpression("%5"), /Invalid expression/);
assert.throws(() => evaluateExpression("8%%"), /Invalid percentage sequence/);
assert.throws(() => evaluateExpression("8% ×"), /Unexpected end/);
assert.throws(() => evaluateExpression("8% *"), /Unexpected end/);
assert.throws(() => evaluateExpression("%%"), /Invalid expression/);
assert.throws(() => evaluateExpression("50%%"), /Invalid percentage sequence/);
assert.throws(() => evaluateExpression("%*%"), /Invalid expression/);
assert.throws(() => evaluateExpression("%+5"), /Invalid expression/);

// Test reciprocal (1/x)
assert.equal(evaluateExpression("1/(4)"), 0.25, "1/(4) failed");
assert.equal(evaluateExpression("1/(2)"), 0.5, "1/(2) failed");
assert.equal(evaluateExpression("1/(-4)"), -0.25, "1/(-4) failed");
assert.equal(evaluateExpression("1/(2+3)"), 0.2, "1/(2+3) failed");
assert.equal(evaluateExpression("1÷(4)"), 0.25, "1÷(4) failed");
assert.equal(evaluateExpression("1÷(2+3)"), 0.2, "1÷(2+3) failed");
assert.throws(() => evaluateExpression("1/(0)"), /Division by zero/);

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

// Test trigonometric functions (DEG mode default)
assert.equal(evaluateExpression("sin(30)", "DEG"), 0.5, "sin(30) DEG failed");
assert.equal(evaluateExpression("cos(60)", "DEG"), 0.5, "cos(60) DEG failed");
assert.equal(evaluateExpression("tan(45)", "DEG"), 1, "tan(45) DEG failed");
assert.equal(evaluateExpression("sin(180)", "DEG"), 0, "sin(180) DEG failed");
assert.equal(evaluateExpression("cos(90)", "DEG"), 0, "cos(90) DEG failed");
assert.equal(evaluateExpression("sin(0)", "DEG"), 0, "sin(0) DEG failed");
assert.equal(evaluateExpression("cos(0)", "DEG"), 1, "cos(0) DEG failed");
assert.equal(evaluateExpression("sin(90)", "DEG"), 1, "sin(90) DEG failed");
assert.equal(evaluateExpression("cos(180)", "DEG"), -1, "cos(180) DEG failed");
assert.equal(formatResult(evaluateExpression("sin(180)", "DEG")), "0", "formatResult sin(180) failed");
assert.equal(formatResult(evaluateExpression("cos(90)", "DEG")), "0", "formatResult cos(90) failed");
assert.throws(() => evaluateExpression("tan(90)", "DEG"), /Undefined tan/);
assert.throws(() => evaluateExpression("tan(270)", "DEG"), /Undefined tan/);
assert.throws(() => evaluateExpression("tan(-90)", "DEG"), /Undefined tan/);

// Test trigonometric functions (RAD mode)
assert.equal(evaluateExpression("sin(0)", "RAD"), 0, "sin(0) RAD failed");
assert.equal(evaluateExpression("cos(0)", "RAD"), 1, "cos(0) RAD failed");
assert.equal(evaluateExpression("tan(0)", "RAD"), 0, "tan(0) RAD failed");
assert.equal(evaluateExpression("sin(π/6)", "RAD"), 0.5, "sin(π/6) RAD failed");
assert.equal(evaluateExpression("cos(π/3)", "RAD"), 0.5, "cos(π/3) RAD failed");
assert.equal(evaluateExpression("tan(π/4)", "RAD"), 1, "tan(π/4) RAD failed");
assert.equal(evaluateExpression("sin(π)", "RAD"), 0, "sin(π) RAD failed");
assert.equal(evaluateExpression("cos(π/2)", "RAD"), 0, "cos(π/2) RAD failed");
assert.throws(() => evaluateExpression("tan(π/2)", "RAD"), /Undefined tan/);

// Test algebraic precedence with powers and unary operators
assert.equal(evaluateExpression("-5^2"), -25, "-5^2 failed");
assert.equal(evaluateExpression("-(5)^2"), -25, "-(5)^2 failed");
assert.equal(evaluateExpression("(-5)^2"), 25, "(-5)^2 failed");
assert.equal(evaluateExpression("2^-3"), 0.125, "2^-3 failed");

// Test Euler constant (e) and logarithm (log)
assert.equal(evaluateExpression("e"), Math.E, "e constant failed");
assert.equal(evaluateExpression("2e"), 2 * Math.E, "2e failed");
assert.equal(evaluateExpression("e2"), 2 * Math.E, "e2 failed");
assert.equal(evaluateExpression("e+2"), Math.E + 2, "e+2 failed");
assert.equal(evaluateExpression("ln(e)"), 1, "ln(e) failed");
assert.equal(evaluateExpression("log(10)"), 1, "log(10) failed");
assert.equal(evaluateExpression("log(100)"), 2, "log(100) failed");
assert.equal(evaluateExpression("log(1000)"), 3, "log(1000) failed");
assert.equal(evaluateExpression("log(1)"), 0, "log(1) failed");
assert.throws(() => evaluateExpression("log(0)"), /Invalid log/);
assert.throws(() => evaluateExpression("log(-10)"), /Invalid log/);

// Test numbers in scientific exponential notation
assert.equal(evaluateExpression("1e-7 * 2"), 2e-7, "1e-7 * 2 failed");
assert.equal(evaluateExpression("1e5 + 5"), 100005, "1e5 + 5 failed");
assert.equal(evaluateExpression("2.5e2 - 50"), 200, "2.5e2 - 50 failed");

// Test Pi (π) constant
assert.equal(evaluateExpression("π"), Math.PI, "π constant failed");
assert.equal(evaluateExpression("2π"), 2 * Math.PI, "2π implicit multiplication failed");
assert.equal(evaluateExpression("π2"), 2 * Math.PI, "π2 implicit multiplication failed");
assert.equal(evaluateExpression("π3"), 3 * Math.PI, "π3 implicit multiplication failed");
assert.equal(evaluateExpression("2*π"), 2 * Math.PI, "2*π failed");
assert.equal(evaluateExpression("π*2"), 2 * Math.PI, "π*2 failed");
assert.equal(evaluateExpression("π+5"), Math.PI + 5, "π+5 failed");
assert.equal(evaluateExpression("sin(π)", "RAD"), 0, "sin(π) in RAD failed");

// Additional angle tests
assert.equal(evaluateExpression("sin(360)", "DEG"), 0, "sin(360) failed");
assert.equal(evaluateExpression("cos(270)", "DEG"), 0, "cos(270) failed");
assert.equal(evaluateExpression("tan(180)", "DEG"), 0, "tan(180) failed");
assert.equal(evaluateExpression("tan(135)", "DEG"), -1, "tan(135) failed");
assert.equal(evaluateExpression("tan(225)", "DEG"), 1, "tan(225) failed");

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
assert.equal(formatExpression("50%"), "50%");
assert.equal(formatExpression("8%*3"), "8%×3");
assert.equal(formatExpression("50%*200"), "50%×200");
assert.equal(formatExpression("200/10%"), "200÷10%");
assert.equal(formatExpression("100+10%"), "100+10%");
assert.equal(formatExpression("100-10%"), "100-10%");
assert.equal(formatExpression("457%500"), "457%500");
assert.equal(formatExpression("457% 500"), "457% 500");

console.log("All calculator unit tests passed successfully!");
