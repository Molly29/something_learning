# Object.defineProperty()
  object.defineProperty()静态方法会直接在一个对象上定义一个新的属性，或修改其现有属性，并返回此对象。
  **语法：Object.defineProperty(obj, prop, descriptor)**
  obj:要定义属性的对象；
  prop:一个字符串或者symbol,指定了要定义或者修改的属性值；
  **descriptor**:要定义或修改的属性的描述符。
  其中descriptor对象里面的可选值有：
  configurable:默认值为false,当值为false时，该属性的类型不能在数据属性和访问器属性之间更改，且该属性不可被删除；
  enumerable:是否可以枚举，默认值为false;
  value:与属性相关联的值，默认是undefine;
  writable:是否可以四通肤质运算符更改，默认值false;
  **get**:用作属性 getter 的函数，如果没有getter则为undefined.
  **set**:用作属性setter 的函数，如果没有setter则为undefined.
  ```js
  var obj = Object.defineProperty({}, 'p', {
    get: function () {
      return 'getter';
    },
    set: function (value) {
      console.log('setter: ' + value);
    }
  });
  obj.p // "getter"
  obj.p = 123 // "setter: 123"
  ```
# vue2响应式原理
  vue.js是采用数据劫持结合发布者-订阅者模式的方式实现响应式的，通过object.defineProperty()来劫持各个属性的setter,getter，在数据发生改变时发布消息给订阅者，触发相应的监听回调。
  要实现mvvm的双向绑定，必须实现一下几点：
  ① 实现一个数据监听器Observer,能够对数据对象的属性进行监听，如有变动可以拿到最新值并通知订阅者。
  ② 实现一个指令解析器Compile, 对每个元素节点的指令进行扫描和解析，更具指令模板替换数据，以及绑定相应的更新函数。
  ③ 实现一个Watcher，作为连接observer和compile的桥梁，能够订阅并收到每个属性变动的通知，执行指令绑定相应的回调函数，从而实现视图更新。
  ④ mvvm入口函数，整合以上三者。
  # 参考文章
  ## https://segmentfault.com/a/1190000006599500
# vue3
## 框架分析
### 改动
proxy 代替 object.definePrototety响应式系统；
ts代替Flow类型检查；
重构了目录结构，将代码主要分成三个独立的模块，更利于长期维护；
重写 VDOM，优化编译性能；
支持 Tree Shaking；
增加了 Composition API（setup），让代码更易于维护；
异步组件需要 defineAsyncComponent 方法来创建
v-if 优先级高于 v-for
destroyed 生命周期选项被重命名为 unmounted
beforeDestroy 生命周期选项被重命名为 beforeUnmount
render 函数默认参数 createElement 移除改为全局引入
组件事件现在需要在 emits 选项中声明
### 新特性：
组合式 API
Teleport
framents（组件支持多个根节点）
createRenderer（跨平台的自定义渲染器）
## 响应式原理
Vue 3 实现响应式，本质上是通过 Proxy API 劫持了数据对象的读写：当访问数据时，会触发 getter 执行依赖收集；修改数据时，会触发 setter 派发通知；
### proxy代理
proxy可以理解为，在目标对象之前架设一层“拦截”，外界对该对象的访问，都必须通过这层拦截，因此提供了一种机制，可对外界的访问进行过滤和改写。Proxy 实际上重载（overload）了点运算符，即用自己的定义覆盖了语言的原始定义，ES6原生提供proxy构造函数，用来生成proxy实例。
```js
let proxy = new Proxy(target,handler)
```
Proxy 对象的所有用法，都是上面这种形式，不同的只是handler参数的写法，其中，new Proxy()表示生成一个Proxy实例，target参数表示所要拦截的目标对象，handler参数也是一个对象，用来定制拦截行为。例如：
``` js
var proxy = new Proxy({}, {
  get: function(target, propKey) {
    return 35;
  }
});

proxy.time // 35
proxy.name // 35
proxy.title // 35
```
  上面代码中，作为构造函数，Proxy接受两个参数。第一个参数是所要代理的目标对象（上例是一个空对象），即如果没有Proxy的介入，操作原来要访问的就是这个对象；第二个参数是一个配置对象，对于每一个被代理的操作，需要提供一个对应的处理函数，该函数将拦截对应的操作。比如，上面代码中，配置对象有一个get方法，用来拦截对目标对象属性的访问请求。get方法的两个参数分别是目标对象和所要访问的属性。可以看到，由于拦截函数总是返回35，所以访问任何属性都得到35。
  如果handler没有设置任何拦截，就等同于直接通向原对象。
  Proxy支持的拦截操作如下：
  **get(target,propKey,receiver)**:拦截对象属性的读取；
  **set(target,propKey,value,receiver)**:拦截对象的属性值的设置；
  **has(target,propKey)**:拦截propKey in proxy 的操作，返回一个布尔值；
  **deleteProperty(target,propKey)**：拦截delete proxy[propKey]的操作；
  **apply(target,object,args)**:拦截 Proxy 实例作为函数调用的操作，比如proxy(...args)、proxy.call(object, ...args)、proxy.apply(...);
  **construct(target, args)**：拦截 Proxy 实例作为构造函数调用的操作，比如new proxy(...args);
  **wenKeys(target)**:拦截Object.getOwnPropertyNames(proxy)、Object.getOwnPropertySymbols(proxy)、Object.keys(proxy)、for...in循环，返回一个数组。该方法返回目标对象所有自身的属性的属性名，而Object.keys()的返回结果仅包括目标对象自身的可遍历属性;
  **getOwnPropertyDescriptor(target, propKey)**：拦截Object.getOwnPropertyDescriptor(proxy, propKey)，返回属性的描述对象;
  **defineProperty(target, propKey, propDesc)**：拦截Object.defineProperty(proxy, propKey, propDesc）、Object.defineProperties(proxy, propDescs)，返回一个布尔值;
  **preventExtensions(target)**：拦截Object.preventExtensions(proxy)，返回一个布尔值;
  **getPrototypeOf(target)**：拦截Object.getPrototypeOf(proxy)，返回一个对象;
  **isExtensible(target)**：拦截Object.isExtensible(proxy)，返回一个布尔值;
  **setPrototypeOf(target, proto)**：拦截Object.setPrototypeOf(proxy, proto)，返回一个布尔值。如果目标对象是函数，那么还有两种额外操作可以拦截。

### 参考链接
#### https://juejin.cn/post/6995732683435278344
#### https://es6.ruanyifeng.com/#docs/proxy