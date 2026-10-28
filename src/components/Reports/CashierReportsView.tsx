import React from 'react';
import { useFoodTruck } from '../../context/FoodTruckContext';
import { DollarSign, ShoppingCart, Clock, TrendingUp, CreditCard, QrCode, Banknote, Download, RotateCcw, Printer } from 'lucide-react';

export const CashierReportsView: React.FC = () => {
  const { dailySummary, orders, resetDemoData } = useFoodTruck();

  const handleExportCSV = () => {
    const validOrders = orders.filter(o => o.status !== 'cancelled');
    const headers = ['ID', 'Senha', 'Cliente', 'Data', 'Tipo', 'Pagamento', 'Total (R$)', 'Status'];
    const rows = validOrders.map(o => [
      o.id,
      `#${o.orderNumber}`,
      `"${o.customerName}"`,
      new Date(o.createdAt).toLocaleTimeString('pt-BR'),
      o.orderType === 'dine_in' ? 'Local' : 'Viagem',
      o.paymentMethod.toUpperCase(),
      o.total.toFixed(2),
      o.status.toUpperCase(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fechamento_rattan_paes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintClosure = () => {
    window.print();
  };

  const totalRev = dailySummary.totalRevenue;

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white">Fechamento de Caixa & Métricas do Dia</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Resumo consolidado das vendas, tempos de preparo da cozinha e conciliação por forma de pagamento.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handlePrintClosure}
            className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Fechamento</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Deseja resetar os pedidos e produtos para a demonstração original?')) {
                resetDemoData();
              }
            }}
            title="Resetar para pedidos iniciais da demonstração"
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Faturamento */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Faturamento Bruto
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black font-mono text-emerald-400 tabular-nums">
              R$ {dailySummary.totalRevenue.toFixed(2).replace('.', ',')}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">Hoje no Food Truck</p>
          </div>
        </div>

        {/* KPI 2: Total Pedidos */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total de Pedidos
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black font-mono text-white tabular-nums">
              {dailySummary.ordersCount}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">Comandas registradas</p>
          </div>
        </div>

        {/* KPI 3: Ticket Médio */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ticket Médio
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black font-mono text-white tabular-nums">
              R$ {dailySummary.averageTicket.toFixed(2).replace('.', ',')}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">Gasto médio por cliente</p>
          </div>
        </div>

        {/* KPI 4: Tempo Médio KDS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tempo Médio Preparo
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black font-mono text-orange-400 tabular-nums">
              ~{dailySummary.avgPrepMinutes} min
            </span>
            <p className="text-[11px] text-slate-500 mt-1">Da chapa ao cliente</p>
          </div>
        </div>

      </div>

      {/* Middle Row: Payment Methods & Top Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Payment Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">
              Divisão por Forma de Pagamento
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Valores conciliados recebidos no balcão e no app.
            </p>

            <div className="space-y-4">
              {/* PIX */}
              {(() => {
                const pix = dailySummary.byPaymentMethod.pix;
                const pct = totalRev > 0 ? (pix.total / totalRev) * 100 : 0;
                return (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-semibold text-slate-200">
                        <QrCode className="w-4 h-4 text-emerald-400" />
                        <span>PIX ({pix.count} pedidos)</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400 tabular-nums">
                        R$ {pix.total.toFixed(2).replace('.', ',')} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })()}

              {/* Crédito */}
              {(() => {
                const cred = dailySummary.byPaymentMethod.credit;
                const pct = totalRev > 0 ? (cred.total / totalRev) * 100 : 0;
                return (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-semibold text-slate-200">
                        <CreditCard className="w-4 h-4 text-sky-400" />
                        <span>Cartão de Crédito ({cred.count} pedidos)</span>
                      </div>
                      <span className="font-mono font-bold text-sky-400 tabular-nums">
                        R$ {cred.total.toFixed(2).replace('.', ',')} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div className="h-full bg-sky-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })()}

              {/* Débito */}
              {(() => {
                const deb = dailySummary.byPaymentMethod.debit;
                const pct = totalRev > 0 ? (deb.total / totalRev) * 100 : 0;
                return (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-semibold text-slate-200">
                        <CreditCard className="w-4 h-4 text-indigo-400" />
                        <span>Cartão de Débito ({deb.count} pedidos)</span>
                      </div>
                      <span className="font-mono font-bold text-indigo-400 tabular-nums">
                        R$ {deb.total.toFixed(2).replace('.', ',')} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })()}

              {/* Dinheiro */}
              {(() => {
                const cash = dailySummary.byPaymentMethod.cash;
                const pct = totalRev > 0 ? (cash.total / totalRev) * 100 : 0;
                return (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-semibold text-slate-200">
                        <Banknote className="w-4 h-4 text-amber-400" />
                        <span>Dinheiro em Espécie ({cash.count} pedidos)</span>
                      </div>
                      <span className="font-mono font-bold text-amber-400 tabular-nums">
                        R$ {cash.total.toFixed(2).replace('.', ',')} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Top 5 Best Sellers (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-base font-bold text-white mb-1">
            Top Itens Mais Vendidos
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Lanches e produtos de maior saída no dia.
          </p>

          <div className="space-y-3">
            {dailySummary.topItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-amber-400/10 text-amber-400 font-mono font-bold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-white line-clamp-1">{item.name}</h5>
                    <span className="text-[11px] text-slate-400">
                      {item.quantity} unidades vendidas
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-amber-400 tabular-nums">
                  R$ {item.revenue.toFixed(2).replace('.', ',')}
                </span>
              </div>
            ))}

            {dailySummary.topItems.length === 0 && (
              <p className="text-xs text-slate-500 py-6 text-center">Nenhum item vendido ainda hoje.</p>
            )}
          </div>
        </div>

      </div>

      {/* Audit Log of Orders */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-sm font-bold text-white">Livro de Caixa & Auditoria de Pedidos</h4>
          <span className="text-xs text-slate-400 font-mono">{orders.length} registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/50 border-b border-slate-800 text-slate-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Senha</th>
                <th className="py-3 px-4">Horário</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Itens</th>
                <th className="py-3 px-4">Pagamento</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    #{order.orderNumber}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-4 text-slate-200">
                    {order.customerName}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {order.items.reduce((sum, i) => sum + i.quantity, 0)} item(s)
                  </td>
                  <td className="py-3 px-4 uppercase font-mono text-xs text-slate-300">
                    {order.paymentMethod}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-400 tabular-nums">
                    R$ {order.total.toFixed(2).replace('.', ',')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] font-semibold text-slate-300 capitalize">
                      {order.status === 'queued' && 'Na Fila'}
                      {order.status === 'preparing' && 'Na Chapa'}
                      {order.status === 'ready' && 'Pronto'}
                      {order.status === 'delivered' && 'Entregue'}
                      {order.status === 'cancelled' && 'Cancelado'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
