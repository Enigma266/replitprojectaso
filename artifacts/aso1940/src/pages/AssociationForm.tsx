import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import {
  useCreateAssociation,
  useGetAssociation,
  useUpdateAssociation,
  getListAssociationsQueryKey,
  getGetAssociationQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { ASSOCIATION_TYPES, ASSOCIATION_STATUSES, WILAYAS } from "@/lib/constants";

const schema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  registrationNumber: z.string().optional(),
  type: z.string().min(1, "النوع مطلوب"),
  status: z.string().min(1, "الحالة مطلوبة"),
  wilaya: z.string().min(1, "الولاية مطلوبة"),
  municipality: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
  website: z.string().optional(),
  establishmentDate: z.string().min(1, "تاريخ التأسيس مطلوب"),
  tenureStartDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  associationId?: number;
}

export function AssociationForm({ associationId }: Props) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const isEdit = !!associationId;

  const { data: existing } = useGetAssociation(associationId!, {
    query: { enabled: isEdit },
  });

  const createMutation = useCreateAssociation();
  const updateMutation = useUpdateAssociation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "establishment",
      type: "charity",
    },
  });

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        registrationNumber: existing.registrationNumber ?? "",
        type: existing.type,
        status: existing.status,
        wilaya: existing.wilaya,
        municipality: existing.municipality ?? "",
        address: existing.address ?? "",
        phone: existing.phone ?? "",
        email: existing.email ?? "",
        website: existing.website ?? "",
        establishmentDate: existing.establishmentDate ?? "",
        tenureStartDate: existing.tenureStartDate ?? "",
      });
    }
  }, [existing, reset]);

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      registrationNumber: data.registrationNumber || undefined,
      municipality: data.municipality || undefined,
      address: data.address || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
      website: data.website || undefined,
      tenureStartDate: data.tenureStartDate || undefined,
    };

    if (isEdit) {
      await updateMutation.mutateAsync(
        { id: associationId!, ...payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetAssociationQueryKey(associationId!) });
            queryClient.invalidateQueries({ queryKey: getListAssociationsQueryKey({}) });
            navigate(`/associations/${associationId}`);
          },
        }
      );
    } else {
      await createMutation.mutateAsync(payload, {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: getListAssociationsQueryKey({}) });
          navigate(`/associations/${data.id}`);
        },
      });
    }
  };

  const type = watch("type");
  const status = watch("status");
  const wilaya = watch("wilaya");

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={isEdit ? `/associations/${associationId}` : "/associations"}>
          <button className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            <ArrowRight className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {isEdit ? "تعديل الجمعية" : "إضافة جمعية جديدة"}
          </h1>
          {isEdit && existing && (
            <p className="text-muted-foreground text-sm">{existing.name}</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic info */}
        <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-foreground border-b border-border pb-2">المعلومات الأساسية</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label>اسم الجمعية <span className="text-destructive">*</span></Label>
              <Input {...register("name")} placeholder="أدخل اسم الجمعية" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>رقم التسجيل</Label>
              <Input {...register("registrationNumber")} placeholder="رقم التسجيل الرسمي" />
            </div>
            <div className="space-y-1.5">
              <Label>تاريخ التأسيس <span className="text-destructive">*</span></Label>
              <Input type="date" {...register("establishmentDate")} />
              {errors.establishmentDate && <p className="text-xs text-destructive">{errors.establishmentDate.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>النوع <span className="text-destructive">*</span></Label>
              <Select value={type} onValueChange={(v) => setValue("type", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ASSOCIATION_TYPES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>الحالة <span className="text-destructive">*</span></Label>
              <Select value={status} onValueChange={(v) => setValue("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ASSOCIATION_STATUSES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-foreground border-b border-border pb-2">الموقع الجغرافي</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>الولاية <span className="text-destructive">*</span></Label>
              <Select value={wilaya} onValueChange={(v) => setValue("wilaya", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الولاية" />
                </SelectTrigger>
                <SelectContent>
                  {WILAYAS.map((w) => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.wilaya && <p className="text-xs text-destructive">{errors.wilaya.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>البلدية</Label>
              <Input {...register("municipality")} placeholder="البلدية" />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label>العنوان</Label>
              <Input {...register("address")} placeholder="العنوان التفصيلي" />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-foreground border-b border-border pb-2">معلومات الاتصال</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>رقم الهاتف</Label>
              <Input {...register("phone")} placeholder="0XXX XXX XXX" />
            </div>
            <div className="space-y-1.5">
              <Label>البريد الإلكتروني</Label>
              <Input type="email" {...register("email")} placeholder="example@domain.dz" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label>الموقع الإلكتروني</Label>
              <Input {...register("website")} placeholder="https://..." />
            </div>
          </div>
        </div>

        {/* Tenure */}
        <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-foreground border-b border-border pb-2">العهدة</h2>
          <div className="space-y-1.5 max-w-xs">
            <Label>تاريخ بداية العهدة</Label>
            <Input type="date" {...register("tenureStartDate")} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Link href={isEdit ? `/associations/${associationId}` : "/associations"}>
            <Button type="button" variant="outline">إلغاء</Button>
          </Link>
          <Button type="submit" disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}>
            {isSubmitting || createMutation.isPending || updateMutation.isPending ? "جارٍ الحفظ..." : "حفظ"}
          </Button>
        </div>
      </form>
    </div>
  );
}
