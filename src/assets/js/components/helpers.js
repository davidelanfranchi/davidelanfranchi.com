export const isTouch = (() =>
  "ontouchstart" in window ||
  navigator.MaxTouchPoints > 0 ||
  navigator.msMaxTouchPoints > 0)();

export const isSafari = (() =>
  navigator.userAgent.indexOf("Safari") != -1 &&
  navigator.userAgent.indexOf("Chrome") == -1)();
