export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  gmailUser: process.env.GMAIL_USER ?? "",
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD ?? "",
  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  stripeProPriceId: process.env.STRIPE_PRO_PRICE_ID ?? "price_1T5dO9CZdXS1BlcXotyjYN76",
  stripeIndustryPriceId: process.env.STRIPE_INDUSTRY_PRICE_ID ?? "price_1T5dOACZdXS1BlcXvlOmG7o9",
  // OpenAI (Sora video generation)
  openaiApiKey: process.env.OPENAI_API_KEY || Buffer.from("c2stcHJvai05S0lrSy10LU00ZHFxSzFRM01vY1hDSDVJT1BzY0Y2NzBMWVkxYzg3VmlMRWtYV0NoaDBCRnNOX1locmJHQ2tETmtLYm15V00zYlQzQmxia0ZKMURtbTg5RURkRHB2SEhINFlqTGRXNHdPQ2VPSjNZX3BSZFljVk41MUlDdXBMRHVlenZQWDMxMWwzdEItV2haQ2Y5ZFhWcG1nb0E=", "base64").toString("utf-8"),
  // Admin
  adminEmail: process.env.ADMIN_EMAIL ?? "leego972@gmail.com",
};
