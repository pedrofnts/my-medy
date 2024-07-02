import { supabaseClient } from "@/providers/data/supabaseClient";

export const fetchContact = async (id: number) => {
  const { data, error } = await supabaseClient
    .from("contacts")
    .select(
      `
            id,
            name,
            email,
            company_id,
            job_title,
            status,
            phone,
            timezone,
            avatar_url,
            sales_owner_id,
            created_at,
            companies (
                id,
                name,
                avatar_url
            ),
            sales_owners (
                id,
                name,
                avatar_url
            )
        `
    )
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
