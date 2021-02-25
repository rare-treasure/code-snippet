import Vue from "vue";
import { DirectiveBinding } from "vue/types/options";
import { Popover } from "element-ui";

declare global {
  interface Window {
    tooltipCanvasCtx: CanvasRenderingContext2D;
  }
}

function px2num(string: string) {
  return +string.replace(/px$/, "");
}

function computedElementWidth(style: CSSStyleDeclaration) {
  const width = px2num(style.width);
  const paddingLeft = px2num(style.paddingLeft);
  const paddingRight = px2num(style.paddingRight);

  return Math.ceil(width - (paddingLeft + paddingRight));
}

function computedTextWidth(style: CSSStyleDeclaration, content: string) {
  let ctx;
  if (window.tooltipCanvasCtx) {
    ctx = window.tooltipCanvasCtx;
  } else {
    window.tooltipCanvasCtx = document
      .createElement("canvas")
      .getContext("2d") as CanvasRenderingContext2D;
    ctx = window.tooltipCanvasCtx;
  }
  ctx.font = `${style.fontSize} ${style.fontFamily}`;

  return Math.ceil(ctx.measureText(content).width);
}

// 判断文本是否超出
function isOver(el: HTMLElement, content: string) {
  let style = getComputedStyle(el) as CSSStyleDeclaration;
  let dom = el as HTMLElement;

  if((style.width === 'auto' || !style.width) && el.parentNode) {
    style = getComputedStyle(el.parentNode as HTMLElement) as CSSStyleDeclaration;

    dom = el.parentNode as HTMLElement;
  }

  const width = computedTextWidth(style, content);
  const maxWidth = computedElementWidth(style);

  return { over: width > maxWidth, width, maxWidth, style, dom };
}

const Constructor = Vue.extend({
  data() {
    return {
      content: "",
      disabled: false,
      reference: {} as HTMLElement,
    };
  },
  render() {
    return (
      <popover
        ref="popover"
        trigger="hover"
        placement="top"
        disabled={this.disabled}
        content={this.content}
        reference={this.reference}
      ></popover>
    );
  },
  components: {
    Popover
  },
});

const instances = new WeakMap();

const createPopover = (el: HTMLElement, val: string) => {
  const {
    dom,
    over
  } = isOver(el, val);
  if (over && dom) {
    const instance = new Constructor();
    instance.reference = dom;
    instance.content = String(val);

    const popover = instance.$mount();

    instances.set(el, popover);
    dom.appendChild(popover.$el);
    el.style.setProperty("overflow", "hidden");
    el.style.setProperty("text-overflow", "ellipsis");
    el.style.setProperty("white-space", "nowrap");
  }
}

export default {
  inserted(el: HTMLElement, { value }: DirectiveBinding) {
    if (el) {
      const val = value || el.innerText;

      setTimeout(() => {
        createPopover(el, val);
      }, 0)
    }
  },
  componentUpdated(el: HTMLElement, { value }: DirectiveBinding) {
    const val = value || el.innerText;
    const instance = instances.get(el);

    if(instance) {
      instance.content = String(val);

      if (isOver(el, val)?.over) {
        instance.disabled = false;
      } else {
        instance.disabled = true;
      }
    } else {
      createPopover(el, val);
    }
  }
};
