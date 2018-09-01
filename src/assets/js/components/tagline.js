import Scrollbar from "smooth-scrollbar";
import { TweenLite, CSSPlugin } from "gsap/all";

export default class {
  constructor() {
    this.name = "tagline";
    this.interface = "native";
    this.container = document.body;
    this.scrollDirection = "unchanged";
    this.dom = {};
    this.smoothScrollbar = null;

    this.onResize = this.onResize.bind(this);

    this.isSwapping = false;
  }

  init() {
    this.dom.taglineScroller = document.querySelector(".tagline-scroller");
    this.dom.tagline = document.querySelector(".tagline");
    this.createClones();

    this.setInterface();
    this.getDimensions();

    // this.getDimensionsInterval = setInterval(() => {
    //   this.getDimensions();
    // }, 10);

    // HERE ONLY IF NOT LOOPED
    // get references
    //this.dom.taglineLines = document.querySelectorAll(".tagline__line");

    window.addEventListener("load", () => {
      // console.log("load");
      if (this.smoothScrollbar !== null) {
        this.smoothScrollbar.update();
      }
      this.getDimensions();
    });

    window.addEventListener("resize", this.onResize);
    this.onResize();

    window.requestAnimationFrame(() => {
      this.updateAnimation();
    });

    // set first scroll position
    let yPos = this.taglineHeight;
    if (this.interface === "native") {
      document.documentElement.scrollTop = yPos;
    }
    if (this.interface === "smooth") {
      this.smoothScrollbar.setPosition(0, yPos);
    }
  }

  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
  }

  createClones() {
    this.dom.taglineNextClone = document.createElement("span");
    this.dom.taglineNextClone.innerHTML = this.dom.tagline.innerHTML;
    this.dom.taglineNextClone.classList.add("tagline", "-next-clone");
    this.dom.tagline.parentNode.insertBefore(
      this.dom.taglineNextClone,
      this.dom.tagline.nextSibling
    );

    this.dom.taglinePreviousClone = document.createElement("span");
    this.dom.taglinePreviousClone.innerHTML = this.dom.tagline.innerHTML;
    this.dom.taglinePreviousClone.classList.add("tagline", "-previous-clone");
    this.dom.tagline.parentNode.insertBefore(
      this.dom.taglinePreviousClone,
      this.dom.tagline
    );

    // get references
    this.dom.taglineLines = document.querySelectorAll(".tagline__line");
  }

  swapElements(position) {
    // Prevent page load trigger
    if (!this.isScrolling) {
      // return;
    }
    // Prevent flash
    if (this.isSwapping) {
      // console.log("isSwapping");
      return;
    }
    this.isSwapping = true;
    setTimeout(() => {
      // console.log("end timeout");
      this.isSwapping = false;
    }, 100);

    if (position === "up") {
      // console.log("swap up");
      let yPos = this.taglineHeight * 2;
      if (this.interface === "native") {
        document.documentElement.scrollTop = yPos;
      }
      if (this.interface === "smooth") {
        this.smoothScrollbar.setPosition(0, yPos);
      }
    }
    if (position === "down") {
      let yPos = this.taglineHeight;

      if (this.interface === "native") {
        document.documentElement.scrollTop = yPos;
      }

      if (this.interface === "smooth") {
        this.smoothScrollbar.setPosition(1, yPos);
      }
    }
  }

  setInterface() {
    /*
    if (window.matchMedia("(min-width: 1024px)").matches) {
      this.smoothScrollbar = Scrollbar.init(this.dom.taglineScroller, {
        damping: 0.1
      });

      this.interface = "smooth";
    } else {
      if (this.smoothScrollbar) {
        this.smoothScrollbar.destroy();
        this.smoothScrollbar = null;
      }

      this.interface = "native";
    }
    */
    // TODO: debug and fix on mobile device
    this.smoothScrollbar = Scrollbar.init(this.dom.taglineScroller, {
      damping: 0.1
    });
    this.interface = "smooth";
  }

  onResize() {
    clearTimeout(this.resizeTimeout);
    this.isResizing = true;
    this.resizeTimeout = setTimeout(() => {
      this.getDimensions();
    }, 250);
  }

  getDimensions() {
    // console.log("getDimensions");

    if (this.interface === "native") {
      this.viewportHeight = window.innerHeight;
      this.contentHeight = document.body.offsetHeight;
    }

    if (this.interface === "smooth") {
      this.viewportHeight = this.smoothScrollbar.size.container.height;
      this.contentHeight = this.smoothScrollbar.size.content.height;
    }

    this.taglineHeight = this.dom.tagline.offsetHeight;

    this.scrollDownThreshold = this.taglineHeight * 2;
    this.scrollUpThreshold = this.taglineHeight;
  }

  getPositions() {
    if (this.interface === "native") {
      this.scrollTop =
        window.pageYOffset ||
        (document.documentElement && document.documentElement.scrollTop) ||
        document.body.scrollTop;
    }

    if (this.interface === "smooth") {
      this.scrollTop = this.smoothScrollbar.scrollTop;
    }

    let scrollDifference = this.scrollTop - this.lastScrollTop;

    this.scrollDirection =
      scrollDifference === 0
        ? "unchanged"
        : scrollDifference > 0
          ? "down"
          : "up";

    // Prevent flash
    if (!this.isSwapping) {
      this.scrollSpeed = Math.abs(scrollDifference);
    }

    this.lastScrollTop = this.scrollTop;
    this.isScrolling = this.scrollSpeed > 0 ? true : false;
  }

  setPositions() {
    if (this.scrollDirection === "unchanged") {
      return;
    }

    if (
      this.scrollDirection === "down" &&
      this.scrollTop >= this.scrollDownThreshold
    ) {
      this.swapElements("down");
    } else if (
      this.scrollDirection === "up" &&
      this.scrollTop <= this.scrollUpThreshold
    ) {
      this.swapElements("up");
    } else {
      this.lastSwap = "";
    }
  }

  animate() {
    let skewYValue =
      this.scrollDirection === "down"
        ? this.scrollSpeed * 0.1
        : this.scrollSpeed * -0.1;
    if (!isNaN(skewYValue)) {
      TweenLite.set(
        [
          this.dom.tagline,
          this.dom.taglinePreviousClone,
          this.dom.taglineNextClone
        ],
        {
          skewY: skewYValue
        }
      );
    }
  }

  updateAnimation() {
    this.raf = requestAnimationFrame(() => {
      this.getPositions();
      this.setPositions();
      this.animate();
      // loop
      this.updateAnimation();
    });
  }
}
