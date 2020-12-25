<template>
  <div>
    <p>{{ user }}</p>
    <button @click="increase">click me! one year later</button>
  </div>
</template>

<script>
import { reactive } from 'vue'
export default {
  name: 'reactive',
  setup() {
    let user = reactive({ name: 'Alice', age: 12 })
    function increase() {
      user.name = 'adfadsf'
    }
    return { user, increase }
  }
}
</script>
