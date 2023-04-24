import { MyPromise } from "./type"

// new MyPromise((reslove, reject) => {
//   reslove('success111')
// }).then(
//   (res) => {
//     console.log(res);
//   },
//   (err) => {
//     console.log(err);
//   }
// )

// new MyPromise((reslove, reject) => {
//   setTimeout(() => {
//     reslove('timeout success')
//   }, 2000)
// }).then(
//   (res) => {
//     console.log(res) // timeout success
//   },
//   (err) => {
//     console.log(err)
//   }
// )
function sayName(name: string) {
  console.log('name', name)
}

new MyPromise<void>((resolve) => {
  resolve()
}).then(() => {
  return 'molly';
}).then((res) => {
  return sayName(res);
}).then((res) => {
  console.log(res);
})

const a = new MyPromise((resolve) => { });
console.log('a', a);