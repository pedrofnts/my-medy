import { supabaseClient } from "../../../providers/data/supabaseClient";

export const fetchDashboardDealsChartData = async () => {
  const { data, error } = await supabaseClient.from("deal_stages").select(`
            title,
            deals!deal_stage_id (
                close_date_month,
                close_date_year,
                value
            )
        `);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const fetchDashboardTasksChartData = async () => {
  const { data, error } = await supabaseClient.from("task_stages").select(`
            title,
            tasks (
                id
            )
        `);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
