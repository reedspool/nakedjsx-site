// The goal is to have this place be the only place where the `supabaseGenerated`
// file is imported, because I think I'll change the generation plan at some point
import type { Database } from "./supabaseGeneratedTypes";
export type { Database } from "./supabaseGeneratedTypes";

export type FitnessRecordWeightRow =
  Database["public"]["Tables"]["fitness_record_weight"]["Row"];

export type FitnessRecordWeightRows = Array<FitnessRecordWeightRow>;
