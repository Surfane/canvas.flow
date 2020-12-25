<h1><center>Html5 canvas 制作流程</center></h1>

## 1. Canvas API

### 1.1. Canvas对象
##### 1.1.1. 画布,页面容器: ***canvas : HtmlCanvasElement***
> - 需定义宽(***width : number***),高(***height : number***)属性(***attribute***)
> - 无法直接使用页面样式(***css***)修改
##### 1.1.2. 上下文,实际编码绘制操作对象: ***context***
> - 目前使用 ***"2d"*** 模式(mode)
> - 画布绘制方法都基于上下文
> - context = canvas.***getContext(*** *mode* ***)***
### 1.2. Context 方法
##### 1.2.1. 获取上下文 *getContext(mode)*
##### 1.2.2. 开始: *beginPath()*
##### 1.2.3. 结束: *closePath()*
##### 1.2.4. 画框: *stroke()*
##### 1.2.5. 填充: *fill()*
##### 1.2.6. 起点: *moveTo(x,y)*
##### 1.2.7. 画线: *lineTo(x,y)*
##### 1.2.8. 画方形: *rect(x,y,width,height)*
##### 1.2.9. 擦除方形: *clearRect(x,y,width,height)*
##### 1.2.10. 画圆(弧)形: *arc(x, y, r, 0, 2 * Math.PI)*
##### 1.2.11. 填充文本: *fillText(text,x,y)*
##### 1.2.12. 缩放: *scale(x,y)*
##### 1.2.13. 平移: *translate(x,y)*
##### 1.2.14. 线性渐变: *createLinearGradient(x0,y0,x1,y1)*
### 1.3. Context 属性
##### 1.3.1. 线条宽度: *lineWidth*
##### 1.3.2. 线框样式: *strokeStyle*
##### 1.3.3. 填充样式: *fillStyle*
##### 1.3.4. 文本样式: *font*
##### 1.3.5. 文本水平对齐方式: *textAlign*
##### 1.3.6. 文本垂直对齐方式: *textBaseline*

## 2. 自定义API
### 2.1. 对外接口
##### 2.1.1. 构造函数
> - ***constructor(***
　　*canvasElement:* ***HtmlCanvasElement,***
　　*config:* ***object,***
　　*data:* ***Array,***
　　*canvasCallbackEvent:* ***object,***
　　*graphicDrawFunction:* ***object***
***) : Void***
##### 2.1.2. 获取全体图像数据
> - ***getData() : Array***
##### 2.1.3. 设置全体图像数据
> - ***setData(*** *data:* ***Array) : Void***
##### 2.1.4. 添加元素
> - ***addData(*** *data :* ***Object) : Void***
##### 2.1.5. 删除元素
> - ***deleteData(*** *data :* ***Object) : Void***
##### 2.1.6. 更新元素
> - ***updateData(*** *data :* ***Object) : Void***
##### 2.1.7. 缩放图像
> - ***scale(*** *x:* ***number,*** *y:* ***number) : Void***
##### 2.1.8. 平移图像
> - ***translate(*** *x:* ***number,*** *y:* ***number) : Void***
##### 2.1.9. 画布配置
> - ***init(*** *config:* ***object) : Void***

### 2.2. 内部属性
##### 2.2.1. 图像元素: ***graphic : Map***,画面绘制的基本图像
> - 实际定义的数据为对象数组(***id唯一***)
> - 使用 ***setData(*** *par* : ***Array)*** 转换为 ***Map*** 对象: ***key = id*** 
> - 每个节点元素定义一个图像元素
> - 图像元素在选中与未选中时显示不同状态
> - 只允许选中一个图像元素 ***activeGraphic : Object***
> - 要添加的图像元素 ***addGraphic : Object***
```javascript
object = { // 图像对象格式
  id: '图像唯一标识',
  name: '图像文本名称',
  type:'图像类型--用于调用不同绘制函数绘制',
      //连接矢量的后续连接图像数据,可选格式:
      //1. 后续图像id字符串
      //2. 后续图像id字符串数组
      //3. 后续对像id及条件condition信息对象
      //4. 后续对像id及条件condition信息对像数组
  next: [{ 
    id:'后续连接图像id',
    condition: '后续连接条件'
  }],
  style: { // 图像样式,
    x:'中心点x坐标',
    y:'中心点y坐标',
    r:'半径,仅对圆有效,如果未定义,则取 width / 2',
    width:'宽度',
    height:'高度',
    lineWidth:'线条宽度',
    fillStyle:'线框样式',
    strokeStyle:'填充样式',
}
```
##### 2.2.2. 连接矢量: ***vector : Array***,图像元素连接
> - 两个有连接关系的图像元素(***next***)存在连接矢量
> - 使用 ***setData(*** *par* : ***Array)*** 获取具体的连接矢量数组 ***Array***
> - 连接矢量在选中与未选中时显示不同状态
> - 只允许选中一个连接矢量 ***activeVector : Object***
> - 当前选中矢量的起点数据 ***vectorBegin : Object*** 与终点数据 ***vectorEnd : Object***
```javascript
object = { // 矢量对象格式
  x0:'起点X轴坐标',
  y0:'起点y轴坐标',
  x1:'终点x轴坐标',
  y1:'终点y轴坐标',
  begin:'起点图像id',
  end:'终点图像id'
}
```
##### 2.2.3. 回调函数: ***EVENT.CALL_BACK***,画布事件回调传参
> - 对外事件回调接口,实现类似事件 ***emit(event,data)***
##### 2.2.4. 窗口默认支持事件 ***EVENT.WINDOW : Object***
> - (del)kewdown
##### 2.2.5. 画布默认支持事件 ***EVENT.CANVAS : Object***
> - click, dblclick, mousewheel, mousedown, mouseup, mousemove
##### 2.2.6. 图像元素绘制和判断函数 ***EVENT.GRAPHIC : Object***
> - circle(圆形), rectangle(方形), rhomb(菱形)
##### 2.2.7. 数据类别对应图像元素 ***GRAPHIC_TYPE : Object***
> - start: circle, end: circle, task: rectangle, judge: rhomb
##### 2.2.8. 默认的画面配置项 ***DEFAULT_CONFIG : Object***
> - 宽度( ***width***), 高度( ***height***), 缩放( ***scale***), 平移( ***translate***), 拖动( ***draggable***), 网格( ***grid***)
> - 线条样式( ***strokeStyle***), 填充样式( ***fillStyle***), 线条宽度( ***lineWidth***), 文本样式( ***font***), 文本垂直对齐( ***textBaseline***), 文本水平对齐( ***textAlign***)
##### 2.2.9. 默认配置
``` javascript
DEFAULT_CONFIG = {
  canvasId: 'canvas', // Canvas容器Id,当窗口不存在时默认的获取方式
  canvasMode: '2d', // Canvas画布模式
  frame: {
    width: 400, // 画面宽度,默认为容器宽度
    height: 300,// 画面高度,默认为容器高度
    showGrid: false, // 是否绘制网络
    gridSpace: 20, // 网络间距
    waitLink: false, // 画布是否处于拖动连接状态
    draggable: false, // 画布是否允许拖动图像
    draggableAll: false, // 画布是否处于整体拖动状态
    draggableElement: false,// 画布是否处于单个图像拖动状态
    scale: { x:1,  y:1 }, //当前缩放比例
    scaled: { x:1,  y:1 }, //总体缩放比例
    translate: { x:0,  y:0 }, // 当前平移比例
    translated: { x:0,  y:0 } // 总体平移比例
  },
  style: {
    font: '20px Arial', //文本样式
    textBaseline: 'hanging', //文本垂直对齐方式
    textAlign: 'center',//文本水平对齐方式
    fillStyle: '#DCDCDC', //填充样式
    strokeStyle: '#F5F5F5', //边框样式
    lineWidth: 1 //线条宽度
  }
}
```
##### 2.2.10. 属性定义
``` javascript
CANVAS = {
  CANVAS: Symbol(), // Canvas容器
  CONTEXT: Symbol(), // Canvas上下文
  FRAME: Symbol(), // Canvas容器属性定义,继承默认配置的frame
  STYLE: Symbol(), // Canvas上下文属性定义,继承默认配置的style
  GRAPHIC: Symbol(), // 图像相关定义
  ...{
    graphic: Map(), // 所有图像数据,Map()对象
    activeGraphic: Object, // 被选中图像对象
    addGraphic: Object // 将被添加进来的图像对象
  },
  VECTOR: Symbol(), // 矢量相关定义
  ...{
    vector: Array, // 所有连接矢量,对象数组
    activeVector: Object, // 被选中的连接矢量
    vectorBegin: Object, // 连接矢量起点图像对象
    vectorEnd: Object // 连接矢量终点图像对象
  },
  POINT: Symbol() // 点相关定义
  ...{
    origin: { x: 0, y: 0 } // 拖动的相对起点
    target: { x: 0, y: 0 } // 拖动的终点
  }
}
```

## 3. 功能设计

### 3.1. 画布状态
##### 3.1.1. 区分模板区域与工作区域 ***draggable : bool***
> - 模板只能点击(选中)无其它操作 ***draggable = false***
> - 工作区有实际操作模式 ***draggable = true***
##### 3.1.2. 界面单个元素拖动 ***draggableElment : bool***
> - 单个拖动 ***draggableElment = true***
> - 非单个拖动 ***draggableElment = false***
##### 3.1.3. 界面整体拖动 ***draggableAll : bool***
> - 整体拖动 ***draggableAll = true***
> - 非整体拖动 ***draggableAll = false***
##### 3.1.4. 在界面上动态拖动矢量连接两个元素 ***waitLink : bool***
> - 画布连接元素状态 ***waitLink = true***
> - 画布非连接状态 ***waitLink = false***

## 4. 功能函数
##### 4.1. 生成guid
``` javascript
guid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    let r = (Math.random() * 16) | 0;
    let v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
```
##### 4.2. 默认事件
``` javascript
EVENT = {
  INIT: Symbol():Void, //绑定所有事件
  CALL_BACK: Symbol():Object, //所有传入的回调事件
  // 窗口事件
  WINDOW: {
    ONKYEDOWN: {
      NAME: 'keydown',
      EVENT: Symbol():Void //键盘事件,默认只接受Del键
    }
  },
  // 画布容器事件
  CANVAS: {
    ONMOUSELEAVE: {
      NAME: 'mouseleave',
      EVENT: Symbol():Void //鼠标离开画布事件
    },
    ONMOUSEWHEEL: {
      NAME: 'mousewheel',
      EVENT: Symbol():Void //鼠标滚轮事件
    },
    ONMOUSEMOVE: {
      NAME: 'mousemove',
      EVENT: Symbol():Void //鼠标移动事件
    },
    ONMOUSEUP: {
      NAME: 'mouseup',
      EVENT: Symbol():Void //鼠标弹起事件
    },
    ONMOUSEDOWN: {
      NAME: 'mousedown',
      EVENT: Symbol():Void //鼠标按下事件
    },
    ONCLICK: {
      NAME: 'click',
      EVENT: Symbol():Void //鼠标单击事件
    },
    ONDBLCLICK: {
      NAME: 'dblclick',
      EVENT: Symbol():Void //鼠标双击事件
    }
  },
  // 图像绘制
  GRAPHIC: {
    DRAW: Symbol():Void, // 绘图函数,重绘
    DRAW_GRID: Symbol():Void, //绘制网格
    DRAW_ACTIVE_GRAPHIC: Symbol():Void, //绘制被选中的图像
    DRAW_ACTIVE_VECTOR: Symbol():Void, //绘制被选中的矢量
    GET_GRAPHIC: Symbol():Void, //根据坐标获取绘制的图像,重叠则获取最上面(最后绘制)的图像
    SET_GRAPHIC: Symbol():Map, //将数据数据转换为Map对像并返回
    GET_VECTOR: Symbol():Void, //根据坐标获取连接矢量
    SET_VECTOR: Symbol():Array,//根据Map对像的图像数据获取连接矢量并返回
    CIRCLE: {
      DRAW: Symbol():Void, //画圆形
      JUDGE: Symbol():Boolean //判断当前位置上是否在圆形上
    },
    RECTANGLE: {
      DRAW: Symbol():Void, //画方形
      JUDGE: Symbol():Boolean //判断当前位置上是否在方形上
    },
    RHOMB: {
      DRAW: Symbol():Void, //画菱形
      JUDGE: Symbol():Boolean //判断当前位置上是否在菱形上
    },
    VECTOR: {
      DRAW: Symbol():Void, //画线
      JUDGE: Symbol():Boolean //判断当前位置上是否在矢量上
    }
  }
}
```
##### 4.3. 图像绘制定义
``` javascript
GRAPHIC_TYPE = {
  TEMP: 'CIRCLE',
  START: 'CIRCLE',
  END: 'CIRCLE',
  TASK: 'RECTANGLE',
  JUDGE: 'RHOMB'
}
```
##### 4.4. 范例数据
``` json
{
    "addData" : {
        "type":"End",
        "style":{
            "x": 0,
            "y": 0,
            "r":30,
            "fillStyle":"#FF00FF"
        }
    },
    "updateData" : {
        "id":"1",
        "name":"start",
        "type":"task",
        "next":"5",
        "style":{
            "x":40,
            "y":50,
            "width":30,
            "height":20,
            "fillStyle":"#A52A2A"
        }

    },
    "templateData" :[
        {
            "type":"start",
            "name": "开始",
            "style":{
                "x":50,
                "y":40,
                "r":20,
                "fillStyle":"#339900"
            }
        },
        {
            "type":"task",
            "name": "任务",
            "style":{
                "x":50,
                "y":100,
                "width":60,
                "height":40,
                "fillStyle":"#CC9900"
            }
        },
        {
            "type":"judge",
            "name": "判断",
            "style":{
                "x":50,
                "y":160,
                "width":60,
                "height":40,
                "fillStyle":"#CC66FF"
            }
        },
        {
            "type":"end",
            "name": "结束",
            "style":{
                "x":50,
                "y":220,
                "r":20,
                "fillStyle":"#6666FF"
            }
        }
    ],
    "frameData":[
        {
            "id":"1",
            "name":"start",
            "type":"start",
            "next":"2",
            "style":{
                "x":80,
                "y":50,
                "r":20,
                "fillStyle":"red"
            }
        },
        {
            "id":"2",
            "name":"task1",
            "type":"task",
            "next":"3",
            "style":{
                "x":200,
                "y":200,
                "width":60,
                "height":40,
                "fillStyle":"purple"
            }
        },
        {
            "id":"3",
            "name":"task2",
            "type":"task",
            "next":"4",
            "style":{
                "x":300,
                "y":60,
                "width":60,
                "height":40,
                "fillStyle":"blue"
            }
        },
        {
            "id":"4",
            "name":"judge1",
            "type":"judge",
            "next":["5","6"],
            "style":{
                "x":500,
                "y":150,
                "width":60,
                "height":40,
                "fillStyle":"green"
            }
        },
        {
            "id":"5",
            "name":"task5",
            "type":"task",
            "next":"6",
            "style":{
                "x":400,
                "y":350,
                "width":60,
                "height":40,
                "fillStyle":"orange"
            }
        },
        {
            "id":"6",
            "name":"task6",
            "type":"task",
            "next":"7",
            "style":{
                "x":650,
                "y":220,
                "width":60,
                "height":40,
                "fillStyle":"black"
            }
        },
        {
            "id":"7",
            "name":"end",
            "type":"end",
            "style":{
                "x":800,
                "y":400,
                "r":20,
                "fillStyle":"yellow"
            }
        }
    ]
}
```