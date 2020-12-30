<script>
import { cloneDeep } from 'lodash-es';
// xxx => 指代vue2 npm组件包。
import Component from 'xxx';

const CustomComponent = cloneDeep(Component);

CustomComponent.unmounted = CustomComponent.destroyed
Reflect.deleteProperty(CustomComponent, 'destroyed');

export default {
  name: 'CustomComponent',
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  render() {
    return <CustomComponent {...this.$attrs}></CustomComponent>
  }
};
</script>