import { supabaseClient } from "@/providers/data/supabaseClient";

export const fetchCompany = async (id: number) => {
  const { data, error } = await supabaseClient
    .from("companies")
    .select(
      `
      id,
      name,
      avatar_url,
      sales_owner_id
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const fetchCompanyContacts = async ({ queryKey }) => {
  const [_key, { companyId }] = queryKey;

  const { data, error } = await supabaseClient
    .from("contacts")
    .select(
      `
      id,
      name,
      email,
      avatar_url,
      job_title,
      phone,
      status,
      sales_owner_id,
      created_at,
      updated_at
    `
    )
    .eq("company_id", companyId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const fetchCompanyDeals = async ({ queryKey }) => {
  const [_key, { companyId }] = queryKey;

  const { data, error } = await supabaseClient
    .from("deals")
    .select(
      `
      id,
      title,
      value,
      stage (
        id,
        title
      ),
      deal_owner (
        id,
        name,
        avatar_url
      ),
      deal_contact (
        id,
        name,
        avatar_url
      )
    `
    )
    .eq("company_id", companyId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const fetchCompanyTotalDealsAmount = async (companyId: number) => {
  const { data, error } = await supabaseClient
    .from("deals")
    .select("sum(value)")
    .eq("company_id", companyId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const fetchCompanyInfo = async (id: number) => {
  const { data, error } = await supabaseClient
    .from("companies")
    .select(
      `
      id,
      total_revenue,
      industry,
      company_size,
      business_type,
      country,
      website
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const createCompanyNote = async (
  note: string,
  companyId: number,
  createdBy: number
) => {
  const { data, error } = await supabaseClient
    .from("company_notes")
    .insert([
      {
        note,
        company_id: companyId,
        created_by: createdBy,
      },
    ])
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateCompanyNote = async (id: number, note: string) => {
  const { data, error } = await supabaseClient
    .from("company_notes")
    .update({ note })
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const fetchCompanyNotes = async ({ queryKey }) => {
  const [_key, { companyId }] = queryKey;

  const { data, error } = await supabaseClient
    .from("company_notes")
    .select(
      `
      id,
      note,
      created_at,
      created_by (
        id,
        name,
        avatar_url
      )
    `
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const fetchCompanyQuotes = async ({ queryKey }) => {
  const [_key, { companyId }] = queryKey;

  const { data, error } = await supabaseClient
    .from("quotes")
    .select(
      `
      id,
      title,
      status,
      total,
      company (
        id,
        name
      ),
      contact (
        id,
        name,
        avatar_url
      ),
      sales_owner (
        id,
        name,
        avatar_url
      )
    `
    )
    .eq("company_id", companyId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
