import { supabaseClient } from "@/providers/data/supabaseClient";

export const createCompany = async (values) => {
  const { data, error } = await supabaseClient
    .from("companies")
    .insert([values]);

  if (error) {
    throw new Error(error.message);
  }

  return data[0];
};

export const fetchCompaniesTable = async ({ pagination, filters, sorters }) => {
  let query = supabaseClient.from("companies").select(`
    id,
    name,
    avatar_url,
    dealsAggregate:deals(
      sum:value
    ),
    sales_owner:users(
      id,
      name,
      avatar_url
    ),
    contacts (
      id,
      name,
      avatar_url
    )
  `);

  if (filters) {
    filters.forEach((filter) => {
      if (filter.field && filter.operator && filter.value !== undefined) {
        query = query[filter.operator](filter.field, filter.value);
      }
    });
  }

  if (sorters && sorters.length > 0) {
    const sorter = sorters[0];
    query = query.order(sorter.field, { ascending: sorter.order === "asc" });
  }

  if (pagination) {
    const { current, pageSize } = pagination;
    query = query.range((current - 1) * pageSize, current * pageSize - 1);
  }

  const { data, error, count } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return {
    dataSource: data,
    total: count,
  };
};
