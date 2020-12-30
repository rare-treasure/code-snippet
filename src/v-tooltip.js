import { ElPopover } from 'element-plus';
import { on } from 'element-plus/lib/utils/dom';
import {
  createVNode,
  defineComponent,
  DirectiveBinding,
  nextTick,
  reactive,
  render,
  toRefs,
} from 'vue';

interface PopoverInstance {
  events: Record<string, EventListenerOrEventListenerObject>;
  triggerRef: HTMLElement;
}

function px2num(string: string) {
  return +string.replace(/px$/, '');
}

function computedElementWidth(style: CSSStyleDeclaration, boxRect: DOMRect) {
  const width = boxRect.width;
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
      .createElement('canvas')
      .getContext('2d') as CanvasRenderingContext2D;
    ctx = window.tooltipCanvasCtx;
  }
  ctx.font = `${style.fontSize} ${style.fontFamily}`;

  return Math.ceil(ctx.measureText(content).width);
}

// 判断文本是否超出
function isOver(el: HTMLElement, content: string) {
  const style = getComputedStyle(el) as CSSStyleDeclaration;
  const boxRect = el.getBoundingClientRect() as DOMRect;
  const width = computedTextWidth(style, content);
  const maxWidth = computedElementWidth(style, boxRect);

  return { over: width > maxWidth, width, maxWidth, boxRect };
}

const data = reactive({
  disabled: false,
  clsName: '',
  content: '',
})

const componetSetupConfig = {
  ...toRefs(data),
  ref: {} as PopoverInstance
};

const tooltip = defineComponent({
  setup() {
    return componetSetupConfig;
  },
  render() {
    return (
      <ElPopover
        trigger="hover"
        placement="top"
        ref="popover"
        disabled={this.disabled}
        class={this.clsName}
        content={this.content}
      ></ElPopover>
    );
  },
  components: {
    ElPopover
  },
  mounted() {
    componetSetupConfig.ref = this.$refs.popover as PopoverInstance;
  }
});

const instances = new WeakMap();

export default {
  mounted(el: HTMLElement, { value }: DirectiveBinding) {
    let instance;
    if (!instances.has(el)) {
      const vm = createVNode(tooltip);

      render(vm, el.parentNode as Element);

      instance = {
        ...componetSetupConfig,
        vm,
        get $el() {
          return vm.el as HTMLElement;
        }
      };

      instances.set(el, instance);
    } else {
      instance = instances.get(el);
    }

    if (instance) {
      instance.content.value = value;
      instance.clsName.value = el.className;

      if (isOver(el, value)?.over) {
        instance.disabled.value = false;
      } else {
        instance.disabled.value = true;
      }

      el.style.setProperty('overflow', 'hidden');
      el.style.setProperty('text-overflow', 'ellipsis');
      el.style.setProperty('white-space', 'nowrap');

      if (el.parentNode) {
        el.parentNode.appendChild(instance.$el);

        nextTick(() => {
          const popover = componetSetupConfig.ref as PopoverInstance;

          if (popover) {
            popover.triggerRef = el;
            // because v-popover cannot modify the vnode itself due to it has already been
            Object.entries(popover.events).map(([eventName, e]) => {
              on(el, eventName.toLowerCase().slice(2), e);
            });
          }
        });
      }
    }
  },
  updated(el: HTMLElement, { value }: DirectiveBinding) {
    const instance = instances.get(el);

    if(instance) {
      if (isOver(el, value)?.over) {
        instance.disabled.value = false;

        if(instance.content.value !== value) {
          instance.content.value = value;
        }
      } else {
        instance.disabled.value = true;
      }
    }
  }
};
