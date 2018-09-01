import Tagline from "./components/tagline";
import Cursor from "./components/cursor";
import { isTouch } from "./components/helpers";
import { isSafari } from "./components/helpers";

document.body.classList.add("is-loading");

if (isTouch) {
  document.body.classList.add("touch");
} else {
  document.body.classList.add("no-touch");
}

if (isSafari) {
  document.body.classList.add("safari");
} else {
  document.body.classList.add("no-safari");
}

const tagline = new Tagline();
tagline.init();

const cursor = new Cursor({
  innerMarkup: `<div class="cursor__outer">
                  <div class="cursor__inner">
                  <div class="cursor__point"></div>
                  <div class="cursor__external-link">
                    <svg viewBox="0 0 380 380">
                      <polygon points="376.6,2.4 376.6,1.8 76.7,1.9 76.7,61.8 275.8,61.8 1.7,335.8 44.1,378.2 318.1,104.2 318.1,302.9 378.2,302.8 378.3,2.4 "></polygon>
                    </svg>
                  </div>
                  </div>
                </div>`
});
cursor.init();

window.addEventListener("load", () => {
  document.body.classList.remove("is-loading");
  document.body.classList.add("is-loaded");
});
