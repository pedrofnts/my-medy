import React, { useState } from "react";

import { List, useTable } from "@refinedev/antd";
import { getDefaultFilter,type HttpError } from "@refinedev/core";

import {
  AppstoreOutlined,
  SearchOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Form, Grid, Input, Radio, Space, Spin } from "antd";
import debounce from "lodash/debounce";

import { ListTitleButton } from "@/components";
import { supabaseClient } from "@/providers/data/supabaseClient";

import { CardView, TableView } from "./components";

type Props = React.PropsWithChildren;
type View = "card" | "table";

export const ContactsListPage: React.FC<Props> = ({ children }) => {
  const [view, setView] = useState<View>("table");
  const screens = Grid.useBreakpoint();

  const {
    tableProps,
    searchFormProps,
    setCurrent,
    setPageSize,
    filters,
    sorters,
    setFilters,
    tableQueryResult,
  } = useTable<any, HttpError, { name: string }>({
    pagination: {
      pageSize: 12,
    },
    sorters: {
      initial: [
        {
          field: "created_at",
          order: "asc",
        },
      ],
    },
    filters: {
      initial: [
        {
          field: "name",
          value: undefined,
          operator: "contains",
        },
        {
          field: "email",
          value: undefined,
          operator: "contains",
        },
        {
          field: "company_id",
          value: undefined,
          operator: "eq",
        },
        {
          field: "job_title",
          value: undefined,
          operator: "contains",
        },
        {
          field: "status",
          value: undefined,
          operator: "in",
        },
      ],
    },
    onSearch: (values) => {
      return [
        {
          field: "name",
          operator: "contains",
          value: values.name,
        },
      ];
    },
    queryFn: async ({ pagination, filters, sorters }) => {
      let query = supabaseClient.from("contacts").select(`
        id,
        name,
        email,
        company_id,
        job_title,
        status,
        created_at,
        companies (id, avatar_url, name, business_type, company_size, country, website, sales_owner_id)
      `);

      if (pagination?.current && pagination?.pageSize) {
        query = query.range(
          (pagination.current - 1) * pagination.pageSize,
          pagination.current * pagination.pageSize - 1,
        );
      }

      if (filters) {
        filters.forEach((filter) => {
          if (filter.operator === "contains") {
            query = query.ilike(filter.field, `%${filter.value}%`);
          } else if (filter.operator === "eq") {
            query = query.eq(filter.field, filter.value);
          } else if (filter.operator === "in") {
            query = query.in(filter.field, filter.value);
          }
        });
      }

      if (sorters && sorters.length > 0) {
        sorters.forEach((sort) => {
          query = query.order(sort.field, { ascending: sort.order === "asc" });
        });
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return {
        data,
        total: data.length,
      };
    },
  });

  const onViewChange = (value: View) => {
    setView(value);
    setFilters([], "replace");
    // TODO: useForm should handle this automatically. remove this quando estiver corrigido no antd useForm.
    searchFormProps.form?.resetFields();
  };

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    searchFormProps?.onFinish?.({
      name: e.target.value,
    });
  };
  const debouncedOnChange = debounce(onSearch, 500);

  return (
    <div className="page-container">
      <List
        breadcrumb={false}
        headerButtons={() => {
          return (
            <Space
              style={{
                marginTop: screens.xs ? "1.6rem" : undefined,
              }}
            >
              <Form
                {...searchFormProps}
                initialValues={{
                  name: getDefaultFilter("name", filters, "contains"),
                }}
                layout="inline"
              >
                <Form.Item name="name" noStyle>
                  <Input
                    size="large"
                    prefix={<SearchOutlined className="anticon tertiary" />}
                    suffix={
                      <Spin
                        size="small"
                        spinning={tableQueryResult.isFetching}
                      />
                    }
                    placeholder="Search by name"
                    onChange={debouncedOnChange}
                  />
                </Form.Item>
              </Form>
              {!screens.xs ? (
                <Radio.Group
                  size="large"
                  value={view}
                  onChange={(e) => onViewChange(e.target.value)}
                >
                  <Radio.Button value="table">
                    <UnorderedListOutlined />
                  </Radio.Button>
                  <Radio.Button value="card">
                    <AppstoreOutlined />
                  </Radio.Button>
                </Radio.Group>
              ) : null}
            </Space>
          );
        }}
        contentProps={{
          style: {
            marginTop: "28px",
          },
        }}
        title={
          <ListTitleButton toPath="contacts" buttonText="Add new contact" />
        }
      >
        {screens.xs || view === "card" ? (
          <CardView
            tableProps={tableProps}
            setPageSize={setPageSize}
            setCurrent={setCurrent}
          />
        ) : (
          <TableView
            tableProps={tableProps}
            filters={filters}
            sorters={sorters}
          />
        )}
        {children}
      </List>
    </div>
  );
};
