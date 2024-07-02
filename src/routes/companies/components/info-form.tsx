import { useEffect,useState } from "react";
import { useParams } from "react-router-dom";

import {
  ApiOutlined,
  BankOutlined,
  ColumnWidthOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { Card, Input, InputNumber, Select, Space, Spin } from "antd";

import { SingleElementForm, Text } from "@/components";
import type { BusinessType, CompanySize, Industry } from "@/graphql/schema.types";
import { currencyNumber } from "@/utilities";

import { fetchCompanyInfo } from "./queries";

type CompanyInfo = {
  id: number;
  total_revenue: number;
  industry: Industry;
  company_size: CompanySize;
  business_type: BusinessType;
  country: string;
  website: string;
};

export const CompanyInfoForm = () => {
  const [activeForm, setActiveForm] = useState<
    | "totalRevenue"
    | "industry"
    | "companySize"
    | "businessType"
    | "country"
    | "website"
  >();
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const data = await fetchCompanyInfo(Number(id));
          setCompanyInfo(data);
        } catch (error) {
          console.error("Error fetching company info:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [id]);

  const getActiveForm = (formName: keyof CompanyInfo) => {
    if (activeForm === formName) {
      return "form";
    }

    if (!companyInfo?.[formName]) {
      return "empty";
    }

    return "view";
  };

  if (loading) {
    return <Spin />;
  }

  if (!companyInfo) {
    return <Text>No company info available.</Text>;
  }

  const {
    total_revenue,
    industry,
    company_size,
    business_type,
    country,
    website,
  } = companyInfo;

  return (
    <Card
      title={
        <Space size={15}>
          {/* @ts-expect-error Ant Design Icon's v5.0.1 has an issue with @types/react@^18.2.66 */}
          <ShopOutlined className="sm" />
          <Text>Company info</Text>
        </Space>
      }
      headStyle={{
        padding: "1rem",
      }}
      bodyStyle={{
        padding: "0",
      }}
      style={{
        maxWidth: "500px",
      }}
    >
      <SingleElementForm
        style={{
          padding: "0.5rem 1rem",
        }}
        // @ts-expect-error Ant Design Icon's v5.0.1 has an issue with @types/react@^18.2.66
        icon={<ColumnWidthOutlined className="tertiary" />}
        state={getActiveForm("company_size")}
        itemProps={{
          name: "companySize",
          label: "Company size",
        }}
        view={<Text>{company_size}</Text>}
        onClick={() => setActiveForm("company_size")}
        onUpdate={() => setActiveForm(undefined)}
        onCancel={() => setActiveForm(undefined)}
      >
        <Select
          autoFocus
          defaultValue={company_size}
          options={companySizeOptions}
          style={{
            width: "100%",
          }}
        />
      </SingleElementForm>
      <SingleElementForm
        style={{
          padding: "0.5rem 1rem",
        }}
        // @ts-expect-error Ant Design Icon's v5.0.1 has an issue with @types/react@^18.2.66
        icon={<DollarOutlined className="tertiary" />}
        state={getActiveForm("total_revenue")}
        itemProps={{
          name: "totalRevenue",
          label: "Total revenue",
        }}
        view={<Text>{currencyNumber(total_revenue || 0)}</Text>}
        onClick={() => setActiveForm("total_revenue")}
        onUpdate={() => setActiveForm(undefined)}
        onCancel={() => setActiveForm(undefined)}
      >
        <InputNumber
          autoFocus
          addonBefore={"$"}
          min={0}
          placeholder="0,00"
          defaultValue={total_revenue || 0}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </SingleElementForm>
      <SingleElementForm
        style={{
          padding: "0.5rem 1rem",
        }}
        // @ts-expect-error Ant Design Icon's v5.0.1 has an issue with @types/react@^18.2.66
        icon={<BankOutlined className="tertiary" />}
        state={getActiveForm("industry")}
        itemProps={{
          name: "industry",
          label: "Industry",
        }}
        view={<Text>{industry}</Text>}
        onClick={() => setActiveForm("industry")}
        onUpdate={() => setActiveForm(undefined)}
        onCancel={() => setActiveForm(undefined)}
      >
        <Select
          autoFocus
          defaultValue={industry}
          options={industryOptions}
          style={{
            width: "100%",
          }}
        />
      </SingleElementForm>
      <SingleElementForm
        style={{
          padding: "0.5rem 1rem",
        }}
        // @ts-expect-error Ant Design Icon's v5.0.1 has an issue with @types/react@^18.2.66
        icon={<ApiOutlined className="tertiary" />}
        state={getActiveForm("business_type")}
        itemProps={{
          name: "businessType",
          label: "Business type",
        }}
        view={<Text>{business_type}</Text>}
        onClick={() => setActiveForm("business_type")}
        onUpdate={() => setActiveForm(undefined)}
        onCancel={() => setActiveForm(undefined)}
      >
        <Select
          autoFocus
          defaultValue={business_type}
          options={businessTypeOptions}
          style={{
            width: "100%",
          }}
        />
      </SingleElementForm>
      <SingleElementForm
        style={{
          padding: "0.5rem 1rem",
        }}
        // @ts-expect-error Ant Design Icon's v5.0.1 has an issue with @types/react@^18.2.66
        icon={<EnvironmentOutlined className="tertiary" />}
        state={getActiveForm("country")}
        itemProps={{
          name: "country",
          label: "Country",
        }}
        view={<Text>{country}</Text>}
        onClick={() => setActiveForm("country")}
        onUpdate={() => setActiveForm(undefined)}
        onCancel={() => setActiveForm(undefined)}
      >
        <Input
          autoFocus
          defaultValue={country || ""}
          placeholder="Country"
          style={{
            width: "100%",
          }}
        />
      </SingleElementForm>
      <SingleElementForm
        style={{
          padding: "0.5rem 1rem",
        }}
        // @ts-expect-error Ant Design Icon's v5.0.1 has an issue with @types/react@^18.2.66
        icon={<EnvironmentOutlined className="tertiary" />}
        state={getActiveForm("website")}
        itemProps={{
          name: "website",
          label: "Website",
        }}
        view={<Text>{website}</Text>}
        onClick={() => setActiveForm("website")}
        onUpdate={() => setActiveForm(undefined)}
        onCancel={() => setActiveForm(undefined)}
      >
        <Input
          autoFocus
          defaultValue={website || ""}
          placeholder="Website"
          style={{
            width: "100%",
          }}
        />
      </SingleElementForm>
    </Card>
  );
};

const companySizeOptions: {
  label: string;
  value: CompanySize;
}[] = [
  {
    label: "Enterprise",
    value: "ENTERPRISE",
  },
  {
    label: "Large",
    value: "LARGE",
  },
  {
    label: "Medium",
    value: "MEDIUM",
  },
  {
    label: "Small",
    value: "SMALL",
  },
];

const industryOptions: {
  label: string;
  value: Industry;
}[] = [
  { label: "Aerospace", value: "AEROSPACE" },
  { label: "Agriculture", value: "AGRICULTURE" },
  { label: "Automotive", value: "AUTOMOTIVE" },
  { label: "Chemicals", value: "CHEMICALS" },
  { label: "Construction", value: "CONSTRUCTION" },
  { label: "Defense", value: "DEFENSE" },
  { label: "Education", value: "EDUCATION" },
  { label: "Energy", value: "ENERGY" },
  { label: "Financial Services", value: "FINANCIAL_SERVICES" },
  { label: "Food and Beverage", value: "FOOD_AND_BEVERAGE" },
  { label: "Government", value: "GOVERNMENT" },
  { label: "Healthcare", value: "HEALTHCARE" },
  { label: "Hospitality", value: "HOSPITALITY" },
  { label: "Industrial Manufacturing", value: "INDUSTRIAL_MANUFACTURING" },
  { label: "Insurance", value: "INSURANCE" },
  { label: "Life Sciences", value: "LIFE_SCIENCES" },
  { label: "Logistics", value: "LOGISTICS" },
  { label: "Media", value: "MEDIA" },
  { label: "Mining", value: "MINING" },
  { label: "Nonprofit", value: "NONPROFIT" },
  { label: "Other", value: "OTHER" },
  { label: "Pharmaceuticals", value: "PHARMACEUTICALS" },
  { label: "Professional Services", value: "PROFESSIONAL_SERVICES" },
  { label: "Real Estate", value: "REAL_ESTATE" },
  { label: "Retail", value: "RETAIL" },
  { label: "Technology", value: "TECHNOLOGY" },
  { label: "Telecommunications", value: "TELECOMMUNICATIONS" },
  { label: "Transportation", value: "TRANSPORTATION" },
  { label: "Utilities", value: "UTILITIES" },
];

const businessTypeOptions: {
  label: string;
  value: BusinessType;
}[] = [
  {
    label: "B2B",
    value: "B2B",
  },
  {
    label: "B2C",
    value: "B2C",
  },
  {
    label: "B2G",
    value: "B2G",
  },
];
