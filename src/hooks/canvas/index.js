const DEFAULT_CONFIG = {
  canvasId: 'canvas',
  canvasMode: '2d',
  frame: {
    width: 400,
    height: 300,
    showGrid: false,
    gridSpace: 20,
    waitLink: false,
    draggable: false,
    draggableAll: false,
    draggableElement: false,
    scale: { x: 1, y: 1 },
    scaled: { x: 1, y: 1 },
    translate: { x: 0, y: 0 },
    translated: { x: 0, y: 0 }
  },
  style: {
    font: '12px Arial',
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
  INIT: Symbol(),
  CALL_BACK: Symbol(),
  WINDOW: {
    ONKYEDOWN: {
      NAME: 'keydown',
      EVENT: Symbol()
    }
  },
  CANVAS: {
    ONMOUSELEAVE: {
      NAME: 'mouseleave',
      EVENT: Symbol()
    },
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
    VECTOR: {
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
  constructor(canvasElement, config, data, canvasEvent = {}) {
    const defaultConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG))
    const parData = JSON.parse(JSON.stringify(data))
    let parConfig = JSON.parse(JSON.stringify(config))
    parConfig = {
      ...defaultConfig,
      ...config,
      frame: { ...defaultConfig.frame, ...(parConfig && parConfig.frame) },
      style: { ...defaultConfig.style, ...(parConfig && parConfig.style) }
    }
    this[EVENT.CALL_BACK] = { ...canvasEvent }
    this[CANVAS.GRAPHIC] = {
      graphic: new Map(),
      activeGraphic: null,
      addGraphic: null
    }
    this[CANVAS.VECTOR] = {
      vector: [],
      activeVector: null,
      vectorBegin: null,
      vectorEnd: null
    }
    this[CANVAS.POINT] = {
      origin: { x: 0, y: 0 }
    }
    this[CANVAS.STYLE] = null
    this[CANVAS.FRAME] = null
    this[CANVAS.CANVAS] =
      canvasElement || document.getElementById(parConfig.canvasId)
    this[CANVAS.CONTEXT] = this[CANVAS.CANVAS].getContext(parConfig.canvasMode)
    this.setData(parData)
    this.init(parConfig)
  }

  init(config) {
    if (this[CANVAS.CONTEXT]) {
      if (config) {
        this[CANVAS.FRAME] = {
          ...config.frame,
          width: this[CANVAS.CANVAS].width,
          height: this[CANVAS.CANVAS].height
        }
        this[CANVAS.STYLE] = config.style
        this[EVENT.INIT]()
      }
      this[CANVAS.CONTEXT] = Object.assign(
        this[CANVAS.CONTEXT],
        this[CANVAS.STYLE]
      )
      this[CANVAS.CONTEXT].scale(
        this[CANVAS.FRAME].scale.x,
        this[CANVAS.FRAME].scale.y
      )
      this[CANVAS.CONTEXT].fillRect(
        0,
        0,
        this[CANVAS.FRAME].width,
        this[CANVAS.FRAME].height
      )
      this[EVENT.GRAPHIC.DRAW]()
    }
  }

  scale(dx = 1, dy = 1) {
    this[CANVAS.FRAME].scale.x = dx
    this[CANVAS.FRAME].scale.y = dy
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
      this[EVENT.GRAPHIC.SET_GRAPHIC](data)
      this[EVENT.GRAPHIC.SET_VECTOR]()
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
            this[EVENT.GRAPHIC.GET_GRAPHIC](event)
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
        this[EVENT.GRAPHIC.SET_VECTOR]()
        this.draw()
      }
      if (this[CANVAS.GRAPHIC].activeGraphic) {
        this[CANVAS.GRAPHIC].graphic.delete(
          this[CANVAS.GRAPHIC].activeGraphic.id
        )
        this[CANVAS.GRAPHIC].activeGraphic = null
        this[EVENT.GRAPHIC.SET_VECTOR]()
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
      this[CANVAS.GRAPHIC].activeGraphic.style.x +=
        dx / this[CANVAS.FRAME].scaled.x
      this[CANVAS.GRAPHIC].activeGraphic.style.y +=
        dy / this[CANVAS.FRAME].scaled.y
      this.draw()
    } else if (this[CANVAS.FRAME].draggableAll) {
      for (let item of this[CANVAS.GRAPHIC].graphic.values()) {
        item.style.x += dx / this[CANVAS.FRAME].scaled.x
        item.style.y += dy / this[CANVAS.FRAME].scaled.y
      }
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
          x: event.offsetX / this[CANVAS.FRAME].scaled.x,
          y: event.offsetY / this[CANVAS.FRAME].scaled.y
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
        event
      )
      if (this[CANVAS.GRAPHIC].activeGraphic) {
        this[CANVAS.FRAME].draggableElement = true
      } else {
        this[CANVAS.FRAME].draggableElement = false
        this[CANVAS.VECTOR].activeVector = this[EVENT.GRAPHIC.GET_VECTOR](event)
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

  [EVENT.CANVAS.ONMOUSELEAVE.EVENT] = event => {
    event.preventDefault()
    event.stopPropagation()
    this[CANVAS.FRAME].draggableAll = false
    this[CANVAS.FRAME].draggableElement = false
  };

  [EVENT.CANVAS.ONCLICK.EVENT] = event => {
    if (this[CANVAS.FRAME].waitLink) {
      this[CANVAS.FRAME].waitLink = false
      this[CANVAS.GRAPHIC].activeGraphic = null
      this[CANVAS.GRAPHIC].graphic.delete(this[CANVAS.VECTOR].vectorEnd.id)
      const stoppedGraphic = this[EVENT.GRAPHIC.GET_GRAPHIC](event)
      if (stoppedGraphic && this[CANVAS.VECTOR].vectorBegin) {
        if (this[CANVAS.VECTOR].vectorBegin.next) {
          this[CANVAS.VECTOR].vectorBegin.next =
            this[CANVAS.VECTOR].vectorBegin.next instanceof Array
              ? [...this[CANVAS.VECTOR].vectorBegin.next, stoppedGraphic.id]
              : [this[CANVAS.VECTOR].vectorBegin.next, stoppedGraphic.id]
        } else {
          this[CANVAS.VECTOR].vectorBegin.next = stoppedGraphic.id
        }
      } else {
        this[CANVAS.VECTOR].activeVector = null
      }
      this[EVENT.GRAPHIC.SET_VECTOR]()
      this.draw()
    }
  };

  [EVENT.CANVAS.ONDBLCLICK.EVENT] = event => {
    this[CANVAS.VECTOR].vectorBegin = this[EVENT.GRAPHIC.GET_GRAPHIC](event)
    if (this[CANVAS.VECTOR].vectorBegin) {
      this[CANVAS.GRAPHIC].activeGraphic = {
        id: guid(),
        type: 'TEMP',
        style: {
          x: event.offsetX / this[CANVAS.FRAME].scaled.x,
          y: event.offsetY / this[CANVAS.FRAME].scaled.y
        }
      }
      this[CANVAS.GRAPHIC].graphic.set(
        this[CANVAS.GRAPHIC].activeGraphic.id,
        this[CANVAS.GRAPHIC].activeGraphic
      )
      this[CANVAS.VECTOR].vectorEnd = this[CANVAS.GRAPHIC].activeGraphic
      this[CANVAS.VECTOR].vectorBegin.next =
        this[CANVAS.VECTOR].vectorBegin.next instanceof Array
          ? [
              ...this[CANVAS.VECTOR].vectorBegin.next,
              this[CANVAS.GRAPHIC].activeGraphic.id
            ]
          : [
              this[CANVAS.VECTOR].vectorBegin.next,
              this[CANVAS.GRAPHIC].activeGraphic.id
            ]
      this[EVENT.GRAPHIC.SET_VECTOR]()
      this[CANVAS.FRAME].waitLink = true
      this[CANVAS.FRAME].draggableAll = false
      this[CANVAS.FRAME].draggableElement = true
    }
  };

  [EVENT.GRAPHIC.DRAW]() {
    this[EVENT.GRAPHIC.DRAW_GRID](this[CANVAS.CONTEXT], this[CANVAS.FRAME])
    this[CANVAS.VECTOR].vector.map(item => {
      this[EVENT.GRAPHIC.VECTOR.DRAW](this[CANVAS.CONTEXT], {
        x0: item.begin.style.x,
        y0: item.begin.style.y,
        x1: item.end.style.x,
        y1: item.end.style.y,
        condition: item.condition,
        beginStyle: item.begin.style.fillStyle,
        endStyle: item.end.style.fillStyle
      })
    })
    if (this[CANVAS.VECTOR].activeVector) {
      this[EVENT.GRAPHIC.DRAW_ACTIVE_VECTOR](this[CANVAS.CONTEXT], {
        x: this[CANVAS.VECTOR].activeVector.end.style.x,
        y: this[CANVAS.VECTOR].activeVector.begin.style.y,
        r: 3,
        style: '#FFF'
      })
      this[EVENT.GRAPHIC.VECTOR.DRAW](this[CANVAS.CONTEXT], {
        x0: this[CANVAS.VECTOR].activeVector.begin.style.x,
        y0: this[CANVAS.VECTOR].activeVector.begin.style.y,
        x1: this[CANVAS.VECTOR].activeVector.end.style.x,
        y1: this[CANVAS.VECTOR].activeVector.end.style.y,
        condition: this[CANVAS.VECTOR].activeVector.condition,
        fillStyle: '#FFF',
        strokeStyle: '#FFF'
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

  [EVENT.GRAPHIC.GET_GRAPHIC](event) {
    const { offsetX: x1, offsetY: y1 } = event
    for (let item of this[CANVAS.GRAPHIC].graphic.values()) {
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
          { x1, y1 }
        )
      ) {
        return item
      }
    }
  }

  [EVENT.GRAPHIC.SET_GRAPHIC](data) {
    this[CANVAS.GRAPHIC].graphic.clear()
    if (data) {
      data.map(item => {
        this[CANVAS.GRAPHIC].graphic.set(item.id || item.type, item)
      })
    }
  }

  [EVENT.GRAPHIC.GET_VECTOR](event, offset = 10) {
    let { offsetX: x, offsetY: y } = event
    x /= this[CANVAS.FRAME].scaled.x
    y /= this[CANVAS.FRAME].scaled.y
    for (let item of this[CANVAS.VECTOR].vector) {
      if (
        this[EVENT.GRAPHIC.VECTOR.JUDGE](
          {
            x0: item.begin.style.x,
            y0: item.begin.style.y,
            x1: item.end.style.x,
            y1: item.end.style.y
          },
          { x, y, offset }
        )
      ) {
        return item
      }
    }
  }

  [EVENT.GRAPHIC.SET_VECTOR]() {
    this[CANVAS.VECTOR].vector = []
    if (this[CANVAS.GRAPHIC].graphic) {
      for (let begin of this[CANVAS.GRAPHIC].graphic.values()) {
        if (begin.next) {
          const nextArray =
            begin.next instanceof Array ? begin.next : [begin.next]
          for (let next of nextArray) {
            next = next instanceof Object ? next : { id: next }
            if (this[CANVAS.GRAPHIC].graphic.get(next.id)) {
              const end = this[CANVAS.GRAPHIC].graphic.get(next.id)
              this[CANVAS.VECTOR].vector = [
                ...this[CANVAS.VECTOR].vector,
                { begin, end, condition: next.condition }
              ]
            }
          }
        }
      }
    }
  }

  [EVENT.GRAPHIC.DRAW_ACTIVE_GRAPHIC](
    ctx,
    { width, height, x, y, r = 0, style = '#FFF' } = {}
  ) {
    width = width || 2 * r
    height = height || 2 * r
    r = 3
    ctx.fillStyle = style
    ctx.strokeStyle = style
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
    { x, y, r = 3, style = '#FFF' } = {}
  ) {
    ctx.fillStyle = style
    ctx.strokeStyle = style
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
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

  [EVENT.GRAPHIC.VECTOR.DRAW](
    ctx,
    {
      x0,
      y0,
      x1,
      y1,
      condition,
      beginStyle = 'red',
      endStyle = 'red',
      lineWidth = 3,
      pelWidth = 20,
      fillStyle,
      strokeStyle
    } = {}
  ) {
    const style = ctx.createLinearGradient(x0, y0, x1, y1)
    style.addColorStop(0, beginStyle)
    style.addColorStop(1, endStyle)
    ctx.fillStyle = fillStyle || style
    ctx.strokeStyle = strokeStyle || style
    ctx.lineWidth = lineWidth
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
    if (condition) {
      ctx.fillText(condition, head.x - pelWidth / 2, head.y + pelWidth / 2)
    }
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

  [EVENT.GRAPHIC.VECTOR.JUDGE](
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
    { x1, y1 } = {}
  ) {
    r = r || width / 2 || height / 2
    return Math.pow(x1 - x, 2) + Math.pow(y1 - y, 2) <= Math.pow(r, 2)
  }

  [EVENT.GRAPHIC.RECTANGLE.JUDGE](
    { x, y, width, height, r = 0 } = {},
    { x1, y1 } = {}
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
    { x1, y1 } = {}
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
