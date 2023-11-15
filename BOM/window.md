BOM(Browser Object Model)--浏览器对象模型

## 1.1 Window对象

BOM的核心是window对象，表示浏览器的实例。

### 1.1.1 窗口关系

top对象始终指向最上层（最外层）窗口，即浏览器窗口本身。而parent对象则始终指向当前窗口的父窗口。如果当前窗口是最上层窗口，则parent等于top（都等于window）
最上层的window如果不是通过window.open()打开的，那么其name属性就不会包含值。
还有一个self对象，他是终极window属性，始终会指向window。实际上，self和window就是同一个对象。

### 1.1.2 窗口位置与像素比

window对象的位置可以通过不同的属性和方法来确定，现代浏览器提供了**screenLeft**和**screenTop**属性，用于表示窗口相对屏幕左侧和顶部的位置，返回值的单位是CSS像素。

可以使用moveTo()和moveBy()方法移动窗口。这两个方法都接受两个参数，其中moveTo()接受要移动到的新位置的绝对坐标x和y；而moveBy()则接受相对当前位置的在两个方向上移动的像素数

#### 像素比

css像素是web开发中使用的统一像素单位。这个单位的背后其实是一个角度：**0.0213°**。如果屏幕距离人眼是一臂长，则以这个角度计算的CSS像素大小约为1/96英寸。这样定义像素大小是为了在不同设备上统一标准。这样就带来了一个问题，不同像素密度的屏幕下就会有不同的缩放系数，以便把物理像素（屏幕实际的分辨率）转换为css像素（浏览器报告的虚拟分辨率）

举个例子，手机屏幕的物理分辨率可能是1920\*1080，但是因为其像素可能非常小，所以浏览器就需要将其分辨率降为较低的逻辑分辨率，比如640\*320.这个物理像素与css像素之间的转换比率由**window.devicePixelRatio**属性提供。对于分辨率从1920\*1080转换为640\*320设备上，**window.devicePixelRatio**的值就是3。这样一来，12像素（css像素）的文字实际上就会用36像素的物理像素来显示。

window.devicePixelRatio实际上与每英寸像素数（DPI）是对应的。DPI表示点位像素密度，而window.devicePixelRatio表示物理像素与逻辑像素之间的缩放系数

### 1.1.4 窗口大小

所有现代浏览器都支持4个属性：**innerWidth、innerHight、outerWidth、outerHight**。outerWidth和outerHight返回浏览器窗口自身的大小（不管是在最外层window上使用，还是在网格\<frame>中使用）。innerHight和innerWidth返回浏览器窗口中页面视口大小（不包含浏览器边框和工具栏）。

**document.documentElement.clientWidth**和**document.documentElement.clientHeigth**返回页面视口的宽度和高度。

可以使用**resizeTo()**和**resizeBy()** 方法调整窗口大小。这两个方法都接收两个参数，resizeTo()接受新的宽度和高度值，而resizeBy()接受宽度和高度各要缩放多少。

### 1.1.5 视口位置
