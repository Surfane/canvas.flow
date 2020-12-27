<template>
  <h1>This is an about page</h1>
  <div class="about">
    <canvas
      ref="templateCanvas"
      :width="template.width"
      :height="template.height"
      class="left"
    ></canvas>
    <canvas
      ref="frameCanvas"
      :width="frame.width"
      :height="frame.height"
      class="right"
    ></canvas>
  </div>
  <div v-for="(value, key) in data" :key="key">{{ key }}:{{ value }}</div>
</template>

<script lang="ts">
import { Canvas } from '../hooks/canvas'
import { defineComponent, onMounted, ref, toRefs, reactive } from 'vue'

import { templateData, frameData } from '../hooks/canvas/graphicData.json'

export default defineComponent({
  name: 'About',
  setup() {
    const templateCanvas = ref(null)
    const template = reactive({ width: 100, height: 500 })
    const frameCanvas = ref(null)
    const frame = reactive({ width: 1400, height: 500 })
    let canvasTemplate = null
    let canvasFrame = null
    let addGraphic = null
    let editGraphic = reactive({ data: {} })

    const editGraphicSubmit = () => {
      canvasFrame.updateData(editGraphic)
    }

    const templateEvent = {
      onClick: (event, data) => {
        addGraphic = data
      }
    }

    const frameEvent = {
      onMouseDown: () => {
        if (addGraphic) {
          canvasFrame.addData({ ...addGraphic })
          addGraphic = null
        }
      },
      onContextMenu: (event, data) => {
        if (data) {
          editGraphic = { data }
          alert('弹出修改数据界面' + JSON.stringify(data))
        }
      }
    }

    onMounted(() => {
      // 直接绘图
      canvasTemplate = new Canvas(
        templateCanvas.value,
        null,
        templateData,
        templateEvent
      )
      // 先初始化后绘图
      canvasFrame = new Canvas(
        frameCanvas.value,
        { frame: { showGrid: true, draggable: true } },
        null,
        frameEvent
      )
      canvasFrame.setData(frameData)
      canvasFrame.draw()
    })

    return {
      templateCanvas,
      template,
      frameCanvas,
      frame,
      ...toRefs(editGraphic),
      editGraphicSubmit,
      canvasTemplate,
      canvasFrame,
      templateData
    }
  }
})
</script>

<style>
.about {
  width: 100%;
  height: 500px;
  display: flex;
  /* flex-flow: row wrap; */
  border: 2px solid black;
}
.left {
  flex: 0 0 100px;
  border-right: 5px solid black;
}
.edit {
  width: 250px;
  height: 100px;
  background-color: chocolate;
  width: 100%;
}
</style>
