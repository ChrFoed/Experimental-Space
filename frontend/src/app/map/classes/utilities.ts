class Utilities {

  constructor() {}

  clampNumber = (num, a, b) => {
    return Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));
  }

  randBetween = (min, max) => {
    return Math.floor(Math.random() * max) + min;
  }


}
export default Utilities;
