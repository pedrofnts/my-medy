import { useEffect } from "react";

import { useModalForm } from "@refinedev/antd";
import { type HttpError, useInvalidate, useNavigation } from "@refinedev/core";

import { DatePicker, Form, Input, Modal } from "antd";
import dayjs from "dayjs";

import type { Deal } from "@/graphql/schema.types";

import { finalizeDeal } from "./queries";

type FormValues = {
  notes?: string;
  closeDate?: dayjs.Dayjs;
  closeDateMonth?: number;
  closeDateDay?: number;
  closeDateYear?: number;
};

export const SalesFinalizeDeal = () => {
  const invalidate = useInvalidate();
  const { list } = useNavigation();

  const { formProps, modalProps, close, queryResult } = useModalForm<
    Deal,
    HttpError,
    FormValues
  >({
    action: "edit",
    defaultVisible: true,
    queryFn: finalizeDeal,
    onMutationSuccess: () => {
      invalidate({ invalidates: ["list"], resource: "deals" });
    },
    successNotification: () => {
      return {
        key: "edit-deal",
        type: "success",
        message: "Successfully updated deal",
        description: "Successful",
      };
    },
  });

  useEffect(() => {
    const month =
      queryResult?.data?.close_date_month ?? new Date().getMonth();
    const day = queryResult?.data?.close_date_day ?? new Date().getDate();
    const year =
      queryResult?.data?.close_date_year ?? new Date().getFullYear();

    formProps.form?.setFieldsValue({
      closeDate: dayjs(new Date(year, month - 1, day)),
    });
  }, [queryResult?.data]);

  return (
    <Modal
      {...modalProps}
      onCancel={() => {
        close();
        list("deals", "replace");
      }}
      title="Add more details"
      width={512}
    >
      <Form
        {...formProps}
        layout="vertical"
        onFinish={(values) => {
          formProps.onFinish?.({
            notes: values.notes,
            closeDateDay: dayjs(values.closeDate).get("date"),
            closeDateMonth: dayjs(values.closeDate).get("month") + 1,
            closeDateYear: dayjs(values.closeDate).get("year"),
          });
        }}
      >
        <Form.Item label="Notes" name="notes" rules={[{ required: true }]}>
          <Input.TextArea rows={6} />
        </Form.Item>
        <Form.Item
          label="Closed date"
          name="closeDate"
          rules={[{ required: true }]}
          getValueProps={(value) => {
            if (!value) return { value: undefined };
            return { value: value };
          }}
        >
          <DatePicker />
        </Form.Item>
      </Form>
    </Modal>
  );
};
