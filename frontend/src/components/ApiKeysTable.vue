<template>
    <div class="api-keys-table">
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>Permissions</th>
            <th>Expiration Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(key, index) in apiKeys" :key="index">
            <td>{{ key.key }}</td>
            <td>{{ key.permissions.read ? 'Read' : '' }}{{ key.permissions.read && key.permissions.write ? ', ' : '' }}{{ key.permissions.write ? 'Write' : '' }}</td>
            <td>{{ new Date(key.expirationDate).toLocaleDateString() }} ({{ Math.ceil((new Date(key.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) }} days remaining)</td>
            <td><button @click="revokeApiKey(key.key)">Revoke</button></td>
        </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, reactive, onMounted, watch, defineEmits } from 'vue';

  interface ApiKeysTableProps {
    reload: boolean;
    }

  interface ApiKey {
    key: string;
    permissions: {
      read: boolean;
      write: boolean;
    };
    expirationDate: string;
  }
  
  export default defineComponent({
    name: 'ApiKeysTable',
    props: {
    reload: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['reloadChanged'],
    setup(props, { emit }) {


  

      const apiKeys = reactive<ApiKey[]>([]);
  
      async function getApiKeys() {
        try {
          const response = await fetch(`${process.env.VUE_APP_BASE_URI}/api/keys`, { credentials: 'include' });
          if (response.ok) { 
          const data = await response.json();
          apiKeys.push(data)
        }
        } catch (error) {
          console.error(error);
        }
      }


  
      async function revokeApiKey(key: string) {
        try {
          const response = await fetch(`${process.env.VUE_APP_BASE_URI}/api/keys/${key}`, { method: 'DELETE', credentials: 'include' });
  
          if (response.ok) {

            // Find the index of the item to be removed
            const index = apiKeys.findIndex(item => item.key === key);

            // Remove the item from the array
            if (index !== -1) {
            apiKeys.splice(index, 1);
            }

            emit('reloadChanged');
        }

          
        } catch (error) {
          console.error(error);
        }
      }

      watch(
      () => props.reload,
      (newValue, oldValue) => {
        if (newValue !== oldValue) {
            getApiKeys();
        }
      }
    );
  
      onMounted(() => {
        getApiKeys();
      });

      
  
      return { apiKeys, revokeApiKey };
    },
    
  });
  </script>
  
  
  <style scoped lang="scss">
  .api-keys-table {
    table {
      border-collapse: collapse;
      width: 100%;
      font-size: 14px;
      margin-top: 20px;
    }
  
    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
  
    th {
      background-color: #4CAF50;
      color: white;
      font-weight: bold;
      text-transform: uppercase;
    }
  
    tr:hover {
      background-color: #f5f5f5;
    }
  
    button {
      background-color: #f44336;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
    }
  
    button:hover {
      background-color: #ff6659;
    }
  }
  </style>