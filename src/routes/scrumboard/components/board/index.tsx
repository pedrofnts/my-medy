import { FC, PropsWithChildren, useState } from "react";

import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { SalesFinalizeDeal } from "../../sales/finalize-deal";
import styles from "./index.module.css";

type Props = {
  onDragEnd: (event: DragEndEvent) => void;
};

export const KanbanBoard: FC<PropsWithChildren<Props>> = ({
  onDragEnd,
  children,
}) => {
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [currentDealId, setCurrentDealId] = useState<number | null>(null);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      distance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.over === null) {
      return;
    }

    if (event.over.id === "LOST") {
      const dealId = Number(event.active.id);
      if (!isNaN(dealId)) {
        setCurrentDealId(dealId);
        setShowFinalizeModal(true);
      } else {
        console.error('Invalid deal ID:', event.active.id);
      }
    }

    onDragEnd(event);
  };

  const handleCloseModal = () => {
    setShowFinalizeModal(false);
    setCurrentDealId(null);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
          {children}
        </DndContext>
      </div>
      {showFinalizeModal && currentDealId !== null && (
        <SalesFinalizeDeal 
          dealId={currentDealId} 
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export const KanbanBoardSkeleton: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>{children}</div>
    </div>
  );
};
