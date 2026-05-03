import { useState } from "react";
import { Link } from "wouter";
import { useListAssociations, useDeleteAssociation } from "@workspace/api-client-react";
import { Plus, Search, Eye, Edit, Trash2, ChevronRight, ChevronLeft } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { ASSOCIATION_TYPES, WILAYAS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { getListAssociationsQueryKey } from "@workspace/api-client-react";

export function AssociationsList() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [wilaya, setWilaya] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  const queryClient = useQueryClient();

  const params = {
    page,
    limit,
    ...(search ? { search } : {}),
    ...(type && type !== "all" ? { type } : {}),
    ...(wilaya && wilaya !== "all" ? { wilaya } : {}),
  };

  const { data, isLoading } = useListAssociations(params);
  const deleteMutation = useDeleteAssociation();

  const associations = data?.associations ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  function handleDelete(id: number) {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAssociationsQueryKey(params) });
      },
    });
  }

  function resetFilters() {
    setSearch("");
    setType("all");
    setWilaya("all");
    setPage(1);
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">الجمعيات</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {total > 0 ? `${total.toLocaleString("ar-DZ")} جمعية مسجلة` : "لا توجد جمعيات بعد"}
          </p>
        </div>
        <Link href="/associations/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            إضافة جمعية
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-card border border-card-border rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="بحث بالاسم..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pr-9"
            />
          </div>
          <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="النوع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأنواع</SelectItem>
              {Object.entries(ASSOCIATION_TYPES).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={wilaya} onValueChange={(v) => { setWilaya(v); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="الولاية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الولايات</SelectItem>
              {WILAYAS.map((w) => (
                <SelectItem key={w} value={w}>{w}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {(search || type !== "all" || wilaya !== "all") && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={resetFilters}
              className="text-xs text-primary hover:underline"
            >
              مسح الفلاتر
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">جارٍ التحميل...</div>
        ) : associations.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-muted-foreground text-sm">لا توجد جمعيات مطابقة للبحث</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">الاسم</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">النوع</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">الولاية</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">الحالة</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">الأعضاء</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden xl:table-cell">تاريخ التأسيس</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {associations.map((assoc) => (
                  <tr key={assoc.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{assoc.name}</div>
                      {assoc.registrationNumber && (
                        <div className="text-xs text-muted-foreground">{assoc.registrationNumber}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {ASSOCIATION_TYPES[assoc.type] ?? assoc.type}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{assoc.wilaya}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={assoc.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {(assoc.memberCount ?? 0).toLocaleString("ar-DZ")}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden xl:table-cell">
                      {assoc.establishmentDate}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Link href={`/associations/${assoc.id}`}>
                          <button className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <Link href={`/associations/${assoc.id}/edit`}>
                          <button className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                              <AlertDialogDescription>
                                هل أنت متأكد من حذف جمعية "{assoc.name}"؟ لا يمكن التراجع عن هذا الإجراء.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(assoc.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-border px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              صفحة {page} من {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded hover:bg-accent disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded hover:bg-accent disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
