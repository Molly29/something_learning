/**
 * 创建保存相应状态的枚举类
 */
enum Status {
  PENDING = 'pending',
  FULFULLED = 'fulfilled',
  REJECTED = 'rejected'
}

/**
 * 将需要用到的类型提出来
 */
type Resolve<T> = (value: T | PromiseLike<T>) => void;
type Reject = (reason?: any) => void;
type Executor<T> = (resolve: Resolve<T>, reject: Reject) => void;
type onFulfilled<T, TResult1> = ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null;
type onRejected<TResult2> = ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null;

function isPromise(value: any): value is PromiseLike<any> {
  return (
    ((typeof value === 'object' && value !== null) || typeof value === 'function') && typeof value.then === 'function'
  )
};

export class MyPromise<T> {
  //开始的状态
  status: Status = Status.PENDING;
  //保存当前Promise的终值
  private value!: T
  //保存当前Promise的据因
  private reason?: any
  private onFulfilledCallback: (() => void)[] = [] //成功的回调
  private onRejectedCallback: (() => void)[] = [] //失败的回调

  constructor(executor: Executor<T>) {
    try {
      //防止this丢失
      executor(this._resolve.bind(this), this._reject.bind(this));
    } catch (e) {
      //出错直接reject
      this._reject(e);
    };
  };
  private _resolve(value: T | PromiseLike<T>) {
    try {
      setTimeout(() => {
        if (isPromise(value)) {
          value.then(this._resolve.bind(this), this._reject.bind(this))
          return;
        }
        if (this.status === Status.PENDING) {
          this.status = Status.FULFULLED;
          this.value = value;
          this.onFulfilledCallback.forEach((fn) => fn());
        }
      })
    } catch (err) {
      this._reject(err);
    }
  }

  private _reject(reason: any) {
    setTimeout(() => {
      if (this.status === Status.PENDING) {
        this.status = Status.REJECTED;
        this.reason = reason;
        this.onRejectedCallback.forEach((fn) => fn());
      }
    })
  }

  public then<TResult1 = T, TResult2 = never>(onfulfilled?: onFulfilled<T, TResult1>, onrejected?: onRejected<TResult2>): MyPromise<TResult1 | TResult2> {
    const promise2 = new MyPromise<TResult1 | TResult2>((resolve, reject) => {
      if (this.status === Status.FULFULLED) {
        setTimeout(() => {
          try {
            let x = onfulfilled!(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        })
      }
      if (this.status === Status.REJECTED) {
        setTimeout(() => {
          try {
            let x = onrejected!(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        })
      }
      if (this.status === Status.PENDING) {
        this.onRejectedCallback.push(() => {
          try {
            let x = onfulfilled!(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        })
        this.onRejectedCallback.push(() => {
          try {
            let x = onrejected!(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      }
    })
    return promise2;
  }
  //  关于 onfulfilled 与 onrejected 如果没有传我们需要进行值的透传，但是在基本功能的实现中我们先不管这个问题，默认一定会传入函数
  // 判断当前状态，如果是异步 reslove 或 reject，那么此时的 status 还是 pending
  //   if (this.status === Status.FULFULLED) {
  //     setTimeout(() => {
  //       onfulfilled!(this.value);
  //     });
  //   }
  //   if (this.status === Status.REJECTED) {
  //     setTimeout(() => {
  //       onrejected!(this.value);
  //     });
  //   }
  //   if (this.status === Status.PENDING) {
  //     this.onFulfilledCallback.push(() => {
  //       onfulfilled!(this.value);
  //     })
  //     this.onRejectedCallback.push(() => {
  //       onrejected!(this.reason);
  //     })
  //   }

  //   return new MyPromise(() => { });
  // }
}

function resolvePromise<T>(
  promise2: MyPromise<T>,
  x: T | PromiseLike<T>,
  reslove: Resolve<T>,
  reject: Reject
) {
  //不能引用同一个对象，否则会无线循环
  if (promise2 === x) {
    const e = new TypeError('TypeError: Chaining cycle detected for promise #<MyPromise>')
    //清空栈信息，不太清楚为什么Promise要清除这个，继续往下
    e.stack = '';
    return reject(e);
  }
  let called = false;//防止多次调用
  if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
    try {
      const then = (x as PromiseLike<T>).then;
      if (typeof then === 'function') {
        then.call(
          x,
          (y) => {
            if (called) return;
            called = true;
            //如果是Promise，我们应该递归地获取到最终状态的值，传入相同的处理函数，不论成功还是失败都能直接抛出到最外层。
            resolvePromise(promise2, y, reslove, reject);
          },
          (r) => {
            if (called) return;
            called = true;
            //如果传入的是Promise被拒绝，直接抛出到最外层
            reject(r);
          }
        )
      } else {
        //不是Promise对象，当做普通值处理
        reslove(x);
      }
    } catch (e) {
      //如果中间出现错误，直接变为拒绝态
      //但是如果出现错误之间已经改变了状态，那么就不用管
      if (called) return;
      called = true;
      reject(e);
    }
  } else {
    //普通值处理
    reslove(x);
  }
}