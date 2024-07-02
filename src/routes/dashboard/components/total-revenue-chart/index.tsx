import React, { Suspense, useEffect, useState } from "react";

import { DollarOutlined } from "@ant-design/icons";
import type { GaugeConfig } from "@ant-design/plots";
import { Card, Skeleton, Space } from "antd";

import { Text } from "@/components";
import { supabaseClient } from "@/providers/data/supabaseClient";
import { currencyNumber } from "@/utilities";

const Gauge = React.lazy(() => import("@ant-design/plots/es/components/gauge"));

export const DashboardTotalRevenueChart: React.FC = () => {
  const [expectedRevenueData, setExpectedRevenueData] = useState<number>(0);
  const [realizedRevenueData, setRealizedRevenueData] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRevenueData = async () => {
      setIsLoading(true);

      const { data: wonDeals, error: wonDealsError } = await supabaseClient
        .from("deals")
        .select("value")
        .eq("deal_stage_id", 1);

      const { data: allDeals, error: allDealsError } = await supabaseClient
        .from("deals")
        .select("value")
  
        console.log(allDeals, wonDeals)

      if (wonDealsError || allDealsError) {
        console.error("Error fetching revenue data", wonDealsError, allDealsError);
        setIsLoading(false);
        return;
      }

      const totalRealizedRevenue = wonDeals.reduce((acc, deal) => acc + deal.value, 0);

      const totalExpectedRevenue = allDeals.reduce((acc, deal) => acc + deal.value, 0);

      setExpectedRevenueData(totalExpectedRevenue);
      setRealizedRevenueData(totalRealizedRevenue);
      setIsLoading(false);
    };

    fetchRevenueData();
  }, []);

  const realizationPercentageOfExpected =
    realizedRevenueData && expectedRevenueData
      ? (realizedRevenueData / expectedRevenueData) * 100
      : 0;

  const config: GaugeConfig = {
    animation: !isLoading,
    supportCSSTransform: true,
    percent: realizationPercentageOfExpected / 100,
    range: {
      color: "l(0) 0:#D9F7BE 1:#52C41A",
    },
    axis: {
      tickLine: {
        style: {
          stroke: "#BFBFBF",
        },
      },
      label: {
        formatter(v) {
          return Number(v) * 100;
        },
      },
      subTickLine: {
        count: 3,
      },
    },
    indicator: {
      pointer: {
        style: {
          fontSize: 4,
          stroke: "#BFBFBF",
          lineWidth: 2,
        },
      },
      pin: {
        style: {
          r: 8,
          lineWidth: 2,
          stroke: "#BFBFBF",
        },
      },
    },
    statistic: {
      content: {
        formatter: (datum) => {
          return `${(datum?.percent * 100).toFixed(2)}%`;
        },
        style: {
          color: "rgba(0,0,0,0.85)",
          fontWeight: 500,
          fontSize: "24px",
        },
      },
    },
  };

  return (
    <Card
      style={{ height: "100%" }}
      bodyStyle={{
        padding: "0 32px 32px 32px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
      headStyle={{ padding: "16px" }}
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <DollarOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
          <Text size="sm">Total revenue (yearly)</Text>
        </div>
      }
    >
      <Suspense>
        <Gauge {...config} padding={0} width={280} height={280} />
      </Suspense>

      <div
        style={{
          display: "flex",
          gap: "32px",
        }}
      >
        <Space direction="vertical" size={0}>
          <Text size="xs" className="secondary">
            Expected
          </Text>
          {!isLoading ? (
            <Text
              size="md"
              className="primary"
              style={{
                minWidth: "100px",
              }}
            >
              {currencyNumber(expectedRevenueData || 0)}
            </Text>
          ) : (
            <Skeleton.Button
              style={{
                width: "100px",
                height: "16px",
                marginTop: "6px",
              }}
              active={true}
            />
          )}
        </Space>
        <Space direction="vertical" size={0}>
          <Text size="xs" className="secondary">
            Realized
          </Text>
          {!isLoading ? (
            <Text
              size="md"
              className="primary"
              style={{
                minWidth: "100px",
              }}
            >
              {currencyNumber(realizedRevenueData || 0)}
            </Text>
          ) : (
            <Skeleton.Button
              style={{
                width: "100px",
                height: "16px",
                marginTop: "6px",
              }}
              active={true}
            />
          )}
        </Space>
      </div>
    </Card>
  );
};
