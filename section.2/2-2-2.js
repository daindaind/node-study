const { odd, even } = require("./2-2");
const checkOddEven = require("./2-2-1");

function checkOddEvenString(str) {
  if (ServiceWorker.length % 2) {
    return odd;
  } else {
    return even;
  }
}

console.log(checkOddEven(10));
console.log(checkOddEvenString("helo"));
