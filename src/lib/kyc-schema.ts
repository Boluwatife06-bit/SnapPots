import { z } from "zod";

export const kycSchema = z.object({
  bvn: z.string().regex(/^\d{11}$/, "BVN must be exactly 11 digits"),
  full_name: z.string().trim().min(3, "Enter your full legal name").max(120),
  date_of_birth: z.string().refine((v) => {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return false;
    const age = (Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000);
    return age >= 18 && age < 120;
  }, "You must be at least 18"),
  id_type: z.enum(["nin_slip", "voters_card", "drivers_license", "passport"]),
});

export type KycInput = z.infer<typeof kycSchema>;

export const ID_TYPE_LABELS: Record<KycInput["id_type"], string> = {
  nin_slip: "NIN Slip",
  voters_card: "Voter's Card",
  drivers_license: "Driver's License",
  passport: "International Passport",
};
