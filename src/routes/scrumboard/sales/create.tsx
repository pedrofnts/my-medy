import { type FC, type PropsWithChildren, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

import { useModalForm, useSelect } from "@refinedev/antd";
import { type HttpError, useCreate, useGetIdentity, useNavigation } from "@refinedev/core";

import { DollarOutlined, MailOutlined, PlusCircleOutlined, UserOutlined } from "@ant-design/icons";
import { Col, Form, Input, InputNumber, Modal, Row, Select, Typography } from "antd";

import { SelectOptionWithAvatar } from "@/components";
import type { Contact, Deal, User } from "@/graphql/schema.types";
import { useCompaniesSelect } from "@/hooks/useCompaniesSelect";
import { useDealStagesSelect } from "@/hooks/useDealStagesSelect";
import { useUsersSelect } from "@/hooks/useUsersSelect";

import { createContact } from "./queries";

type FormValues = {
  stage_id?: number | null;
  company_id?: number;
  deal_contact_id?: number;
  deal_owner_id?: string; // UUID
  title?: string;
  contact_name?: string;
  contact_email?: string;
};

export const SalesCreatePage: FC<PropsWithChildren> = ({ children }) => {
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const { list, replace } = useNavigation();

  const { formProps, modalProps, close } = useModalForm<Deal, HttpError, FormValues>({
    action: "create",
    defaultVisible: true,
  });

  useEffect(() => {
    const stage_id = searchParams.get("stageId");
    const company_id = searchParams.get("companyId");

    if (stage_id) {
      formProps.form?.setFieldsValue({
        stage_id: parseInt(stage_id, 10),
      });
    }

    if (company_id && company_id !== "null") {
      formProps.form?.setFieldsValue({
        company_id: parseInt(company_id, 10),
      });
    }
  }, [searchParams]);

  const { selectProps: companySelectProps, queryResult: companyQueryResult } = useCompaniesSelect();
  const { selectProps: stageSelectProps } = useDealStagesSelect();
  const { selectProps: userSelectProps, queryResult: userQueryResult } = useUsersSelect();
  const { data: user } = useGetIdentity<User>();
  const { mutateAsync: createMutateAsync } = useCreate<Contact>();

  const company_id = Form.useWatch("company_id", formProps.form);

  useEffect(() => {
    formProps.form?.setFieldValue("deal_contact_id", undefined);
  }, [company_id]);

  const renderContactForm = () => {
    if (!company_id) {
      return null;
    }

    const selectedCompany = companyQueryResult.data?.data?.find((company: any) => company.id === company_id);
    console.log("Selected Company: ", selectedCompany);

    const hasContact = selectedCompany?.contacts?.length > 0;

    if (hasContact) {
      const options = selectedCompany.contacts.map((contact: any) => ({
        label: <SelectOptionWithAvatar name={contact.name} avatarUrl={contact.avatar_url ?? undefined} />,
        value: contact.id,
      }));

      return (
        <Form.Item label="Deal contact" name="deal_contact_id" rules={[{ required: true }]}>
          <Select options={options} />
        </Form.Item>
      );
    }

    return (
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item label="Contact name" name="contact_name" rules={[{ required: true }]}>
            <Input addonBefore={<UserOutlined />} placeholder="Contact name" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Contact email" name="contact_email" rules={[{ required: true }]}>
            <Input addonBefore={<MailOutlined />} placeholder="Contact email" />
          </Form.Item>
        </Col>
      </Row>
    );
  };

  const isHaveOverModal = pathname === "/scrumboard/sales/create/company/create";

  console.log("Company Query Result: ", companyQueryResult);
  console.log("User Query Result: ", userQueryResult);

  return (
    <>
      <Modal
        {...modalProps}
        style={{ display: isHaveOverModal ? "none" : "inherit" }}
        onCancel={() => {
          close();
          list("deals", "replace");
        }}
        title="Add new deal"
        width={512}
      >
        <Form
          {...formProps}
          layout="vertical"
          onFinish={async (values) => {
            if (values.contact_name && values.contact_email) {
              const { data } = await createMutateAsync({
                resource: "contacts",
                values: {
                  name: values.contact_name,
                  email: values.contact_email,
                  sales_owner_id: user?.id,
                  company_id: values.company_id,
                },
                queryFn: createContact,
              });

              delete values.contact_name;
              delete values.contact_email;

              if (data) {
                formProps.onFinish?.({
                  ...values,
                  deal_contact_id: data.id,
                  deal_owner_id: user?.id,
                });
              }
            } else {
              formProps.onFinish?.(values);
            }
          }}
        >
          <Form.Item label="Deal title" name="title" rules={[{ required: true }]}>
            <Input placeholder="Please enter deal title" />
          </Form.Item>
          <Form.Item
            label="Company"
            name="company_id"
            rules={[{ required: true }]}
            extra={
              <Typography.Link
                style={{ marginTop: 8, display: "block" }}
                onClick={() => replace("company/create?to=/scrumboard/sales/create")}
              >
                <PlusCircleOutlined /> Add new company
              </Typography.Link>
            }
          >
            <Select
              placeholder="Please select company"
              {...companySelectProps}
              options={
                Array.isArray(companyQueryResult?.data?.data)
                  ? companyQueryResult.data.data.map((company: any) => ({
                      value: company.id,
                      label: (
                        <SelectOptionWithAvatar
                          name={company.name}
                          shape="square"
                          avatarUrl={company.avatar_url ?? undefined}
                        />
                      ),
                    }))
                  : []
              }
            />
          </Form.Item>
          {renderContactForm()}
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Stage" name="stage_id">
                <Select
                  placeholder="Please select stage"
                  {...stageSelectProps}
                  showSearch={false}
                  options={Array.isArray(stageSelectProps?.options)
                    ? stageSelectProps.options.concat({
                        label: "UNASSIGNED",
                        value: "unassigned",
                      })
                    : []
                }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item rules={[{ required: true }]} label="Deal value" name="value">
                <InputNumber
                  min={0}
                  addonBefore={<DollarOutlined />}
                  placeholder="0,00"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Deal owner" name="deal_owner_id" rules={[{ required: true }]}>
            <Select
              placeholder="Please select user"
              {...userSelectProps}
              options={
                Array.isArray(userQueryResult?.data?.data)
                  ? userQueryResult.data.data.map((user: any) => ({
                      value: user.id,
                      label: (
                        <SelectOptionWithAvatar name={user.name} avatarUrl={user.avatar_url ?? undefined} />
                      ),
                    }))
                  : []
              }
            />
          </Form.Item>
        </Form>
      </Modal>
      {children}
    </>
  );
};
