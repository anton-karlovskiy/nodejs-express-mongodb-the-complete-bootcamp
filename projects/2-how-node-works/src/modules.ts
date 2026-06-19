// module.exports
import Calculator from './calculator';

const calculator = new Calculator();
console.log(calculator.add(2, 5));

// exports
import { multiply } from './math-utils';

console.log(multiply(2, 5));

// caching
import logText from './cached-module';

logText();
logText();
logText();
