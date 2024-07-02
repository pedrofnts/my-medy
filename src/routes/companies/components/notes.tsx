import type { FC } from "react";
import { useParams } from "react-router-dom";

import { DeleteButton, useForm } from "@refinedev/antd";
import {
  type HttpError,
  useGetIdentity,
  useInvalidate,
  useList,
  useParsed,
} from "@refinedev/core";

import { LoadingOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Space, Typography } from "antd";
import dayjs from "dayjs";

import { CustomAvatar, Text, TextIcon } from "@/components";
import type { User } from "@/graphql/schema.types";

import {
  createCompanyNote,
  fetchCompanyNotes,
  updateCompanyNote,
} from "./queries";

type Props = {
  style?: React.CSSProperties;
};

type CompanyNote = {
  id: number;
  note: string;
  created_at: string;
  created_by: {
    id: number;
    name: string;
    avatar_url: string;
  };
};

export const CompanyNotes: FC<Props> = ({ style }) => {
  return (
    <Card
      bodyStyle={{
        padding: "0",
      }}
      headStyle={{
        borderBottom: "1px solid #D9D9D9",
      }}
      title={
        <Space size={16}>
          <TextIcon
            style={{
              width: "24px",
              height: "24px",
            }}
          />
          <Text>Notes</Text>
        </Space>
      }
      style={style}
    >
      <CompanyNoteForm />
      <CompanyNoteList />
    </Card>
  );
};

export const CompanyNoteForm = () => {
  const { id: companyId } = useParsed();

  const { data: me } = useGetIdentity<User>();

  const { formProps, onFinish, form, formLoading } = useForm<
    CompanyNote,
    HttpError,
    { note: string }
  >({
    action: "create",
    resource: "companyNotes",
    queryOptions: {
      enabled: false,
    },
    redirect: false,
    mutationMode: "optimistic",
    successNotification: () => ({
      key: "company-note",
      message: "Successfully added note",
      description: "Successful",
      type: "success",
    }),
    meta: {
      createNote: createCompanyNote,
    },
  });

  const handleOnFinish = async (values: { note: string }) => {
    if (!companyId) {
      return;
    }

    const note = values.note.trim();
    if (!note) {
      return;
    }

    try {
      await createCompanyNote(
        note,
        parseInt(companyId, 10),
        me?.id ?? 0
      );

      form.resetFields();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "1rem",
        borderBottom: "1px solid #F0F0F0",
      }}
    >
      <CustomAvatar
        style={{ flexShrink: 0 }}
        name={me?.name}
        src={me?.avatar_url}
      />
      <Form {...formProps} style={{ width: "100%" }} onFinish={handleOnFinish}>
        <Form.Item
          name="note"
          noStyle
          rules={[
            {
              required: true,
              transform(value) {
                return value?.trim();
              },
              message: "Please enter a note",
            },
          ]}
        >
          <Input
            placeholder="Add your note"
            style={{ backgroundColor: "#fff" }}
            // @ts-expect-error Ant Design Icon's v5.0.1 has an issue with @types/react@^18.2.66
            addonAfter={formLoading && <LoadingOutlined />}
          />
        </Form.Item>
      </Form>
    </div>
  );
};

export const CompanyNoteList = () => {
  const params = useParams();

  const invalidate = useInvalidate();

  const { data: notes } = useList<CompanyNote>({
    resource: "companyNotes",
    sorters: [
      {
        field: "updatedAt",
        order: "desc",
      },
    ],
    filters: [{ field: "company.id", operator: "eq", value: params.id }],
    meta: {
      fetchNotes: fetchCompanyNotes,
    },
  });

  const { formProps, setId, id, saveButtonProps } = useForm<
    CompanyNote,
    HttpError,
    { note: string }
  >({
    resource: "companyNotes",
    action: "edit",
    queryOptions: {
      enabled: false,
    },
    mutationMode: "optimistic",
    onMutationSuccess: () => {
      setId(undefined);
      invalidate({
        invalidates: ["list"],
        resource: "companyNotes",
      });
    },
    successNotification: () => ({
      key: "company-update-note",
      message: "Successfully updated note",
      description: "Successful",
      type: "success",
    }),
    meta: {
      updateNote: updateCompanyNote,
    },
  });

  const { data: me } = useGetIdentity<User>();

  return (
    <Space
      size={16}
      direction="vertical"
      style={{
        borderRadius: "8px",
        backgroundColor: "#FAFAFA",
        padding: "1rem",
        width: "100%",
      }}
    >
      {notes?.map((item) => {
        const isMe = me?.id === item.created_by.id;

        return (
          <div key={item.id} style={{ display: "flex", gap: "12px" }}>
            <CustomAvatar
              style={{ flexShrink: 0 }}
              name={item.created_by.name}
              src={item.created_by.avatar_url}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: 500 }}>{item.created_by.name}</Text>
                <Text size="xs" style={{ color: "#000000a6" }}>
                  {dayjs(item.created_at).format("MMMM D, YYYY - h:ma")}
                </Text>
              </div>

              {id === item.id ? (
                <Form {...formProps} initialValues={{ note: item.note }}>
                  <Form.Item
                    name="note"
                    rules={[
                      {
                        required: true,
                        transform(value) {
                          return value?.trim();
                        },
                        message: "Please enter a note",
                      },
                    ]}
                  >
                    <Input.TextArea
                      autoFocus
                      required
                      minLength={1}
                      style={{
                        boxShadow:
                          "0px 1px 2px 0px rgba(0, 0, 0, 0.03), 0px 1px 6px -1px rgba(0, 0, 0, 0.02), 0px 2px 4px 0px rgba(0, 0, 0, 0.02)",
                        backgroundColor: "#fff",
                        width: "100%",
                      }}
                    />
                  </Form.Item>
                </Form>
              ) : (
                <Typography.Paragraph
                  style={{
                    boxShadow:
                      "0px 1px 2px 0px rgba(0, 0, 0, 0.03), 0px 1px 6px -1px rgba(0, 0, 0, 0.02), 0px 2px 4px 0px rgba(0, 0, 0, 0.02)",
                    background: "#fff",
                    borderRadius: "6px",
                    padding: "8px",
                    marginBottom: 0,
                  }}
                  ellipsis={{ rows: 3, expandable: true }}
                >
                  {item.note}
                </Typography.Paragraph>
              )}

              {isMe && !id && (
                <Space size={16}>
                  <Typography.Link
                    type="secondary"
                    style={{
                      fontSize: "12px",
                    }}
                    onClick={() => setId(item.id)}
                  >
                    Edit
                  </Typography.Link>
                  <DeleteButton
                    resource="companyNotes"
                    recordItemId={item.id}
                    size="small"
                    type="link"
                    successNotification={() => ({
                      key: "company-delete-note",
                      message: "Successfully deleted note",
                      description: "Successful",
                      type: "success",
                    })}
                    icon={null}
                    className="ant-typography secondary"
                    style={{
                      fontSize: "12px",
                    }}
                  />
                </Space>
              )}

              {id === item.id && (
                <Space>
                  <Button size="small" onClick={() => setId(undefined)}>
                    Cancel
                  </Button>
                  <Button size="small" type="primary" {...saveButtonProps}>
                    Save
                  </Button>
                </Space>
              )}
            </div>
          </div>
        );
      })}
    </Space>
  );
};
