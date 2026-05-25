function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isPositiveInteger(value) {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue > 0;
}

function isRating(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= 0 && numberValue <= 10;
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : value;
}

module.exports = {
  isNonEmptyString,
  isPositiveInteger,
  isRating,
  normalizeString,
};
