import { FC, PropsWithChildren, useMemo, useState } from "react";

import { useDelete, useList, useNavigation, useUpdate, useUpdateMany } from "@refinedev/core";

import { ClearOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import type { DragEndEvent } from "@dnd-kit/core";
import type { MenuProps } from "antd";

import { Text } from "@/components";
import { currencyNumber } from "@/utilities";

import {
  DealKanbanCardMemo,
  DealKanbanCardSkeleton,
  DealKanbanWonLostDrop,
  KanbanAddCardButton,
  KanbanAddStageButton,
  KanbanBoard,
  KanbanBoardSkeleton,
  KanbanColumn,
  KanbanColumnSkeleton,
  KanbanItem
} from "../components";
import { SalesCreateStage } from "./create-stage"; // Ajuste o caminho conforme necessário

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
  stage_id: string | null;
  company: { id: string; name: string; avatar_url: string };
  deal_owner: { id: string; name: string; avatar_url: string };
};

type DealStageColumn = DealStage & { deals: Deal[] };

export const SalesPage: FC<PropsWithChildren> = ({ children }) => {
  const { replace, edit } = useNavigation();
  const { mutate: updateDeal } = useUpdate();
  const { mutate: updateManyDeal } = useUpdateMany();
  const { mutate: deleteStage } = useDelete();
  const [isCreateStageModalVisible, setIsCreateStageModalVisible] = useState(false);

  const { data: stages, isLoading: isLoadingStages } = useList<DealStage>({
    resource: "deal_stages",
    pagination: { mode: "off" },
    sorters: [{ field: "created_at", order: "asc" }],
  });

  const { data: deals, isLoading: isLoadingDeals } = useList<Deal>({
    resource: "deals",
    sorters: [{ field: "created_at", order: "asc" }],
    filters: [{ field: "created_at", operator: "gte", value: lastMonthISO }],
    queryOptions: { enabled: !!stages },
    pagination: { mode: "off" },
    metaData: {
      select: `
        id,
        title,
        value,
        created_at,
        stage_id,
        company:companies (id, name, avatar_url),
        deal_owner:sales_owners (id, name, avatar_url)
      `
    }
  });

  const stageGrouped = useMemo(() => {
    if (!stages?.data || !deals?.data) return { stageUnassigned: [], stageAll: [], stageWon: null, stageLost: null };

    const stageUnassigned = deals.data.filter((deal) => deal.stage_id === null);
    const grouped = stages.data.map((stage) => {
      const stageDeals = deals.data.filter((deal) => deal.stage_id === stage.id);
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

  const unassignedStageTotalValue = useMemo(() =>
    stageGrouped.stageUnassigned.reduce((sum, deal) => sum + (deal.value || 0), 0),
  [stageGrouped.stageUnassigned]);

  const handleOnDragEnd = (event: DragEndEvent) => {
    let stageId = event.over?.id as undefined | string | null;
    const dealId = event.active.id;
    const dealStageId = event.active.data.current?.stage_id;

    if (dealStageId === stageId) return;

    if (stageId === "won") stageId = stageGrouped.stageWon?.id;
    if (stageId === "lost") stageId = stageGrouped.stageLost?.id;
    if (stageId === "unassigned") stageId = null;

    updateDeal(
      {
        resource: "deals",
        id: dealId,
        values: { stage_id: stageId },
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
    setIsCreateStageModalVisible(true);
  };

  const handleEditStage = (stageId: string) => edit("deal_stages", stageId);

  const handleDeleteStage = (stageId: string) => {
    deleteStage({
      resource: "deal_stages",
      id: stageId,
      successNotification: () => ({
        key: "delete-stage",
        type: "success",
        message: "Successfully deleted stage",
        description: "Successful",
      }),
    });
  };

  const handleAddCard = (stageId: string) => {
    const path = stageId === "unassigned" ? "create" : `create?stageId=${stageId}`;
    replace(path);
  };

  const handleClearCards = (dealsIds: string[]) => {
    updateManyDeal({
      resource: "deals",
      ids: dealsIds,
      values: { stage_id: null },
      successNotification: false,
    });
  };

  const getContextMenuItems = (column: DealStageColumn): MenuProps["items"] => [
    {
      label: "Edit status",
      key: "1",
      icon: <EditOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />,
      onClick: () => handleEditStage(column.id),
    },
    {
      label: "Clear all cards",
      key: "2",
      icon: <ClearOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />,
      disabled: column.deals.length === 0,
      onClick: () => handleClearCards(column.deals.map((deal) => deal.id)),
    },
    {
      danger: true,
      label: "Delete status",
      key: "3",
      icon: <DeleteOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />,
      disabled: column.deals.length > 0,
      onClick: () => handleDeleteStage(column.id),
    },
  ];

  if (isLoadingStages || isLoadingDeals) {
    return <PageSkeleton />;
  }

  return (
    <>
      <KanbanBoard onDragEnd={handleOnDragEnd}>
        <KanbanColumn
          id="unassigned"
          title="unassigned"
          count={stageGrouped.stageUnassigned.length}
          description={
            <Text size="md" disabled={unassignedStageTotalValue === 0}>
              {currencyNumber(unassignedStageTotalValue)}
            </Text>
          }
          onAddClick={() => handleAddCard("unassigned")}
        >
          {stageGrouped.stageUnassigned.map((deal) => (
            <KanbanItem
              key={deal.id}
              id={deal.id}
              data={{ ...deal, stage_id: "unassigned" }}
            >
              <DealKanbanCardMemo
                id={deal.id}
                title={deal.title || 'Untitled Deal'}
                company={{
                  name: deal.company?.name || 'Unknown Company',
                  avatarUrl: deal.company?.avatar_url || '',
                }}
                user={{
                  name: deal.deal_owner?.name || 'Unknown User',
                  avatarUrl: deal.deal_owner?.avatar_url || '',
                }}
                date={deal.created_at || ''}
                price={currencyNumber(deal.value || 0)}
              />
            </KanbanItem>
          ))}
          {stageGrouped.stageUnassigned.length === 0 && (
            <KanbanAddCardButton onClick={() => handleAddCard("unassigned")} />
          )}
        </KanbanColumn>
        {stageGrouped.stageAll.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            description={
              <Text size="md" disabled={column.dealsAggregate?.[0]?.sum?.value === 0}>
                {currencyNumber(column.dealsAggregate?.[0]?.sum?.value || 0)}
              </Text>
            }
            count={column.deals.length}
            contextMenuItems={getContextMenuItems(column)}
            onAddClick={() => handleAddCard(column.id)}
          >
            {column.deals.map((deal) => (
              <KanbanItem
                key={deal.id}
                id={deal.id}
                data={{ ...deal, stage_id: column.id }}
              >
                <DealKanbanCardMemo
                  id={deal.id}
                  title={deal.title || 'Untitled Deal'}
                  company={{
                    name: deal.company?.name || 'Unknown Company',
                    avatarUrl: deal.company?.avatar_url || '',
                  }}
                  user={{
                    name: deal.deal_owner?.name || 'Unknown User',
                    avatarUrl: deal.deal_owner?.avatar_url || '',
                  }}
                  date={deal.created_at || ''}
                  price={currencyNumber(deal.value || 0)}
                />
              </KanbanItem>
            ))}
            {column.deals.length === 0 && (
              <KanbanAddCardButton onClick={() => handleAddCard(column.id)} />
            )}
          </KanbanColumn>
        ))}
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
                  stage_id: stageGrouped.stageWon?.id,
                }}
              >
                <DealKanbanCardMemo
                  id={deal.id}
                  title={deal.title || 'Untitled Deal'}
                  company={{
                    name: deal.company?.name || 'Unknown Company',
                    avatarUrl: deal.company?.avatar_url || '',
                  }}
                  user={{
                    name: deal.deal_owner?.name || 'Unknown User',
                    avatarUrl: deal.deal_owner?.avatar_url || '',
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
                  stage_id: stageGrouped.stageLost?.id,
                }}
              >
                <DealKanbanCardMemo
                  id={deal.id}
                  title={deal.title || 'Untitled Deal'}
                  company={{
                    name: deal.company?.name || 'Unknown Company',
                    avatarUrl: deal.company?.avatar_url || '',
                  }}
                  user={{
                    name: deal.deal_owner?.name || 'Unknown User',
                    avatarUrl: deal.deal_owner?.avatar_url || '',
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
      <SalesCreateStage
        visible={isCreateStageModalVisible}
        onCancel={() => setIsCreateStageModalVisible(false)}
      />
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
