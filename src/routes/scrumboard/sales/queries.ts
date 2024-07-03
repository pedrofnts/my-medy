import { supabaseClient } from "@/providers/data/supabaseClient";

export const fetchSalesCompanies = async (
  filter: any,
  sorting: any,
  paging: any
) => {
  const { data, error } = await supabaseClient
    .from("companies")
    .select(
      `
      id,
      name,
      avatar_url,
      contacts:contacts (
        id,
        name,
        avatar_url
      )
    `
    )
    .match(filter)
    .order(sorting.field, { ascending: sorting.order === "asc" })
    .range(paging.offset, paging.limit);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const createDealStage = async (values: any) => {
  const { data, error } = await supabaseClient
    .from("dealStages")
    .insert(values);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const createContact = async (input: any) => {
  const { data, error } = await supabaseClient
    .from("contacts")
    .insert(input)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateDealStage = async (input: any) => {
  const { data, error } = await supabaseClient
    .from("deal_stages")
    .update({ title: input.title })
    .eq("id", input.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const fetchUpdateDeal = async (id: string, values: any) => {
  const { data, error } = await supabaseClient
    .from("deals")
    .update(values)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateDeal = async (input: any) => {
  const { data, error } = await supabaseClient
    .from("deals")
    .update(input)
    .eq("id", input.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const finalizeDeal = async (input: any) => {
  const { data, error } = await supabaseClient
    .from("deals")
    .update({
      notes: input.notes,
      close_date_year: input.closeDateYear,
      close_date_month: input.closeDateMonth,
      close_date_day: input.closeDateDay,
    })
    .eq("id", input.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const fetchSalesDealStages = async (
  filter: any,
  sorting: any,
  paging: any
) => {
  const { data, error } = await supabaseClient
    .from("deal_stages")
    .select(
      `
          id,
          title,
          dealsAggregate: deals (sum(value))
      `
    )
    .match(filter)
    .order(sorting.field, { ascending: sorting.order === "asc" })
    .range(paging.offset, paging.limit);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message);
  }

  return data;
};

export const fetchSalesDeals = async (
  filter: any,
  sorting: any,
  paging: any
) => {
  const { data, error } = await supabaseClient
    .from("deals")
    .select(
      `
      id,
      title,
      value,
      created_at,
      stage_id,
      company:companies (
        id,
        name,
        avatar_url
      ),
      deal_owner:users (
        id,
        name,
        avatar_url
      )
    `
    )
    .match(filter)
    .order(sorting.field, { ascending: sorting.order === "asc" })
    .range(paging.offset, paging.limit);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const fetchCompanies = async () => {
  const { data, error } = await supabaseClient.from("companies").select(`
      id,
      name,
      avatar_url,
      contacts (
        id,
        name,
        avatar_url
      )
    `);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const fetchDeals = async ({ filters, sorters }) => {
  let query = supabaseClient.from("deals").select(`
    id,
    title,
    value,
    created_at,
    stage_id,
    company:companies (id, name, avatar_url),
    deal_owner:users (id, name, avatar_url)
  `);

  if (filters) {
    filters.forEach((filter) => {
      if (filter.field === "created_at") {
        const dateValue = new Date(filter.value).toISOString();
        query = query[filter.operator](filter.field, dateValue);
      } else {
        query = query.eq(filter.field, filter.value);
      }
    });
  }

  if (sorters) {
    sorters.forEach((sorter) => {
      query = query.order(sorter.field, { ascending: sorter.order === "asc" });
    });
  }

  try {
    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      throw new Error(`Failed to fetch deals: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.warn("No deals found or empty response");
      return [];
    }

    console.log("Deals data:", JSON.stringify(data, null, 2));

    // Ensure company and deal_owner are properly structured
    const processedData = data.map((deal) => ({
      ...deal,
      company: deal.company || {
        id: null,
        name: "Unknown Company",
        avatar_url: null,
      },
      deal_owner: deal.deal_owner || {
        id: null,
        name: "Unknown Owner",
        avatar_url: null,
      },
    }));

    return processedData;
  } catch (error) {
    console.error("Error in fetchDeals:", error);
    throw error;
  }
};
