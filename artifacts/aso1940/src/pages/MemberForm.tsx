import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import {
  useCreateMember,
  useGetMember,
  useUpdateMember,
  useGetAssociation,
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
import {
  MEMBER_POSITIONS,
  MEMBERSHIP_TYPES,
  MEMBER_STATUSES,
  GENDERS,
} from "@/lib/constants";

const schema = z.object({
  firstName: z.string().min(1, "الاسم الأول مطلوب"),
  lastName: z.string().min(1, "اللقب مطلوب"),
  nationalId: z.string().optional(),
  birthDate: z.string().optional(),
  birthPlace: z.string().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  position: z.string().min(1, "المنصب مطلوب"),
  membershipType: z.string().min(1, "نوع العضوية مطلوب"),
  status: z.string().min(1, "الحالة مطلوبة"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  associationId: number;
  memberId?: number;
}

export function MemberForm({ associationId, memberId }: Props) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const isEdit = !!memberId;

  const { data: assoc } = useGetAssociation(associationId);
  const { data: existing } = useGetMember(associationId, memberId!, {
    query: { enabled: isEdit },
  });

  const createMutation = useCreateMember();
  const updateMutation = useUpdateMember();

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
      position: "member",
      membershipType: "regular",
      status: "active",
      nationality: "جزائرية",
    },
  });

  useEffect(() => {
    if (existing) {
      reset({
        firstName: existing.firstName,
        lastName: existing.lastName,
        nationalId: existing.nationalId ?? "",
        birthDate: existing.birthDate ?? "",
        birthPlace: existing.birthPlace ?? "",
        fatherName: existing.fatherName ?? "",
        motherName: existing.motherName ?? "",
        gender: existing.gender ?? "",
        nationality: existing.nationality ?? "جزائرية",
        position: existing.position,
        membershipType: existing.membershipType,
        status: existing.status,
      });
    }
  }, [existing, reset]);

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      nationalId: data.nationalId || undefined,
      birthDate: data.birthDate || undefined,
      birthPlace: data.birthPlace || undefined,
      fatherName: data.fatherName || undefined,
      motherName: data.motherName || undefined,
      gender: data.gender || undefined,
    };

    if (isEdit) {
      await updateMutation.mutateAsync(
        { associationId, memberId: memberId!, ...payload },
        {
          onSuccess: () => {
            navigate(`/associations/${associationId}`);
          },
        }
      );
    } else {
      await createMutation.mutateAsync(
        { associationId, ...payload },
        {
          onSuccess: () => {
            navigate(`/associations/${associationId}`);
          },
        }
      );
    }
  };

  const position = watch("position");
  const membershipType = watch("membershipType");
  const status = watch("status");
  const gender = watch("gender");

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/associations/${associationId}`}>
          <button className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            <ArrowRight className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {isEdit ? "تعديل بيانات العضو" : "إضافة عضو جديد"}
          </h1>
          {assoc && <p className="text-muted-foreground text-sm">{assoc.name}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Identity */}
        <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-foreground border-b border-border pb-2">الهوية الشخصية</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>اللقب <span className="text-destructive">*</span></Label>
              <Input {...register("lastName")} placeholder="اللقب" />
              {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>الاسم <span className="text-destructive">*</span></Label>
              <Input {...register("firstName")} placeholder="الاسم" />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>رقم التعريف الوطني</Label>
              <Input {...register("nationalId")} placeholder="XXXXXXXXXXXXXXXXXX" />
            </div>
            <div className="space-y-1.5">
              <Label>الجنس</Label>
              <Select value={gender ?? ""} onValueChange={(v) => setValue("gender", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الجنس" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(GENDERS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>تاريخ الميلاد</Label>
              <Input type="date" {...register("birthDate")} />
            </div>
            <div className="space-y-1.5">
              <Label>مكان الميلاد</Label>
              <Input {...register("birthPlace")} placeholder="مكان الميلاد" />
            </div>
            <div className="space-y-1.5">
              <Label>اسم الأب</Label>
              <Input {...register("fatherName")} placeholder="اسم الأب" />
            </div>
            <div className="space-y-1.5">
              <Label>اسم الأم</Label>
              <Input {...register("motherName")} placeholder="اسم الأم" />
            </div>
            <div className="space-y-1.5">
              <Label>الجنسية</Label>
              <Input {...register("nationality")} placeholder="الجنسية" />
            </div>
          </div>
        </div>

        {/* Membership */}
        <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-foreground border-b border-border pb-2">بيانات العضوية</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>المنصب <span className="text-destructive">*</span></Label>
              <Select value={position} onValueChange={(v) => setValue("position", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MEMBER_POSITIONS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>نوع العضوية <span className="text-destructive">*</span></Label>
              <Select value={membershipType} onValueChange={(v) => setValue("membershipType", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MEMBERSHIP_TYPES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>الحالة <span className="text-destructive">*</span></Label>
              <Select value={status} onValueChange={(v) => setValue("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MEMBER_STATUSES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Link href={`/associations/${associationId}`}>
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
