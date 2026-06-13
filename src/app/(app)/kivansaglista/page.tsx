import { desc } from "drizzle-orm";
import { db } from "@/db";
import { wishlist as wishlistTable } from "@/db/schema";
import { WishlistFormDialog } from "@/components/wishlist/wishlist-form-dialog";
import { WishlistList } from "@/components/wishlist/wishlist-list";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const items = await db
    .select()
    .from(wishlistTable)
    .orderBy(desc(wishlistTable.createdAt));

  const data = items.map((item) => ({
    id: item.id,
    requestedBy: item.requestedBy,
    requestedAt: item.requestedAt,
    author: item.author,
    title: item.title,
    feasible: item.feasible,
    publishedDate: item.publishedDate,
    ytId: item.ytId,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Kívánságlista</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} beérkezett kérés
          </p>
        </div>
        <WishlistFormDialog />
      </div>

      <WishlistList items={data} />
    </div>
  );
}
