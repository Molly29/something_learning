/**
 * 数据监听Observer,能够对数据对象的所有属性进行监听
 * 如有变动可拿到最新值并通知订阅者
 */
interface dataType {
  name: string;
}
let subs = [];
let data = { name: 'kk' };
observe(data);
data.name = 'lili';

function observe(data: object) {
  if (!data || typeof data !== 'object') {
    return;
  }
  Object.keys(data).forEach((key: string) => {
    defineReactive(data, key, data[key])
  })
};

function defineReactive(data: object, key: string, val: any) {
  const dep = new Dep()
  observe(val);
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: false,
    get() {
      return val;
    },
    set(newVal) {
      if (val === newVal) return;
      console.log('值发生更改');
      val = newVal;
      dep.notify();
    },
  })
};


function Dep() {
  this.subs = [];
}
Dep.prototype = {
  addSub: function (sub: any) {
    this.subs.push(sub);
  },
  notify: function () {
    this.subs.forEach((sub: any) => {
      sub.updata();
    })
  }
}