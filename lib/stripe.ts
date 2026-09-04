import Stripe from 'stripe';

// Constructing Stripe with an empty/missing key throws immediately, and this
// module gets imported (and evaluated) at build time regardless of whether a
// Stripe route is ever called - so `stripe` must stay null instead of
// crashing the build when STRIPE_SECRET_KEY isn't set (billing is unused
// scaffolding for now).
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16' as any,
      typescript: true,
    })
  : null;
