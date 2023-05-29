# 一、Event Loop
## 1.1、前言
  Event Loop即事件循环，是浏览器或者Node解决单线程运行时不会阻塞的一种机制；
  eg:天气冷了，早上刚醒来想喝点热水暖暖身子，但这每天起早贪黑996，晚上回来太累躺下就睡，没开水啊，没法子，只好急急忙忙去烧水。
现在早上太冷了啊，不由得在被窝里面多躺了一会，收拾的时间紧紧巴巴，不能空等水开，于是我便趁此去洗漱，收拾自己。
洗漱完，水开了，喝到暖暖的热水，舒服啊！
舒服完，开启新的996之日，打工人出发！
烧水和洗漱是在同时间进行的，这就是计算机中的异步。
计算机中的同步是连续性的动作，上一步未完成前，下一步会发生堵塞，直至上一步完成后，下一步才可以继续执行。例如：只有等水开，才能喝到暖暖的热水。
## 1.2、浏览器线程和进程
  计算机资源独立分配到各个进程，进程之间相互独立；一个进程由多个线程组成，是包含关系；同一进程下的各个线程之间共享程序的内存空间。
  **进程**：进程是cpu资源分配的最小单位（能拥有资源和独立运行的最小单位）；
  **线程**：线程是cpu调度的最小单位（线程是建立在进程的基础上的一次程序运行单位）；
  浏览器，是一种多进程的架构设计，**在浏览器中打开一个网页相当于新起了一个进程**，浏览器也有自己的优化机制，比如五个空白页**合并**成同一个进程；
### 1.2.1、Browser进程（主进程）
  控制chrome的地址栏，书签栏，返回和前进按钮，同时还有浏览器的不可见部分，例如网络请求和文件访问。
### 1.2.2、第三方插件进程
  每种插件一个进程，插件运行时才会创建
### 1.2.3、GPU进程
  **仅此一个**，用于3D绘制等
### 1.2.4、浏览器渲染进程（浏览器内核）
  负责界面渲染，脚本执行，事件处理
## 1.3、多线程的浏览器内核
  浏览器的内核是浏览器的核心，主要由以下五种线程组成：
### 1.3.1、GUI渲染进程
  负责渲染浏览器界面（解析html,css,构建DOM树，Render树，布局和绘制等）。GUI的更新会保存在一个队列中，等js引擎空闲时立即被执行。当界面需要重绘或由于某种操作引发的重排时，该线程就会被执行。**GUI渲染线程与JS引擎是互斥的**，这也是造成JS堵塞的原因所在。
### 1.3.2、JS引擎线程
  也称为JS内核，负责处理JS脚本。
  一个TAB页只有一个Js线程运行JS程序；由于GUI渲染线程与JS引擎是互斥的，所以如果JS执行的时间过长，就会造成页面的不连贯。
### 1.3.3、事件触发线程
  事件触发线程属于浏览器，不属于js引擎，主要用来控制时间循环，当对应的时间符合触发条件被处罚时，该线程回吧时间添加到待处理队列（宏任务）的队尾，等待js引擎的处理。
### 1.3.4、定时器触发线程
### 1.3.5、异步HTTP请求线程
  XMLHttpRequest 在连接后是通过浏览器新开的一个线程请求。当检测到状态更新时，如果没有设置回调函数，异步线程就产生状态变更事件，将这个回调再放入事件队列（微任务）中，等待 JS 引擎执行。
## 1.3、宏任务和微任务
  由于js是单线程的，也就是前一个任务结束才能执行后一个任务。而有时候，前一个任务耗时很长，后一个任务就必须一直等待；而且有很多时候cpu是空闲状态，因为IO设备（输入输出设备）很慢（如Ajax操作从网络中读取数据），不得不等结果出来后，再继续往下执行。js语言设计这意识到，其实主线程完全可以不管IO设备，挂起处于等待中的任务，先运行排在后面的任务，等到IO设备返回了结果，再将挂起的任务执行下去。
  所以，任务可以分为两种一种是同步任务，一种是异步任务，异步任务就是不进入主线程，会进入任务队列，由任务队列通知主线程，某个异步任务可以执行了，该任务才会进入主线程。
  具体来说，异步任务执行如下：
  ① 所有同步任务都在主线程上执行，形成一个执行栈；
  ② 主线程之外，还有一个”任务队列“，异步任务有了运行结果，就会在“任务队列”之中放置一个事件；
  ③ 一旦“执行栈”中的所有同步任务执行完毕，系统就会读取“任务队列”，看看里面有哪些事件，对应哪些异步任务，然后结束等待状态，进入执行栈，开始执行。
  ④ 主线程不断重复上面三个步骤。
  异步任务也有执行顺序，也是**从上往下**，但是，异步任务里，对于异步任务类型又进行了进一步的划分，分为**微任务和宏任务**；**微任务比宏任务先执行**
  **微任务：** 
  process.nextTick、Promise.then()、Promise.catch()
  **宏任务：**
  setTimeout、setInterval、 setImmediate、script（整体代码）、I/O 操作等
# Promise理解
  Promise是javascript中处理异步操作的一种机制，可以更好的组织和管理异步代码；
  ① 异步处理：promise主要用于处理一些异步操作代码，例如网络请求、文件读写等需要一定的时间才能返回结果。使用Promise可以避免回调地狱，使异步代码更为清楚便于管理；
  ② 状态管理：promise有三种状态pending(进行中)、fulfilled(已成功)、rejected(已失败)，只有异步操作的结果，可以决定当前是那种状态，任何其他操作都无法改变这个状态，
     promise对象状态改变只有两种可能，一种是从pending变为fulfilled，另一种是从pending变为rejected；为了行文方便，后续将resolved统一指fulfilled。
  ③ 链式调用：promise支持链式调用，即就是可以通过“then”方法将多个异步操作串联起来执行。这样可以更好的表达代码的逻辑顺序，避免了嵌套回调函数。而链式调用可以使用“catch”
    方式捕获错误，并通过finally方法进行清理工作。
  **缺点：** 首先无法取消promise，一旦新建它就会立即执行，无法中途取消。其次，如果不设置回调函数，promise内部抛出的错误，不会反应到外部。第三，当处于pending时，无法得知目前进展到哪一个阶段（刚刚开始还是即将完成）。
## Promise 方法
  ① Promise.all(iterable):这个方法接受一组promise(或者一个可迭代对象)，并返回一个promise
  部分源码（./sourceCode.js）可见
  ② Promise.race(iterable):接受一个可迭代对象，类似array;返回一个promise,一旦迭代器中的某个promise解决或者拒绝，返回的promise就会解决或者拒绝；
  部分源码（./sourceCode.js）可见
  ③ Promise.allSettled()方法以promise组成可迭代对象作为输入，并且返回一个promise实例。
  接受一个promise数组作为参数，等到数组内所有promise都有了结果，不论是resolved还是rejected的，等所有promise状态都发生变化，返回的promise的状态才会发生变更。
  而且返回的Promise状态总是fulfilled，不会变成rejected，回调函数里会接受一个数组作为参数，该数组的每个成员对应前面数组的每个promise对象
  部分源码（./sourceCode.js）可见
  ④ Promise.any() 接收一个由 Promise 所组成的可迭代对象，该方法会返回一个新的 promise
  Promise.any()主要是针对只要参数实例有一个变成fulfilled状态，包装实例就会变成fulfilled状态；如果所有参数实例都变成rejected状态，包装实例就会变成rejected状态。
  同时还有一个特点：Promise.any()不会因为某个 Promise 变成rejected状态而结束，必须等到所有参数 Promise 变成rejected状态才会结束。
  对于返回值：
    只要其中的一个 promise 成功，就返回那个已经成功的 promise；
    如果可迭代对象中没有一个 promise 成功（即所有的 promises 都失败/拒绝），就返回一个失败的 promise 和 AggregateError 类型的实例，它是 Error 的一个子类，用于把单一的错误集合在一起；

# 参考文献
1、https://juejin.cn/post/6886360224308035598
2、https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise
3、https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Using_promises#%E9%93%BE%E5%BC%8F%E8%B0%83%E7%94%A8
4、https://juejin.cn/post/7020328988715270157
5、https://juejin.cn/post/7157957060628316191
6、https://vue3js.cn/interview/es6/promise.html
7、https://es6.ruanyifeng.com/#docs/promise
8、源码https://github.com/taylorhakes/promise-polyfill/blob/master/dist/polyfill.js
9、https://juejin.cn/post/7041893005761970184
10、https://juejin.cn/post/7042190759730085918