import { useSelect } from "@refinedev/antd";

import { supabaseClient } from "@/providers/data/supabaseClient";

const fetchCompanies = async () => {
  const { data, error } = await supabaseClient.from("companies").select(`
    id,
    name,
    avatar_url
  `);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const useCompaniesSelect = () => {
  return useSelect({
    resource: "companies",
    optionLabel: "name",
    queryFn: fetchCompanies,
  });
};
