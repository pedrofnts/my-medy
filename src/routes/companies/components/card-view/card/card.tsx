import type { FC } from "react";

import { useDelete, useNavigation } from "@refinedev/core";

import { DeleteOutlined, EyeOutlined, MoreOutlined } from "@ant-design/icons";
import { Button, Card, Dropdown, Space, Tooltip } from "antd";

import { CustomAvatar, Text } from "@/components";
import { currencyNumber } from "@/utilities";

import { AvatarGroup } from "../../avatar-group";
import { CompanyCardSkeleton } from "./skeleton";

type Company = {
  id: string;
  name: string;
  avatar_url: string;
  sales_owner_id: string;
  sales_owner: {
    id: string;
    name: string;
    avatar_url: string;
  };
  dealsAggregate: {
    sum: {
      value: number;
    };
  }[];
  contacts: {
    nodes: {
      id: string;
      name: string;
      avatar_url: string;
    }[];
  };
};

type Props = {
  company: Company | null;
};

export const CompanyCard: FC<Props> = ({ company }) => {
  const { edit } = useNavigation();
  const { mutate } = useDelete();

  if (!company) return <CompanyCardSkeleton />;

  const relatedContactAvatars = company?.contacts?.nodes?.map((contact) => {
    return {
      name: contact.name,
      src: contact.avatar_url as string | undefined,
    };
  });

  return (
    <Card
      size="small"
      actions={[
        <div
          key="1"
          style={{
            width: "100%",
            height: "60px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: "0 16px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "6px",
            }}
          >
            <Text size="xs">Related contacts</Text>
            <AvatarGroup
              size={"small"}
              overlap
              gap="4px"
              avatars={relatedContactAvatars}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "6px",
            }}
          >
            <Text size="xs">Sales owner</Text>
            <Tooltip
              title={company.sales_owner?.name}
              key={company.sales_owner?.id}
            >
              <CustomAvatar
                name={company.sales_owner?.name}
                src={company.sales_owner?.avatar_url}
              />
            </Tooltip>
          </div>
        </div>,
      ]}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
        }}
      >
        <Dropdown
          menu={{
            items: [
              {
                label: "View company",
                key: "1",
                icon: <EyeOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />,
                onClick: () => {
                  edit("companies", company.id);
                },
              },
              {
                danger: true,
                label: "Delete company",
                key: "2",
                icon: <DeleteOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />,
                onClick: () => {
                  mutate({
                    resource: "companies",
                    id: company.id,
                  });
                },
              },
            ],
          }}
          placement="bottom"
          arrow
        >
          <Button
            type="text"
            shape="circle"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
            }}
            icon={<MoreOutlined style={{ transform: "rotate(90deg)" }} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />}
          />
        </Dropdown>

        <CustomAvatar
          name={company.name}
          src={company.avatar_url}
          shape="square"
          style={{
            width: "48px",
            height: "48px",
          }}
        />
        <Text
          strong
          size="md"
          ellipsis={{ tooltip: company.name }}
          style={{
            marginTop: "12px",
          }}
        >
          {company.name}
        </Text>

        <Space
          direction="vertical"
          size={0}
          style={{
            marginTop: "8px",
            alignItems: "center",
          }}
        >
          <Text type="secondary">Open deals amount</Text>
          <Text
            strong
            size="md"
            style={{
              marginTop: "12px",
            }}
          >
            {currencyNumber(company?.dealsAggregate?.[0].sum?.value || 0)}
          </Text>
        </Space>
      </div>
    </Card>
  );
};
