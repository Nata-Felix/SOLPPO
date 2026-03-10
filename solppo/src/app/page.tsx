import {
  FileText,
  Users,
  Package,
  TrendingUp,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { getDashboardStats } from "@/lib/db/actions";
import { ExportReportButton } from "@/components/ExportReportButton";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

const statusLabels: Record<string, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    {
      label: "Clientes",
      value: stats.totalClientes,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      href: "/clientes",
    },
    {
      label: "Produtos & Serviços",
      value: stats.totalItens,
      icon: Package,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      href: "/itens",
    },
    {
      label: "Orçamentos",
      value: stats.totalOrcamentos,
      icon: FileText,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      href: "/orcamentos",
    },
    {
      label: "Aprovados",
      value: stats.totalAprovados,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      href: "/orcamentos",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Resumo geral do sistema de orçamentos
          </p>
        </div>
        <ExportReportButton />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <div className="card-premium p-5 group cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {card.label}
                  </p>
                  <p className="text-3xl font-bold mt-1 text-foreground">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center`}
                >
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-premium p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Total em Orçamentos</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(stats.valorTotal)}
              </p>
            </div>
          </div>
        </div>
        <div className="card-premium p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Aprovado</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(stats.valorAprovado)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orçamentos */}
      <div className="card-premium p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Últimos Orçamentos
          </h2>
          <Link
            href="/orcamentos"
            className="text-sm text-primary hover:underline"
          >
            Ver todos →
          </Link>
        </div>

        {stats.recentOrcamentos.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">
            Nenhum orçamento criado ainda.{" "}
            <Link
              href="/orcamentos/novo"
              className="text-primary hover:underline"
            >
              Crie o primeiro!
            </Link>
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                    #
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                    Cliente
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                    Valor
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrcamentos.map((orc) => (
                  <tr
                    key={orc.id}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-2 font-mono text-muted-foreground">
                      #{orc.id.toString().padStart(4, "0")}
                    </td>
                    <td className="py-3 px-2 text-foreground">
                      {orc.cliente_nome || "—"}
                    </td>
                    <td className="py-3 px-2 font-medium text-foreground">
                      {formatCurrency(orc.valor_total)}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium badge-${orc.status}`}
                      >
                        {statusLabels[orc.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
