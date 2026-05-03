import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  useGetAssociation,
  useDeleteAssociation,
  useListMembers,
  useDeleteMember,
  useListReceipts,
  useDeleteReceipt,
  useRenewTenure,
  getGetAssociationQueryKey,
  getListAssociationsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight, Edit, Trash2, Users, FileText, RotateCcw, Phone, Mail, Globe, MapPin, Calendar, Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import {
  ASSOCIATION_TYPES, MEMBER_POSITIONS, MEMBERSHIP_TYPES, MEMBER_STATUSES,
  RECEIPT_TYPES, ASSOCIATION_STATUSES,
} from "@/lib/constants";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function TenureRenewDialog({ association, open, onClose }: {
  association: { id: number; isSportsType: boolean; tenureExtended: boolean };
  open: boolean;
  onClose: () => void;
}) {
  const [tenureStartDate, setTenureStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [extend, setExtend] = useState(false);
  const queryClient = useQueryClient();
  const renewMutation = useRenewTenure();

  function handleRenew() {
    renewMutation.mutate(
      {
        id: association.id,
        tenureStartDate,
        extend: extend || undefined,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAssociationQueryKey(association.id) });
          onClose();
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تجديد العهدة</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>تاريخ بداية العهدة الجديدة</Label>
            <Input
              type="date"
              value={tenureStartDate}
              onChange={(e) => setTenureStartDate(e.target.value)}
            />
          </div>
          {association.isSportsType && !association.tenureExtended && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="extend"
                checked={extend}
                onCheckedChange={(c) => setExtend(!!c)}
              />
              <Label htmlFor="extend" className="cursor-pointer">
                تمديد بسنة إضافية (للجمعيات الرياضية فقط)
              </Label>
            </div>
          )}
          <div className="text-sm text-muted-foreground bg-muted/40 rounded-lg p-3">
            {association.isSportsType ? (
              <span>مدة العهدة: {extend ? "سنة واحدة (تمديد)" : "3 سنوات"}</span>
            ) : (
              <span>مدة العهدة: 4 سنوات</span>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button onClick={handleRenew} disabled={renewMutation.isPending}>
            {renewMutation.isPending ? "جارٍ التجديد..." : "تجديد العهدة"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface Props { id: number }

export function AssociationDetail({ id }: Props) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [renewOpen, setRenewOpen] = useState(false);

  const { data: assoc, isLoading } = useGetAssociation(id);
  const { data: members } = useListMembers(id, {});
  const { data: receipts } = useListReceipts(id);
  const deleteMutation = useDeleteAssociation();
  const deleteMemberMutation = useDeleteMember();
  const deleteReceiptMutation = useDeleteReceipt();

  if (isLoading) {
    return <div className="p-12 text-center text-muted-foreground">جارٍ التحميل...</div>;
  }

  if (!assoc) {
    return <div className="p-12 text-center text-destructive">الجمعية غير موجودة</div>;
  }

  const tenureEnd = assoc.tenureEndDate ? new Date(assoc.tenureEndDate) : null;
  const today = new Date();
  const daysLeft = tenureEnd ? Math.ceil((tenureEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

  function handleDeleteAssociation() {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAssociationsQueryKey({}) });
        navigate("/associations");
      },
    });
  }

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/associations">
            <button className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors mt-0.5">
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">{assoc.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <StatusBadge status={assoc.status} />
              <span className="text-sm text-muted-foreground">
                {ASSOCIATION_TYPES[assoc.type] ?? assoc.type}
              </span>
              {assoc.registrationNumber && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Hash className="w-3 h-3" />{assoc.registrationNumber}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setRenewOpen(true)} className="gap-1.5">
            <RotateCcw className="w-4 h-4" />
            تجديد العهدة
          </Button>
          <Link href={`/associations/${id}/edit`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Edit className="w-4 h-4" />
              تعديل
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-1.5">
                <Trash2 className="w-4 h-4" />
                حذف
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>تأكيد حذف الجمعية</AlertDialogTitle>
                <AlertDialogDescription>
                  هل أنت متأكد من حذف جمعية "{assoc.name}"؟ لا يمكن التراجع عن هذا الإجراء.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAssociation}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  حذف
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Details */}
        <div className="md:col-span-2 bg-card border border-card-border rounded-xl p-5 shadow-sm space-y-3">
          <h2 className="font-semibold text-foreground">المعلومات التفصيلية</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {assoc.wilaya && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{assoc.wilaya}{assoc.municipality ? ` - ${assoc.municipality}` : ""}</span>
              </div>
            )}
            {assoc.address && (
              <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{assoc.address}</span>
              </div>
            )}
            {assoc.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0" />
                <span>{assoc.phone}</span>
              </div>
            )}
            {assoc.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 shrink-0" />
                <span>{assoc.email}</span>
              </div>
            )}
            {assoc.website && (
              <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                <Globe className="w-4 h-4 shrink-0" />
                <a href={assoc.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {assoc.website}
                </a>
              </div>
            )}
            {assoc.establishmentDate && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>تأسست: {assoc.establishmentDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tenure */}
        <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm space-y-3">
          <h2 className="font-semibold text-foreground">العهدة</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">رقم العهدة</span>
              <span className="font-semibold">{assoc.currentTenure}</span>
            </div>
            {assoc.tenureStartDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">البداية</span>
                <span>{assoc.tenureStartDate}</span>
              </div>
            )}
            {assoc.tenureEndDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">النهاية</span>
                <span>{assoc.tenureEndDate}</span>
              </div>
            )}
            {daysLeft !== null && (
              <div className={`rounded-lg p-2 text-center text-xs font-medium mt-2 ${
                daysLeft < 0 ? "bg-red-100 text-red-700" :
                daysLeft <= 30 ? "bg-amber-100 text-amber-700" :
                "bg-green-100 text-green-700"
              }`}>
                {daysLeft < 0
                  ? `منتهية منذ ${Math.abs(daysLeft)} يوم`
                  : daysLeft === 0
                  ? "تنتهي اليوم"
                  : `${daysLeft} يوم متبقٍ`}
              </div>
            )}
            {assoc.isSportsType && (
              <div className="text-xs text-muted-foreground pt-1">
                جمعية رياضية {assoc.tenureExtended ? "(تم التمديد)" : ""}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="members" dir="rtl">
        <TabsList>
          <TabsTrigger value="members" className="gap-1.5">
            <Users className="w-4 h-4" />
            الأعضاء ({(members ?? []).length})
          </TabsTrigger>
          <TabsTrigger value="receipts" className="gap-1.5">
            <FileText className="w-4 h-4" />
            الوصولات ({(receipts ?? []).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-4">
          <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="font-medium text-foreground">قائمة الأعضاء</span>
              <Link href={`/associations/${id}/members/new`}>
                <Button size="sm">إضافة عضو</Button>
              </Link>
            </div>
            {(members ?? []).length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">لا يوجد أعضاء مسجلون بعد</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border">
                      <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">الاسم</th>
                      <th className="text-right px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">المنصب</th>
                      <th className="text-right px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">نوع العضوية</th>
                      <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">الحالة</th>
                      <th className="px-4 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(members ?? []).map((m) => (
                      <tr key={m.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3">
                          <div className="font-medium">{m.lastName} {m.firstName}</div>
                          {m.nationalId && <div className="text-xs text-muted-foreground">{m.nationalId}</div>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                          {MEMBER_POSITIONS[m.position] ?? m.position}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                          {MEMBERSHIP_TYPES[m.membershipType] ?? m.membershipType}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            m.status === "active" ? "bg-green-100 text-green-700" :
                            m.status === "frozen" ? "bg-blue-100 text-blue-700" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {MEMBER_STATUSES[m.status] ?? m.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 justify-end">
                            <Link href={`/associations/${id}/members/${m.id}/edit`}>
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
                                  <AlertDialogTitle>حذف العضو</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    هل أنت متأكد من حذف العضو "{m.lastName} {m.firstName}"؟
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteMemberMutation.mutate({ associationId: id, memberId: m.id })}
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
          </div>
        </TabsContent>

        <TabsContent value="receipts" className="mt-4">
          <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="font-medium text-foreground">الوصولات</span>
            </div>
            {(receipts ?? []).length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">لا توجد وصولات مسجلة</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border">
                      <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">نوع الوصل</th>
                      <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">رقم الوصل</th>
                      <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">التاريخ</th>
                      <th className="text-right px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">ملاحظات</th>
                      <th className="px-4 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(receipts ?? []).map((r) => (
                      <tr key={r.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3">{RECEIPT_TYPES[r.receiptType] ?? r.receiptType}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.receiptNumber ?? "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.receiptDate}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{r.notes ?? "—"}</td>
                        <td className="px-4 py-3">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>حذف الوصل</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من حذف هذا الوصل؟
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteReceiptMutation.mutate({ associationId: id, receiptId: r.id })}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <TenureRenewDialog
        association={assoc}
        open={renewOpen}
        onClose={() => setRenewOpen(false)}
      />
    </div>
  );
}
