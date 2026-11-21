"use client";

import { useRouter } from "next/navigation";
import { PackagePlus } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import EquipmentFormModal from "@/components/dashboard/EquipmentFormModal";
import EmptyState from "@/components/EmptyState";

/**
 * Owner dashboard route 1: Add Equipment.
 * The shared listing form opens straight away; closing or saving returns the
 * owner to "My Equipment" where the new listing waits in the admin queue.
 */
export default function AddEquipmentPage() {
  const router = useRouter();

  const goToListings = () => router.push("/dashboard/owner/equipment");

  return (
    <div>
      <PageHeader
        title="Add Equipment"
        subtitle="List a new item for rent — it stays pending until an admin approves it."
      />

      <EmptyState
        icon={<PackagePlus className="size-6" />}
        title="Create a new listing"
        description="Fill in the details, upload a photo and submit. You can track the approval status from My Equipment."
        action={
          <button type="button" className="ui-button ui-button-primary font-bold" onClick={goToListings}>
            Back to My Equipment
          </button>
        }
      />

      <EquipmentFormModal onClose={goToListings} onSaved={() => goToListings()} />
    </div>
  );
}
