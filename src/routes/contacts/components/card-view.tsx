import { useMemo } from "react";

import { List, type ListProps, type TableProps } from "antd";

import { PaginationTotal } from "@/components";
import type { Contact } from "@/types";

import { ContactCard, ContactCardSkeleton } from "./card";

type Props = {
  tableProps: TableProps<Contact>;
  setCurrent: (current: number) => void;
  setPageSize: (pageSize: number) => void;
};

export const CardView: React.FC<Props> = ({
  tableProps: { dataSource, pagination, loading },
  setCurrent,
  setPageSize,
}) => {
  const data = useMemo(() => {
    return (dataSource || []).map(contact => ({
      ...contact,
      id: contact.id.toString(),
    }));
  }, [dataSource]);

  return (
    <List
      grid={{
        gutter: 32,
        column: 4,
        xs: 1,
        sm: 1,
        md: 2,
        lg: 2,
        xl: 4,
      }}
      dataSource={data}
      renderItem={(item) => (
        <List.Item>
          <ContactCard contact={item} />
        </List.Item>
      )}
      pagination={{
        ...(pagination as ListProps<Contact>["pagination"]),
        hideOnSinglePage: true,
        itemRender: undefined,
        position: "bottom",
        style: { display: "flex", marginTop: "1rem" },
        pageSizeOptions: ["12", "24", "48"],
        onChange: (page, pageSize) => {
          setCurrent(page);
          setPageSize(pageSize);
        },
        showTotal: (total) => (
          <PaginationTotal total={total} entityName="contacts" />
        ),
      }}
    >
      {loading ? (
        <List
          grid={{
            gutter: 32,
            column: 4,
            xs: 1,
            sm: 1,
            md: 2,
            lg: 2,
            xl: 4,
          }}
          dataSource={Array.from({ length: 12 }).map((_, i) => ({
            id: i.toString(),
          }))}
          renderItem={() => (
            <List.Item>
              <ContactCardSkeleton />
            </List.Item>
          )}
        />
      ) : undefined}
    </List>
  );
};
