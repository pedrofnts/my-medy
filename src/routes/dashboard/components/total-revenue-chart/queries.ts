export const DASHBOARD_TOTAL_REVENUE_QUERY = `
  SELECT
    deal_stage_id,
    SUM(value) as value
  FROM deals
  GROUP BY
    deal_stage_id;
`;
