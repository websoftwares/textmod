<template>
    <div>
      <div class="pricing-plans" v-if="!showForm">
        <div v-for="product in products" :key="product.name" class="pricing-plan">
          <h2>{{ product.name }}</h2>
          <ul>
            <li v-for="feature in product.features" :key="feature.name">{{ feature.name }}</li>
          </ul>
          <div v-for="price in product.prices" :key="price.stripePriceId" class="price">${{ price.price }}/{{ price.recurring }}</div>
          <button class="cta-button" @click="selectPlan(product)">Get {{ product.name }}</button>
        </div>
      </div>
      <ProductSubscriptionForm :products="selectedPlan" v-if="showForm" :on-close="() => showForm = false" :publicKey="publicKey" />
    </div>
  </template>
  
  <script lang="ts">
  import { Product } from '../types';
  import { defineComponent, PropType, ref, watch } from 'vue';
  import ProductSubscriptionForm from './ProductSubscriptionForm.vue';
  
  export default defineComponent({
    name: 'PricingPlanOverview',
    components: {
      ProductSubscriptionForm,
    },
    props: {
      products: {
        type: Array as PropType<Product[]>,
        required: true,
      },
    },
    setup(props) {
      const selectedPlan = ref([props.products[0]]);
      const showForm = ref(false);
      const publicKey = process.env.VUE_STRIPE_PUB_KEY
  
      function selectPlan(product: Product) {
        selectedPlan.value = [product];
        showForm.value = true;
      }
  
      // Watch for changes to the selected plan and update the ref accordingly
      watch(
        () => props.products,
        (newValue) => {
          selectedPlan.value = [newValue[0]];
        },
        { immediate: true }
      );
  
      return {
        selectedPlan,
        showForm,
        publicKey,
        selectPlan,
      };
    },
  });
  </script>
  

<style scoped lang="scss">
.pricing-plans {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 1rem;
}

.pricing-plan {
  background-color: white;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  text-align: center;

  h2 {
    font-family: 'Roboto', sans-serif;
    font-size: 1.5rem;
    color: #007bff;
    margin-bottom: 1rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin-bottom: 1rem;

    li {
      font-family: 'Roboto', sans-serif;
      font-size: 1rem;
      color: #6c757d;
      padding: 0.25rem 0;

      &:not(:last-child) {
        border-bottom: 1px solid #6c757d;
      }
    }
  }

  .price {
    font-family: 'Roboto', sans-serif;
    font-size: 2rem;
    color: #007bff;
    margin-bottom: 1rem;
  }

  .cta-button {
    font-family: 'Roboto', sans-serif;
    font-size: 1rem;
    color: white;
    background-color: #007bff;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;

    &:hover {
      background-color: darken(#007bff, 10%);
    }
  }
}
</style>
