import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";

import { useNavigation } from "@refinedev/core";

import { ProjectOutlined, RightCircleOutlined } from "@ant-design/icons";
import { Button, Card, Spin } from "antd";

import { fetchDashboardTasksChartData } from "./queries";

const Pie = lazy(() => import("@ant-design/plots/es/components/pie"));

export const DashboardTasksChart: React.FC = () => {
  const { list } = useNavigation();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchDashboardTasksChartData();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    console.error("Error fetching tasks chart data", error);
    return <div>Error: {error}</div>;
  }

  const tasksData = useMemo(() => {
    if (!data?.length) {
      return [];
    }

    return data
      .map((stage: any) => ({
        title: stage.title,
        value: stage.tasks?.length ?? 0,
      }))
      .filter(
        (stage) =>
          stage.value !== null && stage.value !== undefined && stage.value > 0,
      )
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  }, [data]);

  const COLORS = [
    "#BAE0FF",
    "#69B1FF",
    "#1677FF",
    "#0958D9",
    "#10239E",
    "#061178",
    "#030852",
    "#03052E",
    "#000B0A",
    "#000000",
  ];

  const config: PieConfig = {
    width: 168,
    height: 168,
    data: tasksData,
    angleField: "value",
    colorField: "title",
    color: COLORS,
    legend: false,
    radius: 1,
    innerRadius: 0.6,
    label: false,
    syncViewPadding: true,
    statistic: {
      title: false,
      content: false,
    },
  };

  return (
    <Card
      style={{ height: "100%" }}
      headStyle={{ padding: "8px 16px" }}
      bodyStyle={{
        padding: "32px",
      }}
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <ProjectOutlined />
          <span style={{ marginLeft: ".5rem" }}>Tasks</span>
        </div>
      }
      extra={
        <Button onClick={() => list("tasks")} icon={<RightCircleOutlined />}>
          See kanban board
        </Button>
      }
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {loading ? (
          <Spin size="large" />
        ) : (
          <Suspense fallback={<Spin size="large" />}>
            <Pie {...config} />
          </Suspense>
        )}
      </div>
      <div
        style={{
          display: "flex",
          width: "100%",
          flexWrap: "wrap",
          marginTop: "48px",
        }}
      >
        {tasksData?.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              width: "50%",
              alignItems: "center",
              marginTop: "8px",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                backgroundColor: COLORS[index],
                marginRight: ".5rem",
              }}
            />
            <span
              style={{
                textTransform: "capitalize",
                whiteSpace: "nowrap",
              }}
            >
              {item.title.toLowerCase()}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};
