/**
 * 创建保存相应状态的枚举类
 */
var Status;
(function (Status) {
    Status["PENDING"] = "pending";
    Status["FULFULLED"] = "fulfilled";
    Status["REJECTED"] = "rejected";
})(Status || (Status = {}));
function isPromise(value) {
    return (((typeof value === 'object' && value !== null) || typeof value === 'function') && typeof value.then === 'function');
}
;
export class MyPromise {
    constructor(executor) {
        //开始的状态
        this.status = Status.PENDING;
        this.onFulfilledCallback = []; //成功的回调
        this.onRejectedCallback = []; //失败的回调
        try {
            //防止this丢失
            executor(this._resolve.bind(this), this._reject.bind(this));
        }
        catch (e) {
            //出错直接reject
            this._reject(e);
        }
        ;
    }
    ;
    _resolve(value) {
        try {
            setTimeout(() => {
                if (isPromise(value)) {
                    value.then(this._resolve.bind(this), this._reject.bind(this));
                    return;
                }
                if (this.status === Status.PENDING) {
                    this.status = Status.FULFULLED;
                    this.value = value;
                    this.onFulfilledCallback.forEach((fn) => fn());
                }
            });
        }
        catch (err) {
            this._reject(err);
        }
    }
    _reject(reason) {
        setTimeout(() => {
            if (this.status === Status.PENDING) {
                this.status = Status.REJECTED;
                this.reason = reason;
                this.onRejectedCallback.forEach((fn) => fn());
            }
        });
    }
    then(onfulfilled, onrejected) {
        const promise2 = new MyPromise((resolve, reject) => {
            if (this.status === Status.FULFULLED) {
                setTimeout(() => {
                    try {
                        let x = onfulfilled(this.value);
                        resolvePromise(promise2, x, resolve, reject);
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            }
            if (this.status === Status.REJECTED) {
                setTimeout(() => {
                    try {
                        let x = onrejected(this.reason);
                        resolvePromise(promise2, x, resolve, reject);
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            }
            if (this.status === Status.PENDING) {
                this.onRejectedCallback.push(() => {
                    try {
                        let x = onfulfilled(this.value);
                        resolvePromise(promise2, x, resolve, reject);
                    }
                    catch (e) {
                        reject(e);
                    }
                });
                this.onRejectedCallback.push(() => {
                    try {
                        let x = onrejected(this.reason);
                        resolvePromise(promise2, x, resolve, reject);
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            }
        });
        return promise2;
    }
}
function resolvePromise(promise2, x, reslove, reject) {
    //不能引用同一个对象，否则会无线循环
    if (promise2 === x) {
        const e = new TypeError('TypeError: Chaining cycle detected for promise #<MyPromise>');
        //清空栈信息，不太清楚为什么Promise要清除这个，继续往下
        e.stack = '';
        return reject(e);
    }
    let called = false; //防止多次调用
    if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
        try {
            const then = x.then;
            if (typeof then === 'function') {
                then.call(x, (y) => {
                    if (called)
                        return;
                    called = true;
                    //如果是Promise，我们应该递归地获取到最终状态的值，传入相同的处理函数，不论成功还是失败都能直接抛出到最外层。
                    resolvePromise(promise2, y, reslove, reject);
                }, (r) => {
                    if (called)
                        return;
                    called = true;
                    //如果传入的是Promise被拒绝，直接抛出到最外层
                    reject(r);
                });
            }
            else {
                //不是Promise对象，当做普通值处理
                reslove(x);
            }
        }
        catch (e) {
            //如果中间出现错误，直接变为拒绝态
            //但是如果出现错误之间已经改变了状态，那么就不用管
            if (called)
                return;
            called = true;
            reject(e);
        }
    }
    else {
        //普通值处理
        reslove(x);
    }
}
