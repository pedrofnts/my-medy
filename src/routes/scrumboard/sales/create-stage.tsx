import { useModalForm } from "@refinedev/antd";
import { useCreate,useInvalidate, useNavigation } from "@refinedev/core";

import { Form, Input, Modal } from "antd";

import { createDealStage } from "./queries";

export const SalesCreateStage = () => {
  const invalidate = useInvalidate();
  const { list } = useNavigation();
  const { formProps, modalProps, close } = useModalForm({
    action: "create",
    defaultVisible: true,
    resource: "dealStages",
    onMutationSuccess: () => {
      invalidate({ invalidates: ["list"], resource: "deals" });
    },
    successNotification: () => {
      return {
        key: "create-stage",
        type: "success",
        message: "Successfully created stage",
        description: "Successful",
      };
    },
  });

  const { mutateAsync: createMutateAsync } = useCreate();

  return (
    <Modal
      {...modalProps}
      onCancel={() => {
        close();
        list("deals", "replace");
      }}
      title="Add new stage"
      width={512}
    >
      <Form
        {...formProps}
        layout="vertical"
        onFinish={async (values) => {
          await createMutateAsync({
            resource: "dealStages",
            values,
            queryFn: createDealStage,
          });

          formProps.onFinish?.(values);
        }}
      >
        <Form.Item label="Title" name="title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};
