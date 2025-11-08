<script setup>
const props = defineProps({

  tabContentClass: String,
})


const addClass = props.tabContentClass
</script>

<template>
  <div class="example">
    <CTabContent :class="['rounded-bottom', addClass]">
      <CTabPane class="p-3 preview" visible>
        <slot></slot>
      </CTabPane>
    </CTabContent>
  </div>
</template>
