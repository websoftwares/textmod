<template>
    <div class="vertical-menu">
      <ul>
        <li v-for="(item, index) in items" :key="index" :class="{ active: activeIndex === index }" @click="handleClick(index)">
          {{ item.label }}
        </li>
      </ul>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  
  interface MenuItem {
    label: string;
    content: any;
  }
  
  export default defineComponent({
    name: 'VerticalMenu',
    props: {
      items: {
        type: Array as () => MenuItem[],
        required: true,
        default: () => [],
      },
    },
    data() {
      return {
        activeIndex: 0,
      };
    },
    methods: {
      handleClick(index: number) {
        this.activeIndex = index;
        this.$emit('menu-item-clicked', this.items[index]);
      },
    },
  });
  </script>
  
  <style lang="scss" scoped>
  .vertical-menu {
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
  
    li {
      cursor: pointer;
      padding: 10px;
      transition: background-color 0.3s ease-in-out;
  
      &:hover {
        background-color: #f0f0f0;
      }
  
      &.active {
        background-color: #eee;
      }
    }
  }
  </style>
  