export class floatCount {
  constructor() {}

  /**
   * 判断obj是否为一个整数
   * @returns {boolean}
   */
   isInteger(n) {
    return Math.floor(n) === n;
  }

  /**
   * 将一个浮点数转成整数，返回整数和倍数，如 3.14 >> 314，倍数是100
   * @param floatNum {number} 小数
   * @return {object}
   *   {time:100, num:314}
   */
  toInteger(floatNum) {
    let res = { times: 1, num: 0 };
    if (this.isInteger(floatNum)) {
      res.num = floatNum;
      return res;
    }
    let strFloatNum = floatNum + '';//转化为字符串
    let dotPos = strFloatNum.indexOf('.');//找到字符串中'.'的index
    let len = strFloatNum.slice(dotPos + 1).length;//找到有几位小数
    let times = Math.pow(10, len);//找到是多少倍，10的几次方
    let initNum = Number(floatNum.toString().replace('.',''))//把3.14拼接成314
    res.times = times;
    res.num = initNum;
    return  res
  }

  /**
   * 核心方法，实现加减乘除，确保不丢失精度
   * 思路：把小数放大为整数（乘），进行算数运算，再缩小为小数（除）
   *
   * @param a {number} 运算数1
   * @param b {number} 运算数2
   * @param digits {number} 精度，保留的小数点数，比如2，即保留为两位小数
   * @param op {string} 运算类型，有加减乘除（add/sub/mu）
   */

  operation(a,b,digits,op){
    let o1 = this.toInteger(a);
    let o2 = this.toInteger(b);
    let n1 = o1.num;
    let n2 = o2.num;
    let t1 = o1.times;
    let t2 = o2.times;
    let max = t1 > t2 ? t1 : t2;
    let res = null;
    switch (op) {
      case 'add':
        if(t1 === t2) {
          return n1 + n2;
        } else if (t1 > t2) {
          res = n1 + n2 * (t1 / t2);
        } else {
          res = n1 * (t2 / t1) + n2;
        }
        return (res / max).toString().match(`^\\d+\\.\\d{${digits}}`)[0];
      case 'subtract':
        if (t1 === t2) {
          res = n1 - n2
        } else if (t1 > t2) {
          res = n1 - n2 * (t1 / t2)
        } else {
          res = n1 * (t2 / t1) - n2
        }
        return (res / max).toString().match(`^\\d+\\.\\d{${digits}}`)[0];
      case 'multiply':
        res = (n1 * n2) / (t1 * t2)
        return res.toString().match(`^\\d+\\.\\d{${digits}}`)[0];
      case 'divide':
        res = (n1 / n2) * (t2 / t1)
        return res.toString().match(`^\\d+\\.\\d{${digits}}`)[0];
    }
  }

  //加减乘除的四个接口
  add(a, b, digits) {
    return this.operation(a, b, digits, 'add')
  }
  subtract(a, b, digits) {
    return this.operation(a, b, digits, 'subtract')
  }
  multiply(a, b, digits) {
    return this.operation(a, b, digits, 'multiply')
  }
  divide(a, b, digits) {
    return this.operation(a, b, digits, 'divide')
  }
}
