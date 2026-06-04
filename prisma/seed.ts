import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  console.log("Iniciando semeadura do banco de dados...");

  // 1. Limpar tabelas antigas (limpeza controlada)
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productVariation.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  console.log("Banco de dados limpo com sucesso.");

  // 2. Criar Usuário Admin
  const adminEmail = "admin@erp-saas.com";
  const hashedPassword = hashPassword("admin123");

  const user = await prisma.user.create({
    data: {
      name: "João Pedro (Admin)",
      email: adminEmail,
      emailVerified: true,
    },
  });

  await prisma.account.create({
    data: {
      userId: user.id,
      accountId: user.id,
      providerId: "credentials",
      password: hashedPassword,
    },
  });

  console.log(`Usuário criado: ${adminEmail} (Senha: admin123)`);

  // 3. Criar Organização Acme
  const org = await prisma.organization.create({
    data: {
      name: "Acme Indústria & Comércio",
      slug: "acme-industria",
    },
  });

  // Criar Membership do Admin
  await prisma.membership.create({
    data: {
      userId: user.id,
      organizationId: org.id,
      role: "OWNER",
    },
  });

  // Criar Assinatura PRO
  await prisma.subscription.create({
    data: {
      organizationId: org.id,
      planName: "PRO",
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
    },
  });

  console.log(`Organização "${org.name}" criada com plano PRO.`);

  // 4. Criar Clientes (CRM)
  const customersData = [
    { name: "Marcos Vinicius", email: "marcos@tech.com", phone: "(11) 98888-7777", document: "123.456.789-00", status: "LEAD", tags: ["E-commerce", "Lead Novo"] },
    { name: "Ana Beatriz Rocha", email: "ana.rocha@corp.com", phone: "(21) 97777-6666", document: "00.123.456/0001-99", status: "NEGOTIATING", tags: ["Enterprise", "Foco Alto"] },
    { name: "Julia Mendonça", email: "julia@design.co", phone: "(31) 96666-5555", document: "987.654.321-11", status: "ACTIVE", tags: ["Recorrente", "VIP"] },
    { name: "Roberto Santos", email: "roberto@santos.net", phone: "(41) 95555-4444", document: "11.222.333/0001-44", status: "ACTIVE", tags: ["Assinante"] },
    { name: "Clara Antunes", email: "clara@antunes.io", phone: "(51) 94444-3333", document: "456.123.789-99", status: "LEAD", tags: ["Lead Frio"] },
  ];

  const dbCustomers = [];
  for (const c of customersData) {
    const cust = await prisma.customer.create({
      data: {
        organizationId: org.id,
        ...c,
      },
    });
    dbCustomers.push(cust);
  }
  console.log(`${dbCustomers.length} contatos cadastrados no CRM.`);

  // 5. Criar Produtos & Estoque
  const productsData = [
    { name: "iPhone 15 Pro Max 256GB", price: 8999.0, costPrice: 6200.0, category: "Eletrônicos", stock: 12 },
    { name: "MacBook Pro M3 Max 16\"", price: 24999.0, costPrice: 18500.0, category: "Eletrônicos", stock: 3 },
    { name: "Camiseta Minimalista Algodão", price: 129.9, costPrice: 45.0, category: "Vestuário", stock: 45 },
    { name: "Consultoria Mensal TI", price: 3500.0, costPrice: 0.0, category: "Serviços", stock: 999 },
  ];

  for (const p of productsData) {
    const prod = await prisma.product.create({
      data: {
        organizationId: org.id,
        name: p.name,
        sku: `SKU-${p.name.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        price: p.price,
        costPrice: p.costPrice,
        category: p.category,
      },
    });

    const variation = await prisma.productVariation.create({
      data: {
        productId: prod.id,
        name: "Padrão",
        sku: `${prod.sku}-STD`,
        price: p.price,
        stock: p.stock,
      },
    });

    if (p.stock > 0) {
      await prisma.inventory.create({
        data: {
          productVariationId: variation.id,
          quantity: p.stock,
          type: "IN",
          notes: "Saldo inicial de estoque",
        },
      });
    }
  }
  console.log("Produtos e estoque inicial semeados com sucesso.");

  // 6. Criar Movimentações Financeiras (Transações de Receita/Despesa)
  const transactionsData = [
    { type: "INCOME", amount: 15400.0, category: "Vendas", description: "Faturamento de vendas da semana", date: new Date() },
    { type: "EXPENSE", amount: 3500.0, category: "Infraestrutura", description: "Mensalidade do servidor AWS", date: new Date(Date.now() - 86400000) },
    { type: "EXPENSE", amount: 1200.0, category: "Marketing", description: "Campanha Google Ads", date: new Date(Date.now() - 172800000) },
    { type: "INCOME", amount: 4800.0, category: "Vendas", description: "Serviço de consultoria faturado", date: new Date(Date.now() - 259200000) },
    { type: "EXPENSE", amount: 800.0, category: "Salários", description: "Bônus estagiário", date: new Date(Date.now() - 345600000) },
    { type: "INCOME", amount: 9200.0, category: "Vendas", description: "Venda lote computadores usados", date: new Date(Date.now() - 518400000) },
  ];

  for (const t of transactionsData) {
    await prisma.transaction.create({
      data: {
        organizationId: org.id,
        ...t,
      },
    });
  }
  console.log("Histórico de fluxo de caixa semeado.");

  // 7. Adicionar Logs de Auditoria Iniciais
  await prisma.activityLog.create({
    data: {
      organizationId: org.id,
      userId: user.id,
      action: "CADASTRO_ORGANIZACAO",
      entityName: "Organization",
      entityId: org.id,
      details: "Organização Acme criada no setup inicial",
    },
  });

  console.log("Semeadura completa! O sistema está pronto para ser testado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
