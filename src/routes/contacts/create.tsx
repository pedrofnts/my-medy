import React, { type PropsWithChildren, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

import { useForm } from "@refinedev/antd";
import { useGetIdentity, useNavigation } from "@refinedev/core";

import { PlusCircleOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Select } from "antd";

import { SelectOptionWithAvatar } from "@/components";
import type { User } from "@/graphql/schema.types";
import { useCompaniesSelect } from "@/hooks/useCompaniesSelect";

export const ContactCreatePage: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const { list, replace } = useNavigation();
  const { pathname } = useLocation();
  const { data: user } = useGetIdentity<User>();
  const [searchParams] = useSearchParams();
  const { formProps, saveButtonProps, onFinish } = useForm({
    redirect: "list",
  });
  const { selectProps, queryResult } = useCompaniesSelect();

  useEffect(() => {
    const companyId = searchParams.get("companyId");

    if (companyId && companyId !== "null") {
      formProps.form?.setFieldsValue({
        company_id: companyId,
      });
    }
  }, [searchParams]);

  const isHaveOverModal = pathname === "/contacts/create/company-create";

  return (
    <>
      <Modal
        open
        title="Create Contact"
        style={{ display: isHaveOverModal ? "none" : "inherit" }}
        onCancel={() => {
          list("contacts", "replace");
        }}
        okText="Save"
        okButtonProps={{
          ...saveButtonProps,
        }}
        width={560}
      >
        <Form
          layout="vertical"
          {...formProps}
          onFinish={(values) => {
            onFinish({
              ...values,
              sales_owner_id: user?.id,
              status: "NEW", // Define o status como "NEW"
            });
          }}
        >
          <Form.Item
            label="Contact Name"
            name="name"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                type: "email",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Phone"
            name="phone"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Company"
            name="company_id"
            rules={[
              {
                required: true,
              },
            ]}
            help={
              <Button
                style={{ paddingLeft: 0 }}
                type="link"
                icon={
                  // @ts-expect-error Ant Design Icon's v5.0.1 has an issue with @types/react@^18.2.66
                  <PlusCircleOutlined />
                }
                onClick={() => {
                  replace("company-create?to=/contacts/create");
                }}
              >
                Add new company
              </Button>
            }
          >
            <Select
              {...selectProps}
              options={
                queryResult.data?.data?.map(({ id, name, avatarUrl }) => ({
                  value: id,
                  label: (
                    <SelectOptionWithAvatar
                      name={name}
                      avatarUrl={avatarUrl ?? undefined}
                    />
                  ),
                })) ?? []
              }
            />
          </Form.Item>
        </Form>
      </Modal>
      {children}
    </>
  );
};
