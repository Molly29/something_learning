## 1.实现原理

前端路由一般有两种实现方式，一种是Hash路由，一种是History路由

## 2.History路由

window.history属性指向 History 对象，它表示当前窗口的浏览历史。
History 对象保存了当前窗口访问过的所有页面网址

# 2.1属性

History.length 当前窗口访问过的网址数量（包括当前网页）,只读属性；
History.state 返回一个表示历史堆栈顶部的状态的值

# 2.2属性·

History.back() 前往上一页，用户可点击浏览器左上角的返回按钮模拟此方法，等价于History.go(-1);
History.forward() 在浏览器历史记录里面前往下一页，等价于History.go(1);
History.go() 通过当前页面的相对位置从浏览器历史记录（会话记录）加载页面。

## 3.Hash路由

路由中会有一个#，#会有两种情况，第一种是锚点，比如典型的回到顶部按钮原理，github上各个标题之间的跳转等，路由中的称为hash，
当hash值发生改变时，可以通过hashchange事件监听到，从而在回调函数里面触发某些方法

## 4.简单版路由（simple）

监听 hashchange ，hash 改变的时候，根据当前的 hash 匹配相应的 html 内容，然后用 innerHTML 把 html 内容放进 router-view 里面。
