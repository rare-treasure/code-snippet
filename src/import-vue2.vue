<script>
import { cloneDeep } from 'lodash-es';
// xxx => 指代vue2 npm组件包。
import Component from 'xxx';

const CustomComponent = cloneDeep(Component);

const lifeCycleChangeObj = {
  beforeDestroy: 'beforeUnmount',
  destroyed: 'unmounted',
}

for(let [oKey, nKey] of Object.entries(lifeCycleChangeObj)) {
  if(CustomComponent[oKey]) {
    CustomComponent[nKey] = CustomComponent[oKey];

    Reflect.deleteProperty(CustomComponent, oKey);
  }
}

export default {
  name: 'CustomComponent',
  // vue2 组件内部定义的$emit(xxx) xxx要写到这里，不然会出现警告。如内部定义了 this.$emit('data', {}), 则 emits: ['data'];
  emits: [],
  ...CustomComponent,
};

// or 
export default {
  name: 'CustomComponent',
  components: {
    comp: CustomComponent,
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  render() {
    return <comp ref="comp" {...this.$attrs}></comp>
  },
  created() {
    this.initMethods();
  },
  methods: {
    initMethods() {
      const methods = DataHeader?.methods || {};
      
      Object.keys(methods)?.map(function (mKey){
        this[mKey] = (...args) => {
          return this.$refs.comp[mKey](...args);
        }
      }, this)
    }
  }
};
</script>