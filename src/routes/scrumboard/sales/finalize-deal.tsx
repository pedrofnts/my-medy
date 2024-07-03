import { useEffect } from "react";

import { useModalForm } from "@refinedev/antd";
import { useInvalidate, useNavigation } from "@refinedev/core";

import { DatePicker, Form, Input, Modal } from "antd";
import dayjs from "dayjs";

import type { Database } from "@/types/supabase";

type Deal = Database["public"]["Tables"]["deals"]["Row"];

type FormValues = {
  notes?: string;
  closeDate?: dayjs.Dayjs;
};

type SalesFinalizeDealProps = {
  dealId: number;
  onClose: () => void;
};

export const SalesFinalizeDeal: React.FC<SalesFinalizeDealProps> = ({ dealId, onClose }) => {
  const invalidate = useInvalidate();
  const { list } = useNavigation();

  const { formProps, modalProps, close, queryResult } = useModalForm<Deal>({
    action: "edit",
    resource: "deals",
    id: dealId.toString(),
    defaultVisible: true,
    onMutationSuccess: () => {
      invalidate({ invalidates: ["list"], resource: "deals" });
      onClose();
    },
    successNotification: () => ({
      key: "edit-deal",
      type: "success",
      message: "Successfully updated deal",
      description: "Successful",
    }),
  });

  useEffect(() => {
    const data = queryResult?.data;
    if (data) {
      const closeDate = data.close_date_year && data.close_date_month && data.close_date_day
        ? dayjs(new Date(data.close_date_year, data.close_date_month - 1, data.close_date_day))
        : undefined;

      formProps.form?.setFieldsValue({
        closeDate: closeDate,
        notes: data.notes ?? '',
      });
    }
  }, [queryResult?.data, formProps.form]);

  return (
    <Modal
      {...modalProps}
      onCancel={() => {
        close();
        onClose();
      }}
      title="Finalize Deal"
      width={512}
    >
      <Form
        {...formProps}
        layout="vertical"
        onFinish={(values: FormValues) => {
          const closeDate = values.closeDate ? dayjs(values.closeDate) : undefined;

          formProps.onFinish?.({
            id: dealId,
            notes: values.notes,
            close_date_day: closeDate ? closeDate.date() : null,
            close_date_month: closeDate ? closeDate.month() + 1 : null,
            close_date_year: closeDate ? closeDate.year() : null,
            stage_id: 2, // Assumindo que 2 é o ID do estágio "LOST"
          });
        }}
      >
        <Form.Item label="Notes" name="notes" rules={[{ required: true }]}>
          <Input.TextArea rows={6} />
        </Form.Item>
        <Form.Item
          label="Closed date"
          name="closeDate"
          rules={[{ required: false }]}
          getValueProps={(value) => ({ value: value ? dayjs(value) : undefined })}
        >
          <DatePicker />
        </Form.Item>
      </Form>
    </Modal>
  );
};