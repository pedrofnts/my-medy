import { useModalForm } from "@refinedev/antd";
import { useInvalidate, useNavigation } from "@refinedev/core";

import { Form, Input, Modal } from "antd";

import { updateDealStage } from "./queries";

export const SalesEditStage = () => {
  const invalidate = useInvalidate();
  const { list } = useNavigation();

  const { formProps, modalProps, close } = useModalForm({
    action: "edit",
    defaultVisible: true,
    resource: "dealStages",
    queryFn: updateDealStage,
    onMutationSuccess: () => {
      invalidate({ invalidates: ["list"], resource: "deals" });
    },
    successNotification: () => {
      return {
        key: "edit-stage",
        type: "success",
        message: "Successfully updated stage",
        description: "Successful",
      };
    },
  });

  return (
    <Modal
      {...modalProps}
      onCancel={() => {
        list("deals", "replace");
        close();
      }}
      title="Edit stage"
      width={512}
    >
      <Form {...formProps} layout="vertical">
        <Form.Item label="Title" name="title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};
