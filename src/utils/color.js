import color from "color";

// Convert a hex value into RGB
function rgb(hex) {
  return color(hex).rgbArray().join(",");
}

// Return an rgba string value for CSS
function rgba(hex, opacity) {
  return color(hex).alpha(opacity).rgbString();
}

// Sass's darken function
function darken(hex, amount) {
  return color(hex).darken((amount / 100)).hexString();
}

// Sass's lighten function
function lighten(hex, amount) {
  return color(hex).lighten((amount / 100)).hexString();
}

export {
  rgb,
  rgba,
  darken,
  lighten,
};
