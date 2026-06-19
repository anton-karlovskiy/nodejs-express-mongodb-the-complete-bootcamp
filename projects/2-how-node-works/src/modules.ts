// module.exports
import C from './test-module-1';

const calc1 = new C();
console.log(calc1.add(2, 5));

// exports
import { multiply } from './test-module-2';

console.log(multiply(2, 5));

// caching
import logText from './test-module-3';

logText();
logText();
logText();
