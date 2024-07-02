import React, { useEffect, useState } from "react";

import { UnorderedListOutlined } from "@ant-design/icons";
import { Card, Skeleton as AntdSkeleton } from "antd";
import dayjs from "dayjs";

import { CustomAvatar, Text } from "@/components";
import { supabaseClient } from "@/providers/data/supabaseClient";

import styles from "./index.module.css";

export const DashboardLatestActivities: React.FC<{ limit?: number }> = ({
  limit = 5,
}) => {
  const [deals, setDeals] = useState([]);
  const [audit, setAudit] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const { data: dealsData, error: dealsError } = await supabaseClient
        .from("deals")
        .select(`
          id,
          title,
          deal_stage_id,
          company_id,
          companies (
            id,
            name,
            avatar_url
          )
        `);

      const { data: auditsData, error: auditsError } = await supabaseClient
        .from("audits")
        .select(`
          id,
          action,
          target_entity,
          target_id,
          created_at,
          changes,
          user_id,
          users (
            id,
            name,
            avatar_url
          )
        `)
        .eq("target_entity", "Deal")
        .in("action", ["CREATE", "UPDATE"])
        .order("created_at", { ascending: false })
        .limit(limit);

      if (dealsError || auditsError) {
        console.error("Error fetching latest activities", dealsError, auditsError);
      } else {
        setDeals(dealsData);
        setAudit(auditsData);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [limit]);

  return (
    <Card
      headStyle={{ padding: "16px" }}
      bodyStyle={{
        padding: "0 1rem",
      }}
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <UnorderedListOutlined />
          <Text size="sm" style={{ marginLeft: ".5rem" }}>
            Latest activities
          </Text>
        </div>
      }
    >
      {isLoading &&
        Array.from({ length: limit }).map((_, index) => (
          <Skeleton key={index} />
        ))}
      {!isLoading &&
        audit.map(({ id, users, created_at, action, target_id }) => {
          const deal = deals.find((deal) => deal.id === target_id);

          return (
            <div key={id} className={styles.item}>
              <div className={styles.avatar}>
                <CustomAvatar
                  shape="square"
                  size={48}
                  src={deal?.companies.avatar_url}
                  name={deal?.companies.name}
                />
              </div>
              <div className={styles.action}>
                <Text type="secondary" size="xs">
                  {dayjs(created_at).fromNow()}
                </Text>

                <Text className={styles.detail}>
                  <Text className={styles.name} strong>
                    {users?.name}
                  </Text>
                  <Text>{action === "CREATE" ? "created" : "moved"}</Text>
                  <Text strong>{deal?.title}</Text>
                  <Text>deal</Text>
                  <Text>{action === "CREATE" ? "in" : "to"}</Text>
                  <Text strong>{deal?.deal_stage_id || "Unassigned"}.</Text>
                </Text>
              </div>
            </div>
          );
        })}
    </Card>
  );
};

const Skeleton = () => {
  return (
    <div className={styles.item}>
      <AntdSkeleton.Avatar
        active
        size={48}
        shape="square"
        style={{
          borderRadius: "4px",
          marginRight: "16px",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <AntdSkeleton.Button
          active
          style={{
            height: "16px",
          }}
        />
        <AntdSkeleton.Button
          active
          style={{
            width: "300px",
            height: "16px",
          }}
        />
      </div>
    </div>
  );
};
