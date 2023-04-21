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
    return (((typeof value === 'object' && value !== null) || typeof value === 'function') || typeof value.then === 'function');
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
        //  关于 onfulfilled 与 onrejected 如果没有传我们需要进行值的透传，但是在基本功能的实现中我们先不管这个问题，默认一定会传入函数
        // 判断当前状态，如果是异步 reslove 或 reject，那么此时的 status 还是 pending
        if (this.status === Status.FULFULLED) {
            setTimeout(() => {
                onfulfilled(this.value);
            });
        }
        if (this.status === Status.REJECTED) {
            setTimeout(() => {
                onrejected(this.value);
            });
        }
        if (this.status === Status.PENDING) {
            this.onFulfilledCallback.push(() => {
                onfulfilled(this.value);
            });
            this.onRejectedCallback.push(() => {
                onrejected(this.reason);
            });
        }
        return new MyPromise(() => { });
    }
}
