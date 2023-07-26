polling: (executor, condition, delay = 2000, timeout) => {
  const start = performance.now();
  let timer = null;
  const resolveExecutor = function (...args) {
    return Promise.resolve(executor.apply(this, args));
  };
  return new Promise((resolve, reject) => {
    const loop = async function (executor, condition, delay, timeout) {
      if (performance.now() - start > timeout) {
        //超时
        if (timer) clearTimeout(timer);
        reject(new Error('timeout'))
      }
      console.log('condition', typeof condition)
      if (typeof condition === 'function') {
        console.log('function')
        try {
          const finished = await condition.apply(this);
          console.log('function', finished)
          if (finished) {
            if (timer) clearTimeout(timer);
            resolve(resolveExecutor);
            return;
          }
        } catch (error) {
          if (timer) clearTimeout(timer);
          reject(error);
          return;
        }
      } else if (condition instanceof Promise) {
        console.log('Promise')
        try {
          const conditionResult = await condition;
          const finished = conditionResult === true;
          console.log('Promise', finished)
          if (finished) {
            if (timer) clearTimeout(timer);
            resolve(resolveExecutor);
            return;
          }
        } catch (error) {
          if (timer) clearTimeout(timer);
          reject(error);
          return;
        }
      }

      timer = setTimeout(() => {
        loop(executor, condition, delay, timeout);
      }, delay);
    }
    loop(executor, condition, delay, timeout)
  })
}