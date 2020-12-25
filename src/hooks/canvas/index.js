const DEFAULT_CONFIG = {
  canvasId: 'canvas',
  canvasMode: '2d',
  frame: {
    width: 400,
    height: 300,
    showGrid: false,
    gridSpace: 20,
    scaleX: 1,
    scaleY: 1,
    translateX: 0,
    translateY: 0,
    draggable: false
  },
  style: {
    textBaseline: 'hanging',
    textAlign: 'center',
    fillStyle: '#DCDCDC',
    strokeStyle: '#F5F5F5',
    lineWidth: 1
  }
}
const GRAPHIC_TYPE = {
  TEMP: 'CIRCLE',
  START: 'CIRCLE',
  END: 'CIRCLE',
  TASK: 'RECTANGLE',
  JUDGE: 'RHOMB'
}
const EVENT = {
  CALL_BACK: Symbol(), // 所有传入的回调事件
  INIT: Symbol(), // 绑定所有事件
  WINDOW: {
    ONKYEDOWN: {
      NAME: 'keydown',
      EVENT: Symbol()
    }
  },
  CANVAS: {
    ONMOUSEWHEEL: {
      NAME: 'mousewheel',
      EVENT: Symbol()
    },
    ONMOUSEMOVE: {
      NAME: 'mousemove',
      EVENT: Symbol()
    },
    ONMOUSEUP: {
      NAME: 'mouseup',
      EVENT: Symbol()
    },
    ONMOUSEDOWN: {
      NAME: 'mousedown',
      EVENT: Symbol()
    },
    ONCLICK: {
      NAME: 'click',
      EVENT: Symbol()
    },
    ONDBLCLICK: {
      NAME: 'dblclick',
      EVENT: Symbol()
    }
  },
  GRAPHIC: {
    DRAW: Symbol(),
    DRAW_GRID: Symbol(),
    DRAW_ACTIVE_GRAPHIC: Symbol(),
    DRAW_ACTIVE_VECTOR: Symbol(),
    GET_GRAPHIC: Symbol(),
    SET_GRAPHIC: Symbol(),
    GET_VECTOR: Symbol(),
    SET_VECTOR: Symbol(),
    CIRCLE: {
      DRAW: Symbol(),
      JUDGE: Symbol()
    },
    RECTANGLE: {
      DRAW: Symbol(),
      JUDGE: Symbol()
    },
    RHOMB: {
      DRAW: Symbol(),
      JUDGE: Symbol()
    },
    LINE: {
      DRAW: Symbol(),
      JUDGE: Symbol()
    }
  }
}
const CANVAS = {
  CANVAS: Symbol(),
  CONTEXT: Symbol(),
  FRAME: Symbol(),
  STYLE: Symbol(),
  GRAPHIC: Symbol(),
  VECTOR: Symbol(),
  POINT: Symbol()
}

const guid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = (Math.random() * 16) | 0
    let v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export class Canvas {
  constructor(canvasElement, config = DEFAULT_CONFIG, canvasEvent = {}, data) {
    this[EVENT.CALL_BACK] = { ...canvasEvent } // 回调事件
    this[CANVAS.GRAPHIC] = {
      graphic: new Map(), // 所有图像数据,Map()对象
      activeGraphic: null, // 被选中图像对象
      addGraphic: null // 将被添加进来的图像对象
    }
    this[CANVAS.VECTOR] = {
      vector: [], // 所有连接矢量,对象数组
      activeVector: null, // 被选中的连接矢量
      VectorBegin: null, // 连接矢量起点图像对象
      VectorEnd: null // 连接矢量终点图像对象
    }
    this[CANVAS.POINT] = {
      origin: { x: 0, y: 0 } // 拖动的相对起点
    }
    this[CANVAS.STYLE] = null // 画布样式
    this[CANVAS.FRAME] = null // 画布尺寸,缩放及拖动状态等
    this[CANVAS.CANVAS] =
      canvasElement ||
      document.getElementById({ ...DEFAULT_CONFIG, ...config }.canvasId)
    this[CANVAS.CONTEXT] = this[CANVAS.CANVAS].getContext(
      { ...DEFAULT_CONFIG, ...config }.canvasMode
    )
    this.setData(data)
    this.init(config || DEFAULT_CONFIG)
  }

  init(config) {
    if (this[CANVAS.CONTEXT]) {
      if (config) {
        this[CANVAS.FRAME] = {
          ...DEFAULT_CONFIG.frame,
          ...(config && config.frame),
          scaled: { x: 1, y: 1 }, // 整个过程被缩放的结果
          waitLink: false,
          draggableAll: false,
          draggableElement: false,
          width: this[CANVAS.CANVAS].width,
          height: this[CANVAS.CANVAS].height
        }
        this[CANVAS.STYLE] = {
          ...DEFAULT_CONFIG.style,
          ...(config && config.style)
        }
        this[EVENT.INIT]()
      }
      this[CANVAS.CONTEXT] = Object.assign(
        this[CANVAS.CONTEXT],
        this[CANVAS.STYLE]
      )
      this[CANVAS.CONTEXT].scale(
        this[CANVAS.FRAME].scaleX,
        this[CANVAS.FRAME].scaleY
      )
      this[CANVAS.CONTEXT].clearRect(
        0,
        0,
        this[CANVAS.FRAME].width,
        this[CANVAS.FRAME].height
      )
      this[CANVAS.CONTEXT].fillRect(
        0,
        0,
        this[CANVAS.FRAME].width,
        this[CANVAS.FRAME].height
      )
      this[EVENT.GRAPHIC.DRAW_GRID](this[CANVAS.CONTEXT], this[CANVAS.FRAME])
      this[EVENT.GRAPHIC.DRAW]()
    }
  }

  scale(dx = 1, dy = 1) {
    this[CANVAS.FRAME].scaleX = dx
    this[CANVAS.FRAME].scaleY = dy
    this[CANVAS.FRAME].scaled.x *= dx
    this[CANVAS.FRAME].scaled.y *= dy
    this[CANVAS.FRAME].width =
      this[CANVAS.CANVAS].width / this[CANVAS.FRAME].scaled.x
    this[CANVAS.FRAME].height =
      this[CANVAS.CANVAS].height / this[CANVAS.FRAME].scaled.y
    this.init()
  }

  draw() {
    this.scale()
  }

  getData() {
    return [...this[CANVAS.GRAPHIC].graphic.values()]
  }

  setData(data) {
    if (data) {
      this[CANVAS.GRAPHIC].graphic = this[EVENT.GRAPHIC.SET_GRAPHIC](data)
      this[CANVAS.VECTOR].vector = this[EVENT.GRAPHIC.SET_VECTOR](
        this[CANVAS.GRAPHIC].graphic
      )
    }
  }

  addData(data) {
    this[CANVAS.GRAPHIC].addGraphic = data
  }

  deleteData(data) {
    this[CANVAS.GRAPHIC].graphic.delete(data.id)
    this.draw()
  }

  updateData(data) {
    this[CANVAS.GRAPHIC].graphic.set(data.id, data)
    this.draw()
  }

  [EVENT.INIT]() {
    for (let item in this[EVENT.CALL_BACK]) {
      this[CANVAS.CANVAS][item.toLowerCase()] = event => {
        event.preventDefault()
        event.stopPropagation()
        this[EVENT.CALL_BACK][item] &&
          this[EVENT.CALL_BACK][item](
            event,
            this[EVENT.GRAPHIC.GET_GRAPHIC](this[CANVAS.GRAPHIC].graphic, event)
          )
      }
    }
    if (this[CANVAS.FRAME].draggable) {
      for (let event in EVENT.WINDOW) {
        window.addEventListener(
          EVENT.WINDOW[event].NAME,
          this[EVENT.WINDOW[event].EVENT]
        )
      }
      for (let event in EVENT.CANVAS) {
        this[CANVAS.CANVAS].addEventListener(
          EVENT.CANVAS[event].NAME,
          this[EVENT.CANVAS[event].EVENT]
        )
      }
    } else {
      for (let event in EVENT.WINDOW) {
        window.removeEventListener(
          EVENT.WINDOW[event].NAME,
          this[EVENT.WINDOW[event].EVENT]
        )
      }
      for (let event in EVENT.CANVAS) {
        this[CANVAS.CANVAS].removeEventListener(
          EVENT.CANVAS[event].NAME,
          this[EVENT.CANVAS[event].EVENT]
        )
      }
    }
  }

  [EVENT.WINDOW.ONKYEDOWN.EVENT] = event => {
    event.preventDefault()
    event.stopPropagation()
    if (46 === event.keyCode) {
      if (this[CANVAS.VECTOR].activeVector) {
        const graphic = this[CANVAS.GRAPHIC].graphic.get(
          this[CANVAS.VECTOR].activeVector.begin
        )
        if (graphic.next instanceof Array) {
          graphic.next = graphic.next.filter(
            item => item !== this[CANVAS.VECTOR].activeVector.end
          )
          if (graphic.next.length <= 1) {
            graphic.next = graphic.next[0]
          }
        } else {
          graphic.next = null
        }
        this[CANVAS.VECTOR].activeVector = null
        this[CANVAS.VECTOR].vector = this[EVENT.GRAPHIC.SET_VECTOR](
          this[CANVAS.GRAPHIC].graphic
        )
        this.draw()
      }
      if (this[CANVAS.GRAPHIC].activeGraphic) {
        this[CANVAS.GRAPHIC].graphic.delete(
          this[CANVAS.GRAPHIC].activeGraphic.id
        )
        this[CANVAS.GRAPHIC].activeGraphic = null
        this[CANVAS.VECTOR].vector = this[EVENT.GRAPHIC.SET_VECTOR](
          this[CANVAS.GRAPHIC].graphic
        )
        this.draw()
      }
    }
  };

  [EVENT.CANVAS.ONMOUSEWHEEL.EVENT] = event => {
    event.preventDefault()
    event.stopPropagation()
    this.scale(1 - event.deltaY / 1000, 1 - event.deltaY / 1000)
  };

  [EVENT.CANVAS.ONMOUSEMOVE.EVENT] = event => {
    event.preventDefault()
    event.stopPropagation()
    this[CANVAS.VECTOR].activeVector = null
    const newPosition = { x: event.offsetX, y: event.offsetY }
    const dx = newPosition.x - this[CANVAS.POINT].origin.x
    const dy = newPosition.y - this[CANVAS.POINT].origin.y
    if (this[CANVAS.FRAME].draggableElement) {
      this[CANVAS.GRAPHIC].activeGraphic.style.x += dx
      this[CANVAS.GRAPHIC].activeGraphic.style.y += dy
      this[CANVAS.VECTOR].vector = this[EVENT.GRAPHIC.SET_VECTOR](
        this[CANVAS.GRAPHIC].graphic
      )
      this.draw()
    } else if (this[CANVAS.FRAME].draggableAll) {
      for (let item of this[CANVAS.GRAPHIC].graphic.values()) {
        item.style.x += dx
        item.style.y += dy
      }
      this[CANVAS.VECTOR].vector = this[EVENT.GRAPHIC.SET_VECTOR](
        this[CANVAS.GRAPHIC].graphic
      )
      this.draw()
    }
    this[CANVAS.POINT].origin = newPosition
  };

  [EVENT.CANVAS.ONMOUSEDOWN.EVENT] = event => {
    event.preventDefault()
    event.stopPropagation()
    this[CANVAS.POINT].origin = { x: event.offsetX, y: event.offsetY }
    if (this[CANVAS.GRAPHIC].addGraphic) {
      this[CANVAS.GRAPHIC].activeGraphic = {
        id: guid(),
        ...this[CANVAS.GRAPHIC].addGraphic,
        style: {
          ...this[CANVAS.GRAPHIC].addGraphic.style,
          ...this[CANVAS.POINT].origin
        }
      }
      this[CANVAS.GRAPHIC].graphic.set(
        this[CANVAS.GRAPHIC].activeGraphic.id,
        this[CANVAS.GRAPHIC].activeGraphic
      )
      this[CANVAS.FRAME].draggableElement = true
      this[CANVAS.FRAME].draggableAll = false
      this[CANVAS.GRAPHIC].addGraphic = null
      this.draw()
    } else {
      this[CANVAS.GRAPHIC].activeGraphic = this[EVENT.GRAPHIC.GET_GRAPHIC](
        this[CANVAS.GRAPHIC].graphic,
        event
      )
      if (this[CANVAS.GRAPHIC].activeGraphic) {
        this[CANVAS.FRAME].draggableElement = true
      } else {
        this[CANVAS.FRAME].draggableElement = false
        this[CANVAS.VECTOR].activeVector = this[EVENT.GRAPHIC.GET_VECTOR](
          this[CANVAS.VECTOR].vector,
          event
        )
        this[CANVAS.FRAME].draggableAll = !this[CANVAS.FRAME].draggableElement
      }
      if (
        this[CANVAS.VECTOR].activeVector ||
        this[CANVAS.GRAPHIC].activeGraphic
      ) {
        this.draw()
      }
    }
  };

  [EVENT.CANVAS.ONMOUSEUP.EVENT] = event => {
    event.preventDefault()
    event.stopPropagation()
    this[CANVAS.FRAME].draggableAll = false
    this[CANVAS.FRAME].draggableElement = false
  };

  [EVENT.CANVAS.ONCLICK.EVENT] = event => {
    if (this[CANVAS.FRAME].waitLink) {
      this[CANVAS.FRAME].waitLink = false
      this[CANVAS.GRAPHIC].activeGraphic = null
      this[CANVAS.GRAPHIC].graphic.delete(this[CANVAS.VECTOR].VectorEnd.id)
      const stoppedGraphic = this[EVENT.GRAPHIC.GET_GRAPHIC](
        this[CANVAS.GRAPHIC].graphic,
        event
      )
      if (stoppedGraphic) {
        if (this[CANVAS.VECTOR].VectorBegin.next) {
          this[CANVAS.VECTOR].VectorBegin.next =
            this[CANVAS.VECTOR].VectorBegin.next instanceof Array
              ? [...this[CANVAS.VECTOR].VectorBegin.next, stoppedGraphic.id]
              : [this[CANVAS.VECTOR].VectorBegin.next, stoppedGraphic.id]
        } else {
          this[CANVAS.VECTOR].VectorBegin.next = stoppedGraphic.id
        }
      } else {
        this[CANVAS.VECTOR].activeVector = null
      }
      this[CANVAS.VECTOR].vector = this[EVENT.GRAPHIC.SET_VECTOR](
        this[CANVAS.GRAPHIC].graphic
      )
      this.draw()
    }
  };

  [EVENT.CANVAS.ONDBLCLICK.EVENT] = event => {
    this[CANVAS.VECTOR].VectorBegin = this[EVENT.GRAPHIC.GET_GRAPHIC](
      this[CANVAS.GRAPHIC].graphic,
      event
    )
    if (this[CANVAS.VECTOR].VectorBegin) {
      this[CANVAS.GRAPHIC].activeGraphic = {
        id: guid(),
        type: 'TEMP',
        style: { x: event.offsetX, y: event.offsetY }
      }
      this[CANVAS.GRAPHIC].graphic.set(
        this[CANVAS.GRAPHIC].activeGraphic.id,
        this[CANVAS.GRAPHIC].activeGraphic
      )
      this[CANVAS.VECTOR].VectorEnd = this[CANVAS.GRAPHIC].activeGraphic
      this[CANVAS.VECTOR].VectorBegin.next =
        this[CANVAS.VECTOR].VectorBegin.next instanceof Array
          ? [
              ...this[CANVAS.VECTOR].VectorBegin.next,
              this[CANVAS.GRAPHIC].activeGraphic.id
            ]
          : [
              this[CANVAS.VECTOR].VectorBegin.next,
              this[CANVAS.GRAPHIC].activeGraphic.id
            ]
      this[CANVAS.FRAME].waitLink = true
      this[CANVAS.FRAME].draggableAll = false
      this[CANVAS.FRAME].draggableElement = true
    }
  };

  [EVENT.GRAPHIC.DRAW]() {
    this[CANVAS.VECTOR].vector.map(item => {
      this[EVENT.GRAPHIC.LINE.DRAW](this[CANVAS.CONTEXT], item)
    })
    if (this[CANVAS.VECTOR].activeVector) {
      this[EVENT.GRAPHIC.DRAW_ACTIVE_VECTOR](
        this[CANVAS.CONTEXT],
        this[CANVAS.VECTOR].activeVector
      )
      this[EVENT.GRAPHIC.LINE.DRAW](this[CANVAS.CONTEXT], {
        ...this[CANVAS.VECTOR].activeVector,
        fillStyle: '#FFF'
      })
    }
    for (let item of this[CANVAS.GRAPHIC].graphic.values()) {
      item.type &&
        this[EVENT.GRAPHIC[GRAPHIC_TYPE[item.type.toUpperCase()]].DRAW](
          this[CANVAS.CONTEXT],
          item.style
        )
      if (item.name) {
        let { height, x, y, r } = item.style
        r = r || height / 2
        this[CANVAS.CONTEXT].fillText(item.name, x, y + r)
      }
    }
    if (this[CANVAS.GRAPHIC].activeGraphic) {
      this[EVENT.GRAPHIC.DRAW_ACTIVE_GRAPHIC](
        this[CANVAS.CONTEXT],
        this[CANVAS.GRAPHIC].activeGraphic.style
      )
      this[CANVAS.GRAPHIC].activeGraphic.type &&
        this[
          EVENT.GRAPHIC[
            GRAPHIC_TYPE[this[CANVAS.GRAPHIC].activeGraphic.type.toUpperCase()]
          ].DRAW
        ](this[CANVAS.CONTEXT], {
          ...this[CANVAS.GRAPHIC].activeGraphic.style,
          strokeStyle: '#FFF'
        })
    }
  }

  [EVENT.GRAPHIC.DRAW_GRID](
    ctx,
    { showGrid: flag, x = 0, y = 0, width = 0, height = 0, space = 20 } = {}
  ) {
    if (ctx && flag) {
      ctx.beginPath()
      for (let dx = x; dx < x + width; dx += space) {
        ctx.moveTo(dx, y)
        ctx.lineTo(dx, y + height)
      }
      for (let dy = y; dy < y + height; dy += space) {
        ctx.moveTo(x, dy)
        ctx.lineTo(x + width, dy)
      }
      ctx.stroke()
    }
  }

  [EVENT.GRAPHIC.GET_GRAPHIC](graphic, event) {
    for (let item of graphic.values()) {
      let { x, y, r, width, height } = item.style
      x *= this[CANVAS.FRAME].scaled.x
      y *= this[CANVAS.FRAME].scaled.y
      r *= this[CANVAS.FRAME].scaled.x
      width *= this[CANVAS.FRAME].scaled.x
      height *= this[CANVAS.FRAME].scaled.y
      if (
        item.type &&
        this[EVENT.GRAPHIC[GRAPHIC_TYPE[item.type.toUpperCase()]].JUDGE](
          { x, y, r, width, height },
          event
        )
      ) {
        return item
      }
    }
  }

  [EVENT.GRAPHIC.SET_GRAPHIC](data) {
    if (data) {
      let graphic = new Map()
      data.map(item => {
        graphic.set(item.id || item.type, item)
      })
      return graphic
    }
  }

  [EVENT.GRAPHIC.GET_VECTOR](vector, event, offset = 10) {
    let { offsetX: x, offsetY: y } = event
    x /= this[CANVAS.FRAME].scaled.x
    y /= this[CANVAS.FRAME].scaled.y
    for (let item of vector) {
      if (this[EVENT.GRAPHIC.LINE.JUDGE](item, { x, y, offset })) {
        return item
      }
    }
  }

  [EVENT.GRAPHIC.SET_VECTOR](graphic) {
    if (graphic) {
      let vector = []
      for (let item of graphic.values()) {
        if (item.next) {
          const { x: x0, y: y0 } = item.style
          const nextArray = item.next instanceof Array ? item.next : [item.next]
          for (let next of nextArray) {
            if (graphic.get(next)) {
              const { x: x1, y: y1 } = graphic.get(next).style
              vector = [
                ...vector,
                { x0, y0, x1, y1, begin: item.id, end: next }
              ]
            }
          }
        }
      }
      return vector
    }
  }

  [EVENT.GRAPHIC.DRAW_ACTIVE_GRAPHIC](
    ctx,
    { width, height, x, y, r = 0, activeStyle = '#FFF' } = {}
  ) {
    width = width || 2 * r
    height = height || 2 * r
    r = 3
    ctx.fillStyle = activeStyle
    ctx.strokeStyle = activeStyle
    ctx.beginPath()
    ctx.arc(x, y - height / 2, r, 0, 2 * Math.PI)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(x - width / 2, y, r, 0, 2 * Math.PI)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(x, y + height / 2, r, 0, 2 * Math.PI)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(x + width / 2, y, r, 0, 2 * Math.PI)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }

  [EVENT.GRAPHIC.DRAW_ACTIVE_VECTOR](
    ctx,
    { x1, y0, r = 3, activeStyle = '#FFF' } = {}
  ) {
    ctx.fillStyle = activeStyle
    ctx.strokeStyle = activeStyle
    ctx.beginPath()
    ctx.arc(x1, y0, r, 0, 2 * Math.PI)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }

  [EVENT.GRAPHIC.LINE.DRAW](
    ctx,
    {
      x0,
      y0,
      x1,
      y1,
      lineWidth = 3,
      pelWidth = 20,
      fillStyle = 'red',
      strokeStyle
    } = {}
  ) {
    ctx.lineWidth = lineWidth
    ctx.fillStyle = fillStyle
    ctx.strokeStyle = strokeStyle || fillStyle
    const lineLength = Math.abs(x1 - x0) + Math.abs(y1 - y0)
    let head = null
    let tail1 = null
    let tail2 = null
    if (Math.abs(x1 - x0) >= Math.abs(y1 - y0)) {
      head = {
        x: x0 + (x1 >= x0 ? lineLength / 2 : -lineLength / 2),
        y: y0
      }
      tail1 = {
        x:
          x0 +
          (x1 >= x0 ? lineLength / 2 - pelWidth : -lineLength / 2 + pelWidth),
        y: y0 - pelWidth / 3
      }
      tail2 = {
        x:
          x0 +
          (x1 >= x0 ? lineLength / 2 - pelWidth : -lineLength / 2 + pelWidth),
        y: y0 + pelWidth / 3
      }
    } else {
      head = {
        x: x1,
        y:
          y1 -
          (y1 >= y0 ? lineLength / 2 - pelWidth : -lineLength / 2 + pelWidth)
      }
      tail1 = {
        x: x1 - pelWidth / 3,
        y: y1 - (y1 >= y0 ? lineLength / 2 : -lineLength / 2)
      }
      tail2 = {
        x: x1 + pelWidth / 3,
        y: y1 - (y1 >= y0 ? lineLength / 2 : -lineLength / 2)
      }
    }
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    ctx.lineTo(x1, y0)
    ctx.lineTo(x1, y1)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(head.x, head.y)
    ctx.lineTo(tail1.x, tail1.y)
    ctx.lineTo(tail2.x, tail2.y)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }

  [EVENT.GRAPHIC.CIRCLE.DRAW](
    ctx,
    { width = 0, height = 0, r, x, y, fillStyle, strokeStyle, lineWidth } = {}
  ) {
    if (ctx) {
      r = r || width / 2 || height / 2
      ctx.beginPath()
      ctx.lineWidth = lineWidth
      ctx.fillStyle = fillStyle
      ctx.strokeStyle = strokeStyle || fillStyle
      ctx.arc(x, y, r, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
    }
  }

  [EVENT.GRAPHIC.RECTANGLE.DRAW](
    ctx,
    { width, height, r = 0, x, y, fillStyle, strokeStyle, lineWidth } = {}
  ) {
    if (ctx) {
      width = width || 2 * r
      height = height || 2 * r
      ctx.beginPath()
      ctx.lineWidth = lineWidth
      ctx.fillStyle = fillStyle
      ctx.strokeStyle = strokeStyle || fillStyle
      ctx.rect(x - width / 2, y - height / 2, width, height)
      ctx.fill()
      ctx.stroke()
    }
  }

  [EVENT.GRAPHIC.RHOMB.DRAW](
    ctx,
    { width, height, r = 0, x, y, fillStyle, strokeStyle, lineWidth } = {}
  ) {
    if (ctx) {
      width = width || 2 * r
      height = height || 2 * r
      ctx.beginPath()
      ctx.lineWidth = lineWidth
      ctx.fillStyle = fillStyle
      ctx.strokeStyle = strokeStyle || fillStyle
      ctx.moveTo(x - width / 2, y)
      ctx.lineTo(x, y - height / 2)
      ctx.lineTo(x + width / 2, y)
      ctx.lineTo(x, y + height / 2)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }
  }

  [EVENT.GRAPHIC.LINE.JUDGE](
    { x0, y0, x1, y1 } = {},
    { x, y, offset = 10 } = {}
  ) {
    return (
      (Math.abs(x - x1) <= offset && (y - y0) * (y - y1) <= 0) ||
      (Math.abs(y - y0) <= offset && (x - x0) * (x - x1) <= 0)
    )
  }

  [EVENT.GRAPHIC.CIRCLE.JUDGE](
    { x, y, r, width = 0, height = 0 } = {},
    { offsetX: x1, offsetY: y1 } = {}
  ) {
    r = r || width / 2 || height / 2
    return Math.pow(x1 - x, 2) + Math.pow(y1 - y, 2) <= Math.pow(r, 2)
  }

  [EVENT.GRAPHIC.RECTANGLE.JUDGE](
    { x, y, width, height, r = 0 } = {},
    { offsetX: x1, offsetY: y1 } = {}
  ) {
    width = width || 2 * r
    height = height || 2 * r
    return (
      x1 >= x - width / 2 &&
      x1 <= x + width / 2 &&
      y1 >= y - height / 2 &&
      y1 <= y + height / 2
    )
  }

  [EVENT.GRAPHIC.RHOMB.JUDGE](
    { x, y, width, height, r = 0 } = {},
    { offsetX: x1, offsetY: y1 } = {}
  ) {
    width = width || 2 * r
    height = height || 2 * r
    return (
      x1 >= x - width / 2 &&
      x1 <= x + width / 2 &&
      y1 >= y - height / 2 &&
      y1 <= y + height / 2
    )
  }
}
