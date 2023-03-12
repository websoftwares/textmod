<template>
    <div>
      <div>
  <h2>TextMod: The AI-Powered SaaS Solution</h2>
  <p>TextMod is an AI-powered solution designed for companies that want to create a safe and welcoming online environment for their users. 
  </p>
  <p>With its advanced algorithms, TextMod can detect and flag harmful sentiments, including spam, hate, terrorism, extremism, pornographic, threatening, self-harm, sexual, sexual/minors, violence, and violence/graphic. 
  </p>
   <p>Its easy integration makes it ideal for any user-generated content platform, such as comments sections, chat rooms, and product reviews. 
    
    <p>TextMod helps companies protect their brand reputation, prevent legal liability, and foster a positive user experience.</p>
  </p>
  <p>Trust TextMod to keep your platform secure and inclusive by eliminating harmful sentiments before they become a problem.</p>
</div> 
    </div>
    <PricingPlanOverview :products="products" />
  </template>


<script lang="ts">
import { defineComponent } from 'vue';
import PricingPlanOverview from './PricingPlanOverview.vue';
import { Product } from '../types';

export default defineComponent({
  components: {
    PricingPlanOverview,
  },
  data() {
    return {
      products: [
        {
          name: 'Personal',
          features: [{ name: 'Non commercial usage only' }],
          prices: [
            {
              price: 0,
              recurring: 'year',
              stripePriceId: ''
            }
          ]
        }, 
        {
          name: 'Standard',
          features: [
            { name: '25k API requests per month' },
            { name: 'Commercial usage' }
          ],
          prices: [
            {
              price: 10,
              recurring: 'month',
              stripePriceId: process.env.VUE_STRIPE_PRICE_ID_STANDARD_MONTH,
            },
            {
              price: 100,
              recurring: 'year',
              stripePriceId: process.env.VUE_STRIPE_PRICE_ID_STANDARD_YEAR,
            }
          ]
        },
        {
          name: 'Enterprise',
          features: [
            { name: '150k API requests per month' },
            { name: 'Commercial usage' }
          ],
          prices: [
            {
              price: 50,
              recurring: 'month',
              stripePriceId: process.env.VUE_STRIPE_PRICE_ID_ENTERPRISE_MONTH,
            },
            {
              price: 500,
              recurring: 'year',
              stripePriceId: process.env.VUE_STRIPE_PRICE_ID_ENTERPRISE_YEAR,
            }
          ]
        },
      ] as Product[],
    };
  },
});
</script>