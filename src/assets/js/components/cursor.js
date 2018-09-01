//  Cursor

import TweenMax from "gsap";

export default class CursorManager {
  constructor(options) {
    // Default options

    const defaults = {
      container: document.body,
      elementClass: "cursor",
      outerElementClass: "cursor__outer",
      innerElementClass: "cursor__inner",
      defaultType: "default",
      innerMarkup: "",
      element: undefined,
      interactiveTagNames: [],
      interactiveElementsSelectors: []
    };

    // Override with initialization options

    let opts = Object.assign({}, defaults, options);
    Object.keys(defaults).forEach(prop => {
      this[prop] = opts[prop];
    });

    // Properties
    this.name = "cursor";
    this.mousePosition = {
      x: 0,
      y: 0
    };

    if (!this.element) {
      if (this.innerMarkup === "") {
        this.innerMarkup = `<div class="${
          this.outerElementClass
        }"><div class="${this.innerElementClass}"></div></div>`;
      }
    }

    // Return on touch devices

    if (
      "ontouchstart" in window ||
      (window.DocumentTouch && document instanceof DocumentTouch)
    ) {
      return false;
    }

    // Init

    // this.init();
  }

  init() {
    // Add container class - can be used to hide real cursor

    this.container.classList.add("js-has-cursor");
    this.container.setAttribute("data-cursor-type", this.defaultType);

    if (!this.element) {
      // Create cursor element
      this.element = document.createElement("div");
      this.element.classList.add(this.elementClass);
      this.element.innerHTML = this.innerMarkup;
    }

    this.element.setAttribute("data-cursor-type", this.defaultType);
    this.element.setAttribute("data-cursor-hiding", "");

    this.container.appendChild(this.element);

    this.currentContainer = this.container;

    // Listen for events to modify cursor
    this.bindedOnMouseEnter = this.onMouseEnter.bind(this);
    this.bindedOnMouseLeave = this.onMouseLeave.bind(this);
    this.attachEvents();

    this.setMousePosition = this.setMousePosition.bind(this);
    this.container.addEventListener("mousemove", this.setMousePosition, false);

    // Hovering elements

    this.onMouseOver = this.onMouseOver.bind(this);
    this.container.addEventListener("mouseover", this.onMouseOver, false);

    this.onMouseOut = this.onMouseOut.bind(this);
    this.container.addEventListener("mouseout", this.onMouseOut, false);

    // Activity

    this.bindedOnMouseDown = this.onMouseDown.bind(this);
    this.container.addEventListener("mousedown", this.bindedOnMouseDown, false);

    this.bindedOnMouseUp = this.onMouseUp.bind(this);
    this.container.addEventListener("mouseup", this.bindedOnMouseUp, false);

    this.start();
  }

  attachEvents() {
    this.elementsWithCursors = document.querySelectorAll("[data-cursor-type]");
    this.elementsWithCursors.forEach(element => {
      element.addEventListener("mouseenter", this.bindedOnMouseEnter, false);
      element.addEventListener("mouseleave", this.bindedOnMouseLeave, false);
    });
  }

  removeEvents() {
    if (this.elementsWithCursors) {
      this.elementsWithCursors.forEach(element => {
        element.removeEventListener("mouseenter", this.bindedOnMouseEnter);
        element.removeEventListener("mouseleave", this.bindedOnMouseLeave);
      });
    }
  }

  refresh() {
    this.removeEvents();
    this.attachEvents();
  }

  destroy() {
    window.removeEventListener("mousemove", this.setMousePosition, false);
  }

  start() {
    this.raf = window.requestAnimationFrame(() => {
      this.animate();
      this.start();
    });
  }

  stop() {
    if (this.raf) {
      window.cancelAnimationFrame(this.raf);
    }
  }

  setMousePosition(e) {
    if (this.container === document.body) {
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
    } else {
      this.mousePosition.x = e.offsetX;
      this.mousePosition.y = e.offsetY;
    }
  }

  animate() {
    TweenMax.to(this.element, 0.3, {
      x: this.mousePosition.x,
      y: this.mousePosition.y
    });
  }

  onMouseEnter(e) {
    // console.log('onMouseEnter')
    this.element.setAttribute(
      "data-cursor-type",
      e.target.getAttribute("data-cursor-type")
    );
    this.currentContainer = e.target;
  }

  onMouseLeave(e) {
    // console.log('onMouseLeave')
    this.element.setAttribute("data-cursor-type", this.defaultType);
  }

  onMouseOver(e) {
    // console.log('onMouseOver')
    // console.log(e)

    // Remove eventual hiding attribute
    if (this.element.hasAttribute("data-cursor-hiding")) {
      this.element.removeAttribute("data-cursor-hiding");
    }

    // Check if target has interactive tag
    if (this.interactiveTagNames.includes(e.target.tagName)) {
      this.element.setAttribute("data-cursor-interactive", "");
    }

    // Check if target has interactive class
    if (this.matchesSelectors(e.target)) {
      // console.log('match')
      this.element.setAttribute("data-cursor-interactive", "");
    }

    // Check cursor types
    // console.log(this.currentContainer)
    // console.log(!this.currentContainer.contains(e.target))
    // console.log(e.target.hasAttribute("data-cursor-type"))

    // if (this.currentContainer && !this.currentContainer.contains(e.target) && e.target.hasAttribute("data-cursor-type")) {
    //     this.element.setAttribute(
    //         "data-cursor-type",
    //         e.target.getAttribute("data-cursor-type")
    //     );
    //     this.currentContainer = e.target;
    // }

    // if (!e.target.hasAttribute("data-cursor-type")) {
    //     console.log('no attr')
    //     return;
    // }

    // if (e.target.hasAttribute("data-cursor-type")) {
    //     this.element.setAttribute(
    //         "data-cursor-type",
    //         e.target.getAttribute("data-cursor-type")
    //     );
    //     this.currentContainer = e.target;
    // }
  }

  onMouseOut(e) {
    // console.log('onMouseOut')
    // console.log(e)

    // Out of the window state
    if (e.relatedTarget === null) {
      this.element.setAttribute("data-cursor-hiding", "");
    }
    // Out of the container state
    if (e.target === this.container) {
      this.element.setAttribute("data-cursor-hiding", "");
    }
    // Out of interactive tag
    if (this.interactiveTagNames.includes(e.target.tagName)) {
      this.element.removeAttribute("data-cursor-interactive");
    }
    // Out of interactive class
    if (this.matchesSelectors(e.target)) {
      this.element.removeAttribute("data-cursor-interactive");
    }
    // Remove cursor types
    // if (this.currentContainer) {
    //     console.log(this.currentContainer)
    //     console.log(this.currentContainer.contains(e.relatedTarget))
    //     console.log(e.target.getAttribute("data-cursor-type"))
    //     console.log(this.element.getAttribute("data-cursor-type"))
    // }

    // if (!e.target.hasAttribute("data-cursor-type")) {
    //     console.log('no attr')
    //     return;
    // }

    // if (this.currentContainer && !this.currentContainer.contains(e.relatedTarget) && e.target.getAttribute("data-cursor-type") === this.element.getAttribute("data-cursor-type")) {
    //     this.element.setAttribute("data-cursor-type", this.defaultType);
    // }
    // console.log(e.target.getAttribute("data-cursor-type"))
    // console.log(this.element.getAttribute("data-cursor-type"))
    // if (e.target.getAttribute("data-cursor-type") === this.element.getAttribute("data-cursor-type")) {
    //     this.element.setAttribute("data-cursor-type", this.defaultType);
    // }
  }

  onMouseDown(e) {
    // console.log("onMouseDown");
    this.element.setAttribute("data-cursor-holding", "");
  }

  onMouseUp(e) {
    // console.log("onMouseUp");
    this.element.removeAttribute("data-cursor-holding");
  }

  matchesSelectors(element) {
    let match = false;
    this.interactiveElementsSelectors.forEach(selector => {
      if (element.matches(selector)) {
        match = true;
      }
    });
    return match;
  }
}
