import { useEffect } from "react";

import { useModalForm, useSelect } from "@refinedev/antd";
import { type HttpError, useNavigation } from "@refinedev/core";
import type { GetFields, GetFieldsFromList } from "@refinedev/nestjs-query";

import { DollarOutlined } from "@ant-design/icons";
import { Col, Form, Input, InputNumber, Modal, Row, Select } from "antd";

import { SelectOptionWithAvatar } from "@/components";
import type { DealUpdateInput } from "@/graphql/schema.types";
import { useContactsSelect } from "@/hooks/useContactsSelect";
import { useDealStagesSelect } from "@/hooks/useDealStagesSelect";
import { useUsersSelect } from "@/hooks/useUsersSelect";

import {
  fetchSalesCompanies,
    fetchUpdateDeal,
} from "./queries";

export const SalesEditPage = () => {
  const { list } = useNavigation();

  const { formProps, modalProps, close, queryResult } = useModalForm<
    GetFields<typeof fetchUpdateDeal>,
    HttpError,
    DealUpdateInput
  >({
    action: "edit",
    defaultVisible: true,
    queryFn: fetchUpdateDeal,
  });

  const {
    selectProps: companySelectProps,
    queryResult: companySelectQueryResult,
  } = useSelect<GetFieldsFromList<typeof fetchSalesCompanies>>({
    resource: "companies",
    optionLabel: "name",
    queryFn: fetchSalesCompanies,
  });

  const { selectProps: stageSelectProps } = useDealStagesSelect();

  const { selectProps: userSelectProps, queryResult: userSelectQueryResult } =
    useUsersSelect();

  const deal = queryResult?.data?.data;

  const companyIdField = Form.useWatch("company_id", formProps.form);

  useEffect(() => {
    if (deal?.company?.id !== companyIdField) {
      formProps.form?.setFieldValue(["deal_contact_id"], undefined);
    }
  }, [companyIdField]);

  const {
    selectProps: contactSelectProps,
    queryResult: contactsSelectQueryResult,
  } = useContactsSelect({
    filters: [
      {
        field: "company.id",
        operator: "eq",
        value: companyIdField,
      },
    ],
  });

  const renderContactForm = () => {
    if (companySelectQueryResult.isLoading) {
      return null;
    }

    const hasContact =
      deal?.company?.contacts?.length !== undefined &&
      deal?.company.contacts.length > 0;

    if (hasContact) {
      const options = contactsSelectQueryResult?.data?.map((contact) => ({
        label: (
          <SelectOptionWithAvatar
            name={contact.name}
            avatarUrl={contact.avatar_url ?? undefined}
          />
        ),
        value: contact.id,
      }));

      return (
        <Form.Item
          label="Deal contact"
          name={["deal_contact_id"]}
          trigger=""
          rules={[{ required: true }]}
          initialValue={deal?.deal_contact?.id}
          dependencies={["company_id"]}
          preserve={false}
        >
          <Select {...contactSelectProps} options={options} />
        </Form.Item>
      );
    }

    return null;
  };

  return (
    <Modal
      {...modalProps}
      onCancel={() => {
        close();
        list("deals", "replace");
      }}
      title="Edit deal"
      width={512}
    >
      <Form {...formProps} layout="vertical" preserve={false}>
        <Form.Item label="Deal title" name="title" rules={[{ required: true }]}>
          <Input placeholder="Please enter deal title" />
        </Form.Item>
        <Form.Item
          label="Company"
          initialValue={deal?.company?.id}
          name={["company_id"]}
          rules={[{ required: true }]}
          dependencies={["deal_contact_id"]}
        >
          <Select
            placeholder="Please select company"
            {...companySelectProps}
            options={
              companySelectQueryResult.data?.map((company) => ({
                value: company.id,
                label: (
                  <SelectOptionWithAvatar
                    name={company.name}
                    shape="square"
                    avatarUrl={company.avatar_url ?? undefined}
                  />
                ),
              })) ?? []
            }
          />
        </Form.Item>
        {renderContactForm()}
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="Stage" name="deal_stage_id">
              <Select
                placeholder="Please select stage"
                {...stageSelectProps}
                showSearch={false}
                options={stageSelectProps.options?.concat({
                  label: "UNASSIGNED",
                  value: null,
                })}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Deal value" name="value">
              <InputNumber
                min={0}
                addonBefore={<DollarOutlined />}
                placeholder="0,00"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          label="Deal owner"
          name="deal_owner_id"
          rules={[{ required: true }]}
        >
          <Select
            placeholder="Please select user"
            {...userSelectProps}
            options={
              userSelectQueryResult.data?.map((user) => ({
                value: user.id,
                label: (
                  <SelectOptionWithAvatar
                    name={user.name}
                    avatarUrl={user.avatar_url ?? undefined}
                  />
                ),
              })) ?? []
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
