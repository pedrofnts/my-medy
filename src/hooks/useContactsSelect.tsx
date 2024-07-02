import { useSelect } from "@refinedev/antd";

import { supabaseClient } from "@/providers/data/supabaseClient";

export const fetchContacts = async ({ filters }) => {
  let query = supabaseClient.from("contacts").select(`
    id,
    name,
    avatar_url
  `);

  if (filters) {
    filters.forEach((filter) => {
      query = query.eq(filter.field, filter.value);
    });
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const useContactsSelect = (params?: { filters?: any[] }) => {
  const { filters } = params || {};
  return useSelect({
    resource: "contacts",
    optionLabel: "name",
    filters,
    queryFn: fetchContacts,
  });
};
