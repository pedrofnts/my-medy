import { useSelect } from "@refinedev/antd";

import { supabaseClient } from "@/providers/data/supabaseClient";

export const fetchDealStages = async () => {
  const { data, error } = await supabaseClient.from("deal_stages").select(`
    id,
    title
  `);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const useDealStagesSelect = () => {
  return useSelect({
    resource: "deal_stages",
    optionLabel: "title",
    queryFn: fetchDealStages,
  });
};
