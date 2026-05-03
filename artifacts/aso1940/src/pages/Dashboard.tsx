import { Link } from "wouter";
import {
  useGetDashboardStats,
  useGetAssociationsByType,
  useGetAssociationsByStatus,
  useGetMonthlyRegistrations,
  useGetTenureExpiring,
} from "@workspace/api-client-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Building2, Users, AlertTriangle, TrendingUp, Ban, Activity } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { ASSOCIATION_TYPES, ASSOCIATION_STATUSES } from "@/lib/constants";

const CHART_COLORS = ["#2563eb", "#16a34a", "#d97706", "#9333ea", "#dc2626", "#0891b2", "#ea580c", "#84cc16"];

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | undefined; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-3xl font-bold text-foreground">
        {value !== undefined ? value.toLocaleString("ar-DZ") : "—"}
      </div>
    </div>
  );
}

export function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: byType } = useGetAssociationsByType();
  const { data: byStatus } = useGetAssociationsByStatus();
  const { data: monthly } = useGetMonthlyRegistrations();
  const { data: expiring } = useGetTenureExpiring();

  const typeData = (byType ?? []).map((d) => ({
    name: ASSOCIATION_TYPES[d.label] ?? d.label,
    value: d.count,
  }));

  const statusData = (byStatus ?? []).map((d) => ({
    name: ASSOCIATION_STATUSES[d.label] ?? d.label,
    value: d.count,
  }));

  const monthlyData = (monthly ?? []).map((d) => ({
    month: d.month,
    عدد: d.count,
  }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
        <p className="text-muted-foreground text-sm mt-1">نظرة عامة على الجمعيات المدنية</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="إجمالي الجمعيات" value={stats?.totalAssociations} icon={Building2} color="bg-blue-100 text-blue-700" />
        <StatCard label="الجمعيات النشطة" value={stats?.activeAssociations} icon={Activity} color="bg-green-100 text-green-700" />
        <StatCard label="إجمالي الأعضاء" value={stats?.totalMembers} icon={Users} color="bg-purple-100 text-purple-700" />
        <StatCard label="عهدات تنتهي قريباً" value={stats?.tenureExpiringCount} icon={AlertTriangle} color="bg-amber-100 text-amber-700" />
        <StatCard label="جديدة هذا الشهر" value={stats?.newThisMonth} icon={TrendingUp} color="bg-cyan-100 text-cyan-700" />
        <StatCard label="موقوفة أو محلولة" value={(stats?.suspendedCount ?? 0) + (stats?.dissolutionCount ?? 0)} icon={Ban} color="bg-red-100 text-red-700" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly registrations */}
        <div className="lg:col-span-2 bg-card border border-card-border rounded-xl p-5 shadow-sm">
          <h2 className="text-base font-semibold text-foreground mb-4">التسجيلات الشهرية (آخر 12 شهر)</h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="عدد" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
              لا توجد بيانات بعد
            </div>
          )}
        </div>

        {/* By status */}
        <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm">
          <h2 className="text-base font-semibold text-foreground mb-4">توزيع الحالات</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
              لا توجد بيانات بعد
            </div>
          )}
        </div>
      </div>

      {/* By type + tenure expiring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By type */}
        <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm">
          <h2 className="text-base font-semibold text-foreground mb-4">الجمعيات حسب النوع</h2>
          {typeData.length > 0 ? (
            <div className="space-y-2">
              {typeData.slice(0, 8).map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-sm text-foreground flex-1">{d.name}</span>
                  <span className="text-sm font-semibold text-foreground">{d.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">لا توجد بيانات بعد</div>
          )}
        </div>

        {/* Tenure expiring */}
        <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">عهدات تنتهي خلال 30 يوم</h2>
            <Link href="/associations" className="text-xs text-primary hover:underline">عرض الكل</Link>
          </div>
          {(expiring ?? []).length === 0 ? (
            <div className="text-muted-foreground text-sm py-4 text-center">
              لا توجد عهدات منتهية قريباً
            </div>
          ) : (
            <div className="space-y-3">
              {(expiring ?? []).slice(0, 6).map((assoc) => (
                <Link key={assoc.id} href={`/associations/${assoc.id}`} className="flex items-center justify-between hover:bg-accent rounded-lg p-2 -mx-2 transition-colors">
                  <div>
                    <div className="text-sm font-medium text-foreground">{assoc.name}</div>
                    <div className="text-xs text-muted-foreground">{assoc.wilaya}</div>
                  </div>
                  <div className="text-left">
                    <StatusBadge status={assoc.status} />
                    <div className="text-xs text-amber-600 mt-1">{assoc.tenureEndDate}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
