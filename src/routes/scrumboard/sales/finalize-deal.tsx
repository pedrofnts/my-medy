import React, { useEffect } from "react";

import { useModalForm } from "@refinedev/antd";
import { useInvalidate, useNavigation, useUpdate } from "@refinedev/core";

import { DatePicker,Form, Input, Modal } from "antd";

interface SalesFinalizeDealProps {
  visible: boolean;
  onCancel: () => void;
  dealId?: string;
}

export const SalesFinalizeDeal: React.FC<SalesFinalizeDealProps> = ({ visible, onCancel, dealId }) => {
  const invalidate = useInvalidate();
  const { show } = useNavigation();

  const { formProps, modalProps, close, setId } = useModalForm({
    action: "edit",
    resource: "deals",
    id: dealId,
    onMutationSuccess: () => {
      invalidate({ invalidates: ["detail"], resource: "deals", id: dealId });
    },
    successNotification: () => ({
      key: "finalize-deal",
      type: "success",
      message: "Successfully finalized deal",
      description: "Successful",
    }),
    errorNotification: (error) => ({
      key: "finalize-deal-error",
      type: "error",
      message: "Error finalizing deal",
      description: error?.message,
    }),
  });

  const { mutateAsync: updateMutateAsync } = useUpdate();

  useEffect(() => {
    if (dealId) {
      setId(dealId);
    }
  }, [dealId, setId]);

  const handleFormFinish = async (values: any) => {
    try {
      await updateMutateAsync({
        resource: "deals",
        id: dealId,
        values: { ...values, status: "closed" },
      });
      formProps.form?.resetFields();
      close();
      onCancel();
      show("deals", dealId);
    } catch (error) {
      console.error("Error finalizing deal:", error);
    }
  };

  const resetForm = () => {
    formProps.form?.resetFields();
  };

  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  return (
    <Modal
      {...modalProps}
      open={visible}
      onCancel={() => {
        close();
        onCancel();
        resetForm();
      }}
      title="Finalize Deal"
      width={512}
    >
      <Form {...formProps} layout="vertical" onFinish={handleFormFinish}>
        <Form.Item label="Notes" name="notes">
          <Input.TextArea />
        </Form.Item>
        <Form.Item label="Closing Date" name="closing_date">
          <DatePicker />
        </Form.Item>
      </Form>
    </Modal>
  );
};
