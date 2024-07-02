import { type FC, type PropsWithChildren, useMemo } from "react";

import { useDelete, useList, useNavigation, useUpdate, useUpdateMany } from "@refinedev/core";

import { ClearOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import type { DragEndEvent } from "@dnd-kit/core";
import type { MenuProps } from "antd";

import { Text } from "@/components";
import { currencyNumber } from "@/utilities";

import { DealKanbanCardMemo, DealKanbanCardSkeleton, DealKanbanWonLostDrop, KanbanAddCardButton, KanbanAddStageButton, KanbanBoard, KanbanBoardSkeleton, KanbanColumn, KanbanColumnSkeleton, KanbanItem } from "../components";
import { fetchDeals, fetchSalesDealStages } from "./queries";

const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1));
const lastMonthISO = lastMonth.toISOString();

type DealStage = {
  id: string;
  title: string;
  created_at: string;
  dealsAggregate?: { sum?: { value: number } }[];
};

type Deal = {
  id: string;
  title: string;
  value: number;
  created_at: string;
  deal_stage_id: string | null;
  company: { id: string; name: string; avatarUrl: string };
  dealOwner: { id: string; name: string; avatarUrl: string };
};

type DealStageColumn = DealStage & { deals: Deal[] };

export const SalesPage: FC<PropsWithChildren> = ({ children }) => {
  const { replace, edit, create } = useNavigation();

  const { data: stages, isLoading: isLoadingStages, error: stagesError } = useList<DealStage>({
    resource: "deal_stages",
    pagination: { mode: "off" },
    sorters: [{ field: "created_at", order: "asc" }],
    queryFn: ({ filters, sorters, pagination }) => 
      fetchSalesDealStages(filters, sorters, { offset: pagination?.current, limit: pagination?.pageSize }),
    queryOptions: { enabled: true },
  });

  const { data: deals, isLoading: isLoadingDeals, error: dealsError } = useList<Deal>({
    resource: "deals",
    sorters: [{ field: "created_at", order: "asc" }],
    filters: [{ field: "created_at", operator: "gte", value: lastMonthISO }],
    queryOptions: { enabled: !!stages },
    pagination: { mode: "off" },
    queryFn: ({ filters, sorters }) => fetchDeals({ filters, sorters }),
  });

  const stageGrouped = useMemo(() => {
    if (!stages?.data || !deals?.data)
      return { stageUnassigned: null, stageAll: [], stageWon: null, stageLost: null };
    const stagesData = stages?.data;
    const dealsData = deals?.data;
  
    const stageUnassigned = dealsData.filter((deal) => deal.deal_stage_id === null);
    const grouped = stagesData.map((stage) => {
      const stageDeals = dealsData.filter((deal) => deal.deal_stage_id === stage.id);
      const totalValue = stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
      return {
        ...stage,
        deals: stageDeals.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
        dealsAggregate: [{ sum: { value: totalValue } }]
      };
    });
  
    const stageWon = grouped.find((stage) => stage.title === "WON");
    const stageLost = grouped.find((stage) => stage.title === "LOST");
    const stageAll = grouped.filter((stage) => stage.title !== "WON" && stage.title !== "LOST");
  
    return { stageUnassigned, stageAll, stageWon, stageLost };
  }, [stages, deals]);

  const { mutate: updateDeal } = useUpdate();
  const { mutate: updateManyDeal } = useUpdateMany();
  const { mutate: deleteStage } = useDelete();

  const { unassignedStageTotalValue } = useMemo(() => {
    let unassignedStageTotalValue = 0;
    stageGrouped?.stageUnassigned?.forEach((deal) => {
      unassignedStageTotalValue += deal.value || 0;
    });
    return { unassignedStageTotalValue };
  }, [stageGrouped.stageUnassigned]);

  const handleOnDragEnd = (event: DragEndEvent) => {
    let stageId = event.over?.id as undefined | string | null;
    const dealId = event.active.id;
    const dealStageId = event.active.data.current?.deal_stage_id;

    if (dealStageId === stageId) return;

    if (stageId === "won") stageId = stageGrouped.stageWon?.id;
    if (stageId === "lost") stageId = stageGrouped?.stageLost?.id;
    if (stageId === "unassigned") stageId = null;

    updateDeal(
      {
        resource: "deals",
        id: dealId,
        values: { deal_stage_id: stageId },
        successNotification: false,
        mutationMode: "optimistic",
      },
      {
        onSuccess: () => {
          const stage = event.over?.id as undefined | string | null;
          if (stage === "won" || stage === "lost") {
            edit("finalize-deals", dealId, "replace");
          }
        },
      },
    );
  };

  const handleAddStage = () => {
    create("deal_stages", "replace");
  };

  const handleEditStage = (args: { stageId: string }) => {
    edit("deal_stages", args.stageId);
  };

  const handleDeleteStage = (args: { stageId: string }) => {
    deleteStage({
      resource: "deal_stages",
      id: args.stageId,
      successNotification: () => ({
        key: "delete-stage",
        type: "success",
        message: "Successfully deleted stage",
        description: "Successful",
      }),
    });
  };

  const handleAddCard = (args: { stageId: string }) => {
    const path = args.stageId === "unassigned" ? "create" : `create?stageId=${args.stageId}`;
    replace(path);
  };

  const handleClearCards = (args: { dealsIds: string[] }) => {
    updateManyDeal({
      resource: "deals",
      ids: args.dealsIds,
      values: { deal_stage_id: null },
      successNotification: false,
    });
  };

  const getContextMenuItems = (column: DealStageColumn) => {
    const hasItems = column.deals.length > 0;
    const items: MenuProps["items"] = [
      {
        label: "Edit status",
        key: "1",
        icon: <EditOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />,
        onClick: () => handleEditStage({ stageId: column.id }),
      },
      {
        label: "Clear all cards",
        key: "2",
        icon: <ClearOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />,
        disabled: !hasItems,
        onClick: () => handleClearCards({ dealsIds: column.deals.map((deal) => deal.id) }),
      },
      {
        danger: true,
        label: "Delete status",
        key: "3",
        icon: <DeleteOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />,
        disabled: hasItems,
        onClick: () => handleDeleteStage({ stageId: column.id }),
      },
    ];
    return items;
  };

  if (stagesError) {
    console.error("Error fetching deal stages:", stagesError);
    return <div>Error loading deal stages. Please try again later.</div>;
  }

  if (dealsError) {
    console.error("Error fetching deals:", dealsError);
    return <div>Error loading deals. Please try again later.</div>;
  }

  const loading = isLoadingStages || isLoadingDeals;

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <>
      <KanbanBoard onDragEnd={handleOnDragEnd}>
        <KanbanColumn
          id={"unassigned"}
          title={"unassigned"}
          count={stageGrouped.stageUnassigned?.length || 0}
          description={
            <Text size="md" disabled={unassignedStageTotalValue === 0}>
              {currencyNumber(unassignedStageTotalValue)}
            </Text>
          }
          onAddClick={() => handleAddCard({ stageId: "unassigned" })}
        >
          {stageGrouped.stageUnassigned?.map((deal) => (
            <KanbanItem
              key={deal.id}
              id={deal.id}
              data={{ ...deal, deal_stage_id: "unassigned" }}
            >
             <DealKanbanCardMemo
                id={deal.id}
                key={deal.id}
                title={deal.title || 'Untitled Deal'}
                company={{
                  name: deal.company?.name || 'Unknown Company',
                  avatarUrl: deal.company?.avatarUrl as string || '',
                }}
                user={{
                  name: deal.dealOwner?.name || 'Unknown User',
                  avatarUrl: deal.dealOwner?.avatarUrl || '',
                }}
                date={deal.created_at || ''}
                price={currencyNumber(deal.value || 0)}
              />
            </KanbanItem>
          ))}
          {!stageGrouped.stageUnassigned?.length && (
            <KanbanAddCardButton
              onClick={() => handleAddCard({ stageId: "unassigned" })}
            />
          )}
        </KanbanColumn>
        {stageGrouped.stageAll.map((column) => {
          const sum = column.dealsAggregate?.[0]?.sum?.value || 0;
          const contextMenuItems = getContextMenuItems(column);
          return (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              description={
                <Text size="md" disabled={sum === 0}>
                  {currencyNumber(sum)}
                </Text>
              }
              count={column.deals.length}
              contextMenuItems={contextMenuItems}
              onAddClick={() => handleAddCard({ stageId: column.id })}
            >
              {column.deals.map((deal) => (
                <KanbanItem
                  key={deal.id}
                  id={deal.id}
                  data={{ ...deal, deal_stage_id: column.id }}
                >
                  <DealKanbanCardMemo
                    id={deal.id}
                    key={deal.id}
                    title={deal.title || 'Untitled Deal'}
                    company={{
                      name: deal.company?.name || 'Unknown Company',
                      avatarUrl: deal.company?.avatarUrl as string || '',
                    }}
                    user={{
                      name: deal.dealOwner?.name || 'Unknown User',
                      avatarUrl: deal.dealOwner?.avatarUrl || '',
                    }}
                    date={deal.created_at || ''}
                    price={currencyNumber(deal.value || 0)}
                  />
                </KanbanItem>
              ))}
              {!column.deals.length && (
                <KanbanAddCardButton
                  onClick={() => handleAddCard({ stageId: column.id })}
                />
              )}
            </KanbanColumn>
          );
        })}
        <KanbanAddStageButton onClick={handleAddStage} />
        {stageGrouped.stageWon && (
  <KanbanColumn
    key={stageGrouped.stageWon.id}
    id={stageGrouped.stageWon.id}
    title={stageGrouped.stageWon.title}
    description={
      <Text
        size="md"
        disabled={stageGrouped.stageWon.dealsAggregate?.[0]?.sum?.value === 0}
      >
        {currencyNumber(stageGrouped.stageWon.dealsAggregate?.[0]?.sum?.value || 0)}
      </Text>
    }
    count={stageGrouped.stageWon.deals.length}
    variant="solid"
  >
            {stageGrouped.stageWon.deals.map((deal) => (
              <KanbanItem
                key={deal.id}
                id={deal.id}
                data={{
                  ...deal,
                  deal_stage_id: stageGrouped.stageWon?.id,
                }}
              >
                <DealKanbanCardMemo
                  id={deal.id}
                  key={deal.id}
                  title={deal.title || 'Untitled Deal'}
                  company={{
                    name: deal.company?.name || 'Unknown Company',
                    avatarUrl: deal.company?.avatarUrl as string || '',
                  }}
                  user={{
                    name: deal.dealOwner?.name || 'Unknown User',
                    avatarUrl: deal.dealOwner?.avatarUrl || '',
                  }}
                  date={deal.created_at || ''}
                  price={currencyNumber(deal.value || 0)}
                  variant="won"
                />
              </KanbanItem>
            ))}
          </KanbanColumn>
        )}
       {stageGrouped.stageLost && (
  <KanbanColumn
    key={stageGrouped.stageLost.id}
    id={stageGrouped.stageLost.id}
    title={stageGrouped.stageLost.title}
    description={
      <Text
        size="md"
        disabled={stageGrouped.stageLost.dealsAggregate?.[0]?.sum?.value === 0}
      >
        {currencyNumber(stageGrouped.stageLost.dealsAggregate?.[0]?.sum?.value || 0)}
      </Text>
    }
    count={stageGrouped.stageLost.deals.length}
    variant="solid"
  >
            {stageGrouped.stageLost.deals.map((deal) => (
              <KanbanItem
                key={deal.id}
                id={deal.id}
                data={{
                  ...deal,
                  deal_stage_id: stageGrouped.stageLost?.id,
                }}
              >
                <DealKanbanCardMemo
                  id={deal.id}
                  key={deal.id}
                  title={deal.title || 'Untitled Deal'}
                  company={{
                    name: deal.company?.name || 'Unknown Company',
                    avatarUrl: deal.company?.avatarUrl as string || '',
                  }}
                  user={{
                    name: deal.dealOwner?.name || 'Unknown User',
                    avatarUrl: deal.dealOwner?.avatarUrl || '',
                  }}
                  date={deal.created_at || ''}
                  price={currencyNumber(deal.value || 0)}
                  variant="lost"
                />
              </KanbanItem>
            ))}
          </KanbanColumn>
        )}
        <DealKanbanWonLostDrop />
      </KanbanBoard>
      {children}
    </>
  );
};

const PageSkeleton = () => {
  const columnCount = 5;
  const itemCount = 4;

  return (
   <KanbanBoardSkeleton>
      {Array.from({ length: columnCount }).map((_, index) => (
        <KanbanColumnSkeleton key={index} type="deal">
          {Array.from({ length: itemCount }).map((_, index) => (
            <DealKanbanCardSkeleton key={index} />
          ))}
        </KanbanColumnSkeleton>
      ))}
     <KanbanAddStageButton disabled />
      <KanbanColumnSkeleton type="deal" variant="solid">
        {Array.from({ length: itemCount }).map((_, index) => (
          <DealKanbanCardSkeleton key={index} />
        ))}
      </KanbanColumnSkeleton>
      <KanbanColumnSkeleton type="deal" variant="solid">
        {Array.from({ length: itemCount }).map((_, index) => (
          <DealKanbanCardSkeleton key={index} />
        ))}
      </KanbanColumnSkeleton>
    </KanbanBoardSkeleton>
  );
};