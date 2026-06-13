export const PLANS = {
  INICIANTE: {
    name: "FREE",
    title: "Plano Iniciante",
    price: 49.0,
    features: [
      "Até 50 clientes ativos",
      "Até 50 produtos em estoque",
      "Fluxo de caixa básico"
    ],
    limits: {
      customers: 50,
      products: 50
    }
  },
  PRO: {
    name: "PRO",
    title: "Plano Avançado (Pro)",
    price: 149.0,
    features: [
      "Clientes e Leads ilimitados",
      "Estoque e variações ilimitados",
      "AI Financial Insights inclusos",
      "Integração Stripe checkout"
    ],
    limits: {
      customers: Infinity,
      products: Infinity
    }
  },
  ENTERPRISE: {
    name: "ENTERPRISE",
    title: "Corporativo",
    price: 499.0,
    features: [
      "Tudo do plano Pro",
      "Multi-empresa (até 5 tenants)",
      "Audit logs e logs de segurança",
      "Suporte dedicado 24/7",
      "Contrato e SLA personalizados"
    ],
    limits: {
      customers: Infinity,
      products: Infinity
    }
  }
};
