import React, { useEffect } from "react";

import { useModalForm } from "@refinedev/antd";
import { useCreate, useInvalidate, useNavigation } from "@refinedev/core";

import { Form, Input, Modal } from "antd";

interface SalesCreateStageProps {
  visible: boolean;
  onCancel: () => void;
}

export const SalesCreateStage: React.FC<SalesCreateStageProps> = ({ visible, onCancel }) => {
  const invalidate = useInvalidate();
  const { list } = useNavigation();

  const { formProps, modalProps, close } = useModalForm({
    action: "create",
    resource: "deal_stages",
    onMutationSuccess: () => {
      invalidate({ invalidates: ["list"], resource: "deals" });
      formProps.form?.resetFields();
    },
    successNotification: () => ({
      key: "create-stage",
      type: "success",
      message: "Successfully created stage",
      description: "Successful",
    }),
    errorNotification: (error) => ({
      key: "create-stage-error",
      type: "error",
      message: "Error creating stage",
      description: error?.message,
    }),
  });

  const { mutateAsync: createMutateAsync } = useCreate();

  const handleFormFinish = async (values: any) => {
    try {
      const { id, ...rest } = values;
      await createMutateAsync({
        resource: "deal_stages",
        values: rest,
      });
      formProps.form?.resetFields();
      close();
      onCancel();
      list("deals", "replace");
    } catch (error) {
      console.error("Error creating deal stage:", error);
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
      title="Add new stage"
      width={512}
    >
      <Form {...formProps} layout="vertical" onFinish={handleFormFinish}>
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Please input the stage title" }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};