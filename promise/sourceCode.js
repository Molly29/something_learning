//promise.all部分源码
function myPromiseall (promises) {
  return new Promise(function (reslove, reject) {
    if (!Array.isArray(promises)) {
      throw new TypeError('argument must be a array')
    }
    var count = 0;
    var length = promises.length;
    var result = [];
    for (let i = 0; i < length; i++) {
      Promise.resolve(promises[i]).then(val => {
        count += 1;
        result[i] = val;
        if (count === length) {
          return resolve(result)
        }
      }, err => {
        return reject(err)
      })
    }
  })
}
//promise.race源码
Promise.race = function (args) {
  return new Promise((resolve, reject) => {
    for (let i = 0, len = args.length; i < len; i++) {
      args[i].then(resolve, reject)
    }
  })
}
//promise.allSettled部分源码
function allSettled (arr) {
  var P = this;
  return new P(function (resolve, reject) {
    if (!(arr && typeof arr.length !== 'undefined')) {
      return reject(
        new TypeError(
          typeof arr +
          ' ' +
          arr +
          ' is not iterable(cannot read property Symbol(Symbol.iterator))'
        )
      );
    }
    /**
     * 此处使用call将this由Array.prototype指向arr,这样arr就可以使用slice（）方法了
     * slice() 方法返回一个新的数组对象，
     * 这一对象是一个由 start 和 end 决定的原数组的浅拷贝（包括 start，不包括 end），其中 start 和 end 代表了数组元素的索引。原始数组不会被改变。
     */
    var args = Array.prototype.slice.call(arr);
    if (args.length === 0) return resolve([]);
    var remaining = args.length;

    function res (i, val) {
      if (val && (typeof val === 'object' || typeof val === 'function')) {
        var then = val.then;
        if (typeof then === 'function') {
          then.call(
            val,
            function (val) {
              res(i, val);
            },
            function (e) {
              args[i] = { status: 'rejected', reason: e };
              if (--remaining === 0) {
                resolve(args);
              }
            }
          );
          return;
        }
      }
      args[i] = { status: 'fulfilled', value: val };
      if (--remaining === 0) {
        resolve(args);
      }
    }

    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
}
//promise.any部分源码
function any (arr) {
  var P = this;
  return new P(function (resolve, reject) {
    if (!(arr && typeof arr.length !== 'undefined')) {
      return reject(new TypeError('Promise.any accepts an array'));
    }

    var args = Array.prototype.slice.call(arr);
    if (args.length === 0) return reject();

    var rejectionReasons = [];
    for (var i = 0; i < args.length; i++) {
      try {
        P.resolve(args[i])
          .then(resolve)
          .catch(function (error) {
            rejectionReasons.push(error);
            if (rejectionReasons.length === args.length) {
              reject(
                new AggregateError(
                  rejectionReasons,
                  'All promises were rejected'
                )
              );
            }
          });
      } catch (ex) {
        reject(ex);
      }
    }
  });
}