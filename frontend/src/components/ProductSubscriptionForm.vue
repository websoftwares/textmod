<template>
    <div>
        <h1>{{ products[0].name }} Plan</h1>
        <ul>
            <li v-for="feature in products[0].features" :key="feature.name">{{ feature.name }}</li>
        </ul>
        <form @submit.prevent="submitCheckout">
            <label>
                Choose the subscription price:
                <select v-model="selectedPrice">
                    <option v-for="price in products[0].prices" :value="price.stripePriceId">
                        <span v-if="price.recurring === 'month'">${{ price.price }}/month</span>
                        <span v-if="price.recurring === 'year'">${{ price.price }}/year</span>
                    </option>
                </select>
            </label>
            <label>
                Email:
                <input type="email" name="email" v-model="email" />
            </label>
            <label>
                Cardholder Name:
                <input type="text" name="name" v-model="name" />
            </label>
            <label>
                Card Number:
                <div id="card-element" ref="cardElement" />
            </label>
            <label>
                Expiration Date:
                <div id="card-expiry" ref="cardExpiry" />
            </label>
            <label>
                CVC:
                <div id="card-cvc" ref="cardCvc" />
            </label>
            <button type="submit">{{ callToAction }}</button>
            <button class="close-button" @click="closeForm">Cancel</button>
        </form>
    </div>
</template>
  
<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { loadStripe, Stripe, StripeCardNumberElement, StripeElement, StripeElements } from '@stripe/stripe-js';
import { Product } from '../types';

export default defineComponent({
    name: 'ProductSubscriptionForm',
    props: {
        publicKey: {
            type: String as PropType<string>,
            required: true,
        },
        products: {
            type: Array as PropType<Product[]>,
            default: () => [],
        },
        callToAction: {
            type: String as PropType<string>,
            default: 'Subscribe Now',
        },
        onClose: {
            type: Function as PropType<() => void>,
            required: true,
        },
    },
    setup(props) {
        function closeForm() {
            props.onClose?.();
        }

        return {
            closeForm,
        };
    },
    data() {
        return {
            selectedPrice: '',
            name: '',
            email: '',
            address: '',
            stripe: null as Stripe | null,
            elements: null as StripeElements | null,
            cardElement: null as StripeCardNumberElement | null
        };
    },
    async mounted() {
        this.stripe = await loadStripe(this.publicKey);

        if (this.stripe) {
            this.elements = this.stripe.elements();

            if (this.stripe) {

                const cardElement = this.elements.create('cardNumber') as StripeCardNumberElement;

                const cardExpiry = this.elements.create('cardExpiry') as StripeElement;
                const cardCvc = this.elements.create('cardCvc') as StripeElement;;

                cardElement.mount('#card-element')
                cardExpiry.mount('#card-expiry');
                cardCvc.mount('#card-cvc');
            }
        }
    },
    methods: {
        async submitCheckout() {
            const cardElement = this.elements?.getElement('cardNumber');

            const result = await this.stripe?.createPaymentMethod({
                type: 'card',
                card: cardElement!,
                billing_details: {
                    name: this.name,
                    email: this.email,
                    address: {
                        line1: this.address,
                    },
                },
            });

            const paymentMethod = result?.paymentMethod ?? null;

            const selectedPrice = this.products
                .flatMap((p) => p.prices)
                .find((p) => p.stripePriceId === this.selectedPrice)!;

            const response = await fetch(`${process.env.VUE_APP_BASE_URI}/api/subscriptions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paymentMethodId: paymentMethod?.id,
                    priceId: selectedPrice.stripePriceId,
                    email: this.email,
                    username: this.name
                }),
            });

            const { success, message } = await response.json();
            if (success) {
                alert('Thank you for subscribing!');
            } else {
                alert(`Error: ${message}`);
            }
        },
    },
});
</script>
  
  
<style lang="scss">
// Style the h1
h1 {
    font-size: 2rem;
    margin: 2rem 0;
}

// Style the ul
ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
}

// Style the li
li {
    font-size: 1.2rem;
    margin: 1rem 0;
}

// Style the form
form {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 2rem 0;
}

// Style the labels
label {
    display: flex;
    flex-direction: column;
    margin: 1rem 0;
    width: 100%;
}

// Style the inputs
input {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
    font-size: 1rem;
    width: 100%;
    margin: 0.5rem 0;
}

// Style the select
select {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
    font-size: 1rem;
    width: 100%;
    margin: 0.5rem 0;
}

// Style the submit button
button[type="submit"] {
    background-color: #28a745;
    color: #fff;
    border: none;
    border-radius: 0.25rem;
    font-size: 1.2rem;
    padding: 0.5rem 1rem;
    margin: 1rem 0;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
}

button[type="submit"]:hover {
    background-color: #218838;
}

// Style the cancel button
.close-button {
    background-color: #dc3545;
    color: #fff;
    border: none;
    border-radius: 0.25rem;
    font-size: 1.2rem;
    padding: 0.5rem 1rem;
    margin: 1rem 0;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
}

.close-button:hover {
    background-color: #c82333;
}

// Style the stripe form elements
#card-element,
#card-expiry,
#card-cvc {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
    font-size: 1rem;
    width: 100%;
    margin: 0.5rem 0;
}

// Set media queries for responsive design
@media (min-width: 768px) {
    form {
        width: 50%;
    }
}

@media (min-width: 992px) {
    form {
        width: 30%;
    }
}

@media (min-width: 1200px) {
    form {
        width: 20%;
    }
}
</style>
