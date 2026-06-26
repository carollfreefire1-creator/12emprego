import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORY_DEFS = [
  { name: "Elétrica", icon: "⚡", slug: "eletrica" },
  { name: "Hidráulica", icon: "🚰", slug: "hidraulica" },
  { name: "Pintura", icon: "🎨", slug: "pintura" },
  { name: "Limpeza", icon: "🧹", slug: "limpeza" },
  { name: "Marcenaria", icon: "🪚", slug: "marcenaria" },
  { name: "Jardinagem", icon: "🌿", slug: "jardinagem" },
  { name: "Ar-condicionado", icon: "❄️", slug: "ar-condicionado" },
  { name: "Reformas", icon: "🏗️", slug: "reformas" },
];

const FIRST_NAMES = [
  "Ana", "Bruno", "Carla", "Diego", "Elaine", "Fábio", "Gabriela", "Hugo",
  "Isabela", "João", "Karina", "Lucas", "Mariana", "Nelson", "Olívia",
  "Pedro", "Queila", "Rafael", "Sandra", "Thiago", "Valéria", "Wagner",
];
const LAST_NAMES = [
  "Silva", "Souza", "Oliveira", "Pereira", "Costa", "Rodrigues", "Almeida",
  "Nascimento", "Lima", "Araújo", "Fernandes", "Carvalho", "Gomes", "Martins",
];

function randomName() {
  const f = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const l = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${f} ${l}`;
}

function slugifyEmail(name: string, suffix: string) {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, ".") + `+${suffix}@exemplo.com`
  );
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDateWithinDays(daysAgo: number) {
  const now = Date.now();
  const past = now - randomInt(0, daysAgo) * 24 * 60 * 60 * 1000;
  return new Date(past);
}

const BIOS = [
  "Mais de 10 anos de experiência. Atendimento rápido e garantia de serviço.",
  "Profissional certificado, orçamento sem compromisso e materiais de qualidade.",
  "Atendo toda a região metropolitana. Avaliação 5 estrelas dos meus clientes.",
  "Especialista em pequenos reparos e reformas completas. Pontualidade garantida.",
  "Trabalho com nota fiscal e garantia de 90 dias em todos os serviços.",
];

const REQUEST_TITLES: Record<string, string[]> = {
  eletrica: ["Troca de chuveiro elétrico", "Instalação de ventilador de teto", "Quadro de disjuntores disparando"],
  hidraulica: ["Vazamento no banheiro", "Troca de torneira da cozinha", "Desentupimento de pia"],
  pintura: ["Pintura de sala e quarto", "Pintura de fachada", "Retoque de parede com infiltração"],
  limpeza: ["Limpeza pós-obra", "Limpeza pesada de apartamento", "Higienização de estofados"],
  marcenaria: ["Montagem de guarda-roupa", "Conserto de porta de armário", "Sob medida para escritório"],
  jardinagem: ["Manutenção de jardim mensal", "Poda de árvores", "Instalação de grama sintética"],
  "ar-condicionado": ["Instalação de split 12000 BTUs", "Manutenção preventiva de ar-condicionado", "Limpeza de filtros"],
  reformas: ["Reforma de banheiro completo", "Reforma de cozinha", "Troca de piso da sala"],
};

async function main() {
  console.log("🌱 Iniciando seed de dados fictícios...\n");

  // ── Categorias ────────────────────────────────────────────────
  const categories = await Promise.all(
    CATEGORY_DEFS.map((c, i) =>
      prisma.category.upsert({
        where: { slug: c.slug },
        update: {},
        create: { ...c, orderIndex: i, active: true },
      })
    )
  );
  console.log(`✔ ${categories.length} categorias criadas`);

  // ── Planos ────────────────────────────────────────────────────
  const planDefs = [
    { name: "Básico", priceCents: 0, features: ["5 propostas por mês", "Perfil padrão"] },
    { name: "Profissional", priceCents: 4990, features: ["Propostas ilimitadas", "Selo verificado", "Destaque na busca"] },
    { name: "Premium", priceCents: 9990, features: ["Tudo do Profissional", "Suporte prioritário", "Relatórios avançados"] },
  ];
  const plans = [];
  for (const p of planDefs) {
    const existing = await prisma.plan.findFirst({ where: { name: p.name } });
    plans.push(
      existing ??
        (await prisma.plan.create({
          data: { name: p.name, priceCents: p.priceCents, interval: "month", features: p.features },
        }))
    );
  }
  console.log(`✔ ${plans.length} planos criados`);

  // ── Admin ─────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@sosservicos.com.br" },
    update: {},
    create: { name: "Administrador SOS", email: "admin@sosservicos.com.br", role: "admin" },
  });
  console.log(`✔ Admin: ${admin.email}`);

  // ── Clientes ──────────────────────────────────────────────────
  const clients = [];
  for (let i = 0; i < 25; i++) {
    const name = randomName();
    const email = slugifyEmail(name, `cliente${i}`);
    const client = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name,
        email,
        phone: `(11) 9${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`,
        role: "user",
        consentAcceptedAt: randomDateWithinDays(180),
        marketingOptIn: Math.random() > 0.4,
        createdAt: randomDateWithinDays(180),
      },
    });
    clients.push(client);
  }
  console.log(`✔ ${clients.length} clientes criados`);

  // Indicações entre alguns clientes
  for (let i = 0; i < 8; i++) {
    const referrer = clients[randomInt(0, clients.length - 1)];
    const referred = clients[randomInt(0, clients.length - 1)];
    if (referrer.id === referred.id) continue;
    await prisma.user.update({ where: { id: referred.id }, data: { referredById: referrer.id } }).catch(() => {});
    await prisma.referralReward.upsert({
      where: { referrerId_referredId: { referrerId: referrer.id, referredId: referred.id } },
      update: {},
      create: {
        referrerId: referrer.id,
        referredId: referred.id,
        status: Math.random() > 0.4 ? "rewarded" : "pending",
        rewardCents: 2000,
        rewardedAt: Math.random() > 0.4 ? randomDateWithinDays(60) : null,
      },
    });
  }
  console.log("✔ Indicações de exemplo criadas");

  // ── Profissionais ─────────────────────────────────────────────
  const professionals = [];
  for (let i = 0; i < 18; i++) {
    const name = randomName();
    const email = slugifyEmail(name, `pro${i}`);
    const approvalStatus = i < 14 ? "approved" : i < 16 ? "pending" : "rejected";

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name,
        email,
        phone: `(11) 9${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`,
        role: "professional",
        consentAcceptedAt: randomDateWithinDays(200),
        createdAt: randomDateWithinDays(200),
      },
    });

    const professional = await prisma.professional.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        bio: BIOS[randomInt(0, BIOS.length - 1)],
        document: `${randomInt(100, 999)}.${randomInt(100, 999)}.${randomInt(100, 999)}-${randomInt(10, 99)}`,
        approvalStatus,
        approvedAt: approvalStatus === "approved" ? randomDateWithinDays(150) : null,
        rejectedReason: approvalStatus === "rejected" ? "Documentação incompleta." : null,
        verified: approvalStatus === "approved" && Math.random() > 0.5,
        rating: approvalStatus === "approved" ? Number((3.5 + Math.random() * 1.5).toFixed(2)) : 0,
        completedJobs: approvalStatus === "approved" ? randomInt(2, 80) : 0,
      },
    });

    // vincula 1-2 categorias aleatórias
    const shuffled = [...categories].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, randomInt(1, 2));
    for (const cat of picked) {
      await prisma.professionalCategory.upsert({
        where: { professionalId_categoryId: { professionalId: professional.id, categoryId: cat.id } },
        update: {},
        create: { professionalId: professional.id, categoryId: cat.id },
      });
    }

    // assinatura de plano para metade dos profissionais aprovados
    if (approvalStatus === "approved" && Math.random() > 0.5) {
      const plan = plans[randomInt(1, plans.length - 1)];
      await prisma.subscription.create({
        data: {
          userId: user.id,
          planId: plan.id,
          status: "active",
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    professionals.push({ user, professional, categories: picked });
  }
  console.log(`✔ ${professionals.length} profissionais criados`);

  // ── Cupons ────────────────────────────────────────────────────
  const couponDefs = [
    { code: "BEMVINDO10", type: "percent" as const, value: 10, maxUses: 500, minAmountCents: 0 },
    { code: "SOS20OFF", type: "fixed" as const, value: 2000, maxUses: 200, minAmountCents: 5000 },
    { code: "INDIQUE15", type: "percent" as const, value: 15, maxUses: null, minAmountCents: 0 },
    { code: "FRETEGRATIS", type: "fixed" as const, value: 1000, maxUses: 100, minAmountCents: 3000 },
  ];
  const coupons = [];
  for (const c of couponDefs) {
    const coupon = await prisma.coupon.upsert({
      where: { code: c.code },
      update: {},
      create: {
        ...c,
        active: true,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });
    coupons.push(coupon);
  }
  console.log(`✔ ${coupons.length} cupons criados`);

  // ── Pedidos de serviço, propostas e pagamentos ────────────────
  let requestCount = 0;
  let paymentCount = 0;

  for (let i = 0; i < 40; i++) {
    const client = clients[randomInt(0, clients.length - 1)];
    const category = categories[randomInt(0, categories.length - 1)];
    const titles = REQUEST_TITLES[category.slug] ?? ["Serviço geral"];
    const title = titles[randomInt(0, titles.length - 1)];

    const statusPool = ["open", "proposed", "accepted", "in_progress", "completed", "completed", "cancelled"];
    const status = statusPool[randomInt(0, statusPool.length - 1)] as any;

    const eligiblePros = professionals.filter((p) =>
      p.categories.some((c) => c.id === category.id) && p.professional.approvalStatus === "approved"
    );
    const assignedPro =
      status !== "open" && eligiblePros.length > 0
        ? eligiblePros[randomInt(0, eligiblePros.length - 1)]
        : null;

    const createdAt = randomDateWithinDays(120);

    const request = await prisma.serviceRequest.create({
      data: {
        clientId: client.id,
        categoryId: category.id,
        professionalId: assignedPro?.professional.id,
        title,
        description: `${title} — solicitado via app. Endereço a confirmar com o profissional.`,
        address: "São Paulo, SP",
        status,
        budgetCents: randomInt(80, 800) * 100,
        createdAt,
        updatedAt: createdAt,
      },
    });
    requestCount++;

    // propostas para pedidos não abertos
    if (status !== "open" && eligiblePros.length > 0) {
      const proposalCount = randomInt(1, Math.min(3, eligiblePros.length));
      const proPool = [...eligiblePros].sort(() => Math.random() - 0.5).slice(0, proposalCount);
      for (const [idx, pro] of proPool.entries()) {
        await prisma.proposal.create({
          data: {
            requestId: request.id,
            professionalId: pro.professional.id,
            priceCents: randomInt(80, 900) * 100,
            message: "Posso atender ainda esta semana. Inclui materiais básicos.",
            accepted: idx === 0 && (status === "accepted" || status === "in_progress" || status === "completed"),
            createdAt,
          },
        });
      }
    }

    // pagamento para pedidos concluídos
    if (status === "completed") {
      const amountCents = request.budgetCents ?? randomInt(100, 800) * 100;
      const useCoupon = Math.random() > 0.7;
      const coupon = useCoupon ? coupons[randomInt(0, coupons.length - 1)] : null;
      const discountCents = coupon
        ? coupon.type === "percent"
          ? Math.round((amountCents * coupon.value) / 100)
          : coupon.value
        : 0;

      await prisma.payment.create({
        data: {
          userId: client.id,
          requestId: request.id,
          amountCents,
          discountCents,
          couponId: coupon?.id,
          status: "paid",
          method: Math.random() > 0.5 ? "pix" : "credit_card",
          gatewayId: `gw_${Math.random().toString(36).slice(2, 12)}`,
          createdAt,
        },
      });
      paymentCount++;
    }
  }
  console.log(`✔ ${requestCount} pedidos de serviço criados (com propostas)`);
  console.log(`✔ ${paymentCount} pagamentos criados`);

  // ── Notificações de exemplo ─────────────────────────────────────
  for (const client of clients.slice(0, 5)) {
    await prisma.notification.create({
      data: {
        userId: client.id,
        title: "Bem-vindo ao SOS Serviços!",
        body: "Explore categorias e solicite seu primeiro serviço gratuitamente.",
        url: "/categorias",
        sentAt: randomDateWithinDays(30),
      },
    });
  }
  console.log("✔ Notificações de exemplo criadas");

  // ── Logs administrativos de exemplo ──────────────────────────
  const sampleProfessional = professionals.find((p) => p.professional.approvalStatus === "approved");
  if (sampleProfessional) {
    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "approve_professional",
        targetType: "professional",
        targetId: sampleProfessional.professional.id,
        details: { note: "Documentação verificada e aprovada." },
      },
    });
  }
  console.log("✔ Log administrativo de exemplo criado");

  console.log("\n🌱 Seed concluído com sucesso!");
  console.log(`   Login admin: admin@sosservicos.com.br (crie a senha via Supabase Auth)`);
}

main()
  .catch((err) => {
    console.error("❌ Erro ao executar seed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
