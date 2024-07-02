import { useSelect } from "@refinedev/antd";

import { supabaseClient } from "@/providers/data/supabaseClient";

const fetchUsers = async () => {
  const { data, error } = await supabaseClient.from("users").select(`
    id,
    name,
    avatar_url
  `);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const useUsersSelect = () => {
  return useSelect({
    resource: "users",
    optionLabel: "name",
    queryFn: fetchUsers,
  });
};
