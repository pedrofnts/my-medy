export const DEALS_QUERY = `
    query LatestActivitiesDeals {
        deals {
            id
            title
            deal_stage_id
            company_id
            companies {
                id
                name
                avatar_url
            }
        }
    }
`;

export const AUDITS_QUERY = `
    query LatestActivitiesAudits {
        audits {
            id
            action
            target_entity
            target_id
            created_at
            changes {
                field
                from
                to
            }
            user_id
            users {
                id
                name
                avatar_url
            }
        }
    }
`;
