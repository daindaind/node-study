const { odd, even } = require("./2-2");

function checkOddEven(number) {
  if (number % 2) {
    return odd;
  } else {
    return even;
  }
}

module.exports = checkOddEven;
