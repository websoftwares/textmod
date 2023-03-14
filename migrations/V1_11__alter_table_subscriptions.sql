-- Add a new unique index on user_id, stripe_customer_id, and stripe_subscription_id columns
ALTER TABLE subscriptions ADD UNIQUE INDEX user_stripe_subscription (user_id, stripe_customer_id, stripe_subscription_id);
