<template>
  <div class="dashboard-container">
    <div class="sidebar">
      <VerticalMenu :items="menuItems" @menu-item-clicked="handleMenuItemClicked" />
      <LogoutButton />
    </div>
    <div class="main-content">
      <div v-if="selectedContent">
        <component :is="selectedContent.component" v-bind="selectedContent.props" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, markRaw, ref } from 'vue';
import LogoutButton from './LogoutButton.vue';
import VerticalMenu from './VerticalMenu.vue';
import ApiKeysContent from './ApiKeysContent.vue'
import UserProfileContent from './UserProfileContent.vue'
import SubscriptionsContent from './SubscriptionsContent.vue'

interface MenuItem {
  label: string;
  title: string;
  content: {
    component: any;
    props: any;
  };
}

export default defineComponent({
  name: 'Dashboard',
  components: {
    LogoutButton,
    VerticalMenu
  },
  setup() {


    const menuItems: MenuItem[] = [
      {
        label: 'Api Key',
        title: 'Api Key',
        content: {
          component: markRaw(ApiKeysContent),
          props: {
            title: 'Api Key',
            content: 'API key management page! Here, you can easily manage your API keys by listing, generating, and revoking them.'
          }
        }
      },
      {
        label: 'Account',
        title: 'Account',
        content: {
          component: markRaw(UserProfileContent),
          props: {
            title: 'Account',
            content: 'Account page! Here, you can easily manage our account.'
          }
        }
      },
      {
        label: 'Subscription',
        title: 'Subscription',
        content: {
          component: markRaw(SubscriptionsContent),
          props: {
            title: 'Subscription',
            content: 'Manage your subscription.'
          }
        }
      }
    ];

    const selectedContent = ref({
      component: markRaw(ApiKeysContent),
      props: {
        title: 'Api Key',
        content: 'API key management page! Here, you can easily manage your API keys by listing, generating, and revoking them.'
      }
    });



    const handleMenuItemClicked = (menu: MenuItem) => {
      selectedContent.value = {
        component: menu.content.component,
        props: menu.content.props
      };
    };

    return {
      menuItems,
      selectedContent,
      handleMenuItemClicked,
    };
  },
});
</script>

<style lang="scss">
$sidebar-bg-color: #f2f2f2;
$main-content-bg-color: #fff;

.dashboard-container {
  display: grid;
  grid-template-columns: 1fr 3fr;
  /* Sidebar takes up 1/4 of the screen, main content takes up 3/4 */
  grid-template-rows: 100vh;
  /* The component takes up the full height of the viewport */
}

.sidebar {
  background-color: $sidebar-bg-color;
}

.main-content {
  background-color: $main-content-bg-color;
}

@media screen and (max-width: 768px) {
  .dashboard-container {
    grid-template-columns: 1fr;
    /* Only one column when screen width is less than 768px */
  }
}

@media screen and (min-width: 769px) and (max-width: 1024px) {
  .dashboard-container {
    grid-template-columns: 1fr 2fr;
    /* Sidebar takes up 1/3 of the screen, main content takes up 2/3 */
  }
}
</style>