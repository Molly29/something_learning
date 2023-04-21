import { MyPromise } from "./type.js";
new MyPromise((reslove, reject) => {
  reslove('success111');
}).then((res) => {
  console.log(res);
}, (err) => {
  console.log(err);
});
new MyPromise((reslove, reject) => {
  setTimeout(() => {
    reslove('timeout success');
  }, 2000);
}).then((res) => {
  console.log(res); // timeout success
}, (err) => {
  console.log(err);
});
