// The goal is to have this place be the only place where the `supabaseGenerated`
// file is imported, because I think I'll change the generation plan at some point
import type { Database } from "./supabaseGeneratedTypes";
export type { Database } from "./supabaseGeneratedTypes";

export type FitnessRecordWeightRow =
  Database["public"]["Tables"]["fitness_record_weight"]["Row"];

export type FitnessRecordWeightRows = Array<FitnessRecordWeightRow>;

export type FitnessRecordUserPreferencesRow =
  Database["public"]["Tables"]["fitness_record_user_preferences"]["Row"];

type MeasurementInput = "pounds" | "kilograms";
export type FitnessRecordUserPreferencesRowSettings = {
  timezone: string;
  measurementInput: MeasurementInput;
  version: "v1";
};

// Returns a properly typed MeasurementInput, or false if it's not in the set
// TODO: Would really love to learn how to streamline this sort of thing in case
// this enum grows and I have to manually type these names over and over
export const maybeMeasurementInput: (a: string) => MeasurementInput | false = (
  a,
) => (a === "pounds" || a === "kilograms") && a;
