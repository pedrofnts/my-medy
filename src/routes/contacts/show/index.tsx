import React, { useEffect,useState } from 'react';
import { useParams } from "react-router-dom";

import { useDelete,useNavigation, useUpdate } from "@refinedev/core";

import {
    CloseOutlined,
    DeleteOutlined,
    EditOutlined,
    GlobalOutlined,
    IdcardOutlined,
    MailOutlined,
    PhoneOutlined,
    ShopOutlined,
} from "@ant-design/icons";
import { Button, Card, Drawer, Form, Input, Popconfirm, Select, Space, Spin, Typography } from "antd";
import dayjs from "dayjs";

import {
    CustomAvatar,
    SelectOptionWithAvatar,
    SingleElementForm,
    Text,
    TextIcon,
} from "@/components";
import { TimezoneEnum } from "@/enums";
import type { Contact } from "@/graphql/schema.types";
import { useCompaniesSelect } from "@/hooks/useCompaniesSelect";
import { useUsersSelect } from "@/hooks/useUsersSelect";

import { ContactComment, ContactStatus } from "../components";
import styles from "./index.module.css";
import { fetchContact } from "./queries";

const timezoneOptions = Object.keys(TimezoneEnum).map((key) => ({
    label: TimezoneEnum[key as keyof typeof TimezoneEnum],
    value: TimezoneEnum[key as keyof typeof TimezoneEnum],
}));

export const ContactShowPage: React.FC = () => {
    const [activeForm, setActiveForm] = useState<
        "email" | "company_id" | "job_title" | "phone" | "timezone"
    >();
    const { list } = useNavigation();
    const { mutate } = useUpdate<Contact>();
    const { mutate: deleteMutation } = useDelete<Contact>();
    const [contactData, setContactData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const { id: contactId } = useParams<{ id: string }>();
    const { selectProps: companySelectProps, queryResult: companySelectQueryResult } = useCompaniesSelect();
    const { selectProps: usersSelectProps, queryResult: usersSelectQueryResult } = useUsersSelect();

    useEffect(() => {
        const fetchContactData = async () => {
            try {
                const contactIdNumber = parseInt(contactId, 10);
                if (isNaN(contactIdNumber)) {
                    throw new Error("Invalid contact ID");
                }
                const data = await fetchContact(contactIdNumber);
                setContactData(data);
            } catch (error) {
                console.error("Error fetching contact", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContactData();
    }, [contactId]);

    const closeModal = () => {
        setActiveForm(undefined);
        list("contacts");
    };

    if (loading) {
        return (
            <Drawer
                open
                width={756}
                bodyStyle={{
                    background: "#f5f5f5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Spin />
            </Drawer>
        );
    }

    if (!contactData) {
        closeModal();
        return null;
    }

    const {
        id,
        name,
        email,
        job_title,
        phone,
        timezone,
        avatar_url,
        companies,
        created_at,
        sales_owners,
    } = contactData;

    return (
        <Drawer
            open
            onClose={() => closeModal()}
            width={756}
            bodyStyle={{ background: "#f5f5f5", padding: 0 }}
            headerStyle={{ display: "none" }}
        >
            <div className={styles.header}>
                <Button
                    type="text"
                    // @ts-expect-error Ant Design Icon's v5.0.1 has an issue with @types/react@^18.2.66
                    icon={<CloseOutlined />}
                    onClick={() => closeModal()}
                />
            </div>
            <div className={styles.container}>
                <div className={styles.name}>
                    <CustomAvatar
                        style={{
                            marginRight: "1rem",
                            flexShrink: 0,
                            fontSize: "40px",
                        }}
                        size={96}
                        src={avatar_url}
                        name={name}
                    />
                    <Typography.Title
                        level={3}
                        style={{ padding: 0, margin: 0, width: "100%" }}
                        className={styles.title}
                        editable={{
                            onChange(value) {
                                mutate({
                                    resource: "contacts",
                                    id,
                                    values: {
                                        name: value,
                                    },
                                    successNotification: false,
                                });
                            },
                            triggerType: ["text", "icon"],
                            // @ts-expect-error Ant Design Icon's v5.0.1 has an issue with @types/react@^18.2.66
                            icon: <EditOutlined className={styles.titleEditIcon} />,
                        }}
                    >
                        {name}
                    </Typography.Title>
                </div>

                <div className={styles.form}>
                    <SingleElementForm
                        // @ts-expect-error Ant Design Icon's v5.0.1 has an issue with @types/react@^18.2.66
                        icon={<MailOutlined className="tertiary" />}
                        state={
                            activeForm && activeForm === "email"
                                ? "form"
                                : email
                                    ? "view"
                                    : "empty"
                        }
                        itemProps={{
                            name: "email",
                            label: "Email",
                        }}
                        view={<Text>{email}</Text>}
                        onClick={() => setActiveForm("email")}
                        onUpdate={() => setActiveForm(undefined)}
                        onCancel={() => setActiveForm(undefined)}
                    >
                        <Input defaultValue={email} />
                    </SingleElementForm>

                    <SingleElementForm
                        // @ts-expect-error Ant Design Icon's v5.0.1 has an issue with @types/react@^18.2.66
                        icon={<ShopOutlined className="tertiary" />}
                        state={
                            activeForm && activeForm === "company_id"
                                ? "form"
                                : companies.id
                                    ? "view"
                                    : "empty"
                        }
                        itemProps={{
                            name: "company_id",
                            label: "Company",
                        }}
                        view={
                            <Space>
                                <CustomAvatar src={companies.avatar_url} name={companies.name} />
                                <Text>{companies.name}</Text>
                            </Space>
                        }
                        onClick={() => setActiveForm("company_id")}
                        onCancel={() => setActiveForm(undefined)}
                        onUpdate={() => {
                            setActiveForm(undefined);
                        }}
                        extra={
                            <Form.Item
                                name="sales_owner_id"
                                label="Sales Owner"
                                labelCol={{
                                    style: {
                                        marginTop: "0.8rem",
                                    },
                                }}
                            >
                                <Select
                                    style={{
                                        width: "100%",
                                    }}
                                    defaultValue={{
                                        label: sales_owners.name,
                                        value: sales_owners.id,
                                    }}
                                    {...usersSelectProps}
                                    options={
                                        usersSelectQueryResult.data?.data?.map(
                                            ({ id, name, avatar_url }) => ({
                                                value: id,
                                                label: (
                                                    <SelectOptionWithAvatar
                                                        name={name}
                                                        avatarUrl={avatar_url ?? undefined}
                                                    />
                                                ),
                                            }),
                                        ) ?? []
                                    }
                                />
                            </Form.Item>
                        }
                    >
                        <Select
                            style={{ width: "100%" }}
                            defaultValue={{
                                label: contactData.companies.name,
                                value: contactData.companies.id,
                            }}
                            {...companySelectProps}
                            options={
                                companySelectQueryResult.data?.data?.map(
                                    ({ id, name, avatar_url }) => ({
                                        value: id,
                                        label: (
                                            <SelectOptionWithAvatar
                                                name={name}
                                                avatarUrl={avatar_url ?? undefined}
                                            />
                                        ),
                                    }),
                                ) ?? []
                            }
                        />
                    </SingleElementForm>
                    <SingleElementForm
                        // @ts-expect-error Ant Design Icon's v5.0.1 has an issue with @types/react@^18.2.66
                        icon={<IdcardOutlined className="tertiary" />}
                        state={
                            activeForm && activeForm === "job_title"
                                ? "form"
                                : job_title
                                    ? "view"
                                    : "empty"
                        }
                        itemProps={{
                            name: "job_title",
                            label: "Title",
                        }}
                        view={<Text>{job_title}</Text>}
                        onClick={() => setActiveForm("job_title")}
                        onUpdate={() => setActiveForm(undefined)}
                        onCancel={() => setActiveForm(undefined)}
                    >
                        <Input defaultValue={job_title || ""} />
                    </SingleElementForm>
                    <SingleElementForm
                        // @ts-expect-error Ant Design Icon's v5.0.1 has an issue with @types/react@^18.2.66
                        icon={<PhoneOutlined className="tertiary" />}
                        state={
                            activeForm && activeForm === "phone"
                                ? "form"
                                : phone
                                    ? "view"
                                    : "empty"
                        }
                        itemProps={{
                            name: "phone",
                            label: "Phone",
                        }}
                        view={<Text>{phone}</Text>}
                        onClick={() => setActiveForm("phone")}
                        onUpdate={() => setActiveForm(undefined)}
                        onCancel={() => setActiveForm(undefined)}
                    >
                        <Input defaultValue={phone || ""} />
                    </SingleElementForm>
                    <SingleElementForm
                        style={{ borderBottom: "none" }}
                        // @ts-expect-error Ant Design Icon's v5.0.1 has an issue with @types/react@^18.2.66
                        icon={<GlobalOutlined className="tertiary" />}
                        state={
                            activeForm && activeForm === "timezone"
                                ? "form"
                                : timezone
                                    ? "view"
                                    : "empty"
                        }
                        itemProps={{
                            name: "timezone",
                            label: "TimezoneEnum",
                        }}
                        view={<Text>{timezone}</Text>}
                        onClick={() => setActiveForm("timezone")}
                        onUpdate={() => setActiveForm(undefined)}
                        onCancel={() => setActiveForm(undefined)}
                    >
                        <Select
                            style={{ width: "100%" }}
                            options={timezoneOptions}
                            defaultValue={contactData.timezone}
                        />
                    </SingleElementForm>
                </div>

                <div className={styles.stage}>
                    <ContactStatus contact={contactData} />
                </div>

                <Card
                    title={
                        <>
                            <TextIcon />
                            <Text style={{ marginLeft: ".8rem" }}>Notes</Text>
                        </>
                    }
                    bodyStyle={{
                        padding: 0,
                    }}
                >
                    <ContactComment />
                </Card>

                <div className={styles.actions}>
                    <Text className="ant-text tertiary">
                        Created on: {dayjs(created_at).format("MMMM DD, YYYY")}
                    </Text>

                    <Popconfirm
                        title="Delete the contact"
                        description="Are you sure to delete this contact?"
                        onConfirm={() => {
                            deleteMutation(
                                {
                                    id,
                                    resource: "contacts",
                                },
                                {
                                    onSuccess: () => closeModal(),
                                },
                            );
                        }}
                        okText="Yes"
                        cancelText="No"
                    >
                        {/* @ts-expect-error Ant Design Icon's v5.0.1 has an issue with @types/react@^18.2.66 */}
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            Delete Contact
                        </Button>
                    </Popconfirm>
                </div>
            </div>
        </Drawer>
    );
};
