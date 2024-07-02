import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";

import { useNavigation } from "@refinedev/core";

import { DollarOutlined, RightCircleOutlined } from "@ant-design/icons";
import { Button, Card, Spin } from "antd";
import dayjs from "dayjs";

import { supabaseClient } from "@/providers/data/supabaseClient";

const Area = lazy(() => import("@ant-design/plots/es/components/area"));

type DealItem = {
  close_date_month: number;
  close_date_year: number;
  value: number;
};

type DealStage = {
  title: string;
  deals: DealItem[];
};

const fetchDashboardDealsChartData = async (): Promise<DealStage[]> => {
  const { data, error } = await supabaseClient
    .from("deal_stages")
    .select(`
      title,
      deals!deal_stage_id(
        close_date_month,
        close_date_year,
        value
      )
    `)
    .in('title', ['WON', 'LOST']);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const DashboardDealsChart: React.FC = () => {
  const { list } = useNavigation();
  const [data, setData] = useState<DealStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchDashboardDealsChartData();
        console.log("Fetched data:", JSON.stringify(result, null, 2));
        setData(result);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching deals chart data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const dealData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    const processDeals = (stageTitle: string, state: string) => {
      const stageData = data.find((node) => node.title === stageTitle);
      if (!stageData || !Array.isArray(stageData.deals)) return [];

      return stageData.deals.map((item: DealItem) => {
        const { close_date_month, close_date_year, value } = item;
        const date = dayjs(`${close_date_year}-${close_date_month}-01`);
        return {
          timeUnix: date.unix(),
          timeText: date.format("MMM YYYY"),
          value: value,
          state: state,
        };
      });
    };

    const won = processDeals("WON", "Won");
    const lost = processDeals("LOST", "Lost");

    return [...won, ...lost].sort((a, b) => a.timeUnix - b.timeUnix);
  }, [data]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  const config: any = {
    isStack: false,
    data: dealData,
    xField: "timeText",
    yField: "value",
    seriesField: "state",
    animation: true,
    startOnZero: false,
    smooth: true,
    legend: {
      offsetY: -6,
    },
    yAxis: {
      tickCount: 4,
      label: {
        formatter: (v: string) => {
          return `$${Number(v) / 1000}k`;
        },
      },
    },
    tooltip: {
      formatter: (data: any) => {
        return {
          name: data.state,
          value: `$${Number(data.value) / 1000}k`,
        };
      },
    },
    areaStyle: (datum: any) => {
      const won = "l(270) 0:#ffffff 0.5:#b7eb8f 1:#52c41a";
      const lost = "l(270) 0:#ffffff 0.5:#f3b7c2 1:#ff4d4f";
      return { fill: datum.state === "Won" ? won : lost };
    },
    color: (datum: any) => {
      return datum.state === "Won" ? "#52C41A" : "#F5222D";
    },
  };

  return (
    <Card
      style={{ height: "100%" }}
      headStyle={{ padding: "8px 16px" }}
      bodyStyle={{ padding: "24px 24px 0px 24px" }}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <DollarOutlined />
          <span>Deals</span>
        </div>
      }
      extra={
        <Button onClick={() => list("deals")} icon={<RightCircleOutlined />}>
          See sales pipeline
        </Button>
      }
    >
      {loading ? (
        <Spin size="large" />
      ) : (
        <Suspense fallback={<Spin size="large" />}>
          <Area {...config} height={325} />
        </Suspense>
      )}
    </Card>
  );
};