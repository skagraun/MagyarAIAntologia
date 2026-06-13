import { desc } from "drizzle-orm";
import { db } from "@/db";
import { wishlist as wishlistTable } from "@/db/schema";
import { formatHuDate } from "@/lib/utils";
import { feasibleLabel, feasibleVariant } from "@/lib/labels";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { YoutubeLink } from "@/components/media";
import { DeleteButton } from "@/components/delete-button";
import { WishlistFormDialog } from "@/components/wishlist/wishlist-form-dialog";
import { deleteWishlistItem } from "@/lib/actions/wishlist";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const items = await db
    .select()
    .from(wishlistTable)
    .orderBy(desc(wishlistTable.createdAt));

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

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ki kérte</TableHead>
              <TableHead>Mikor</TableHead>
              <TableHead>Szerző</TableHead>
              <TableHead>Cím</TableHead>
              <TableHead>Elkészíthető?</TableHead>
              <TableHead>Publikálva</TableHead>
              <TableHead>YouTube</TableHead>
              <TableHead className="text-right">Műveletek</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  Még nincs kívánság rögzítve.
                </TableCell>
              </TableRow>
            )}
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.requestedBy}</TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatHuDate(item.requestedAt)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.author ?? "—"}
                </TableCell>
                <TableCell>{item.title}</TableCell>
                <TableCell>
                  <Badge variant={feasibleVariant[item.feasible]}>
                    {feasibleLabel[item.feasible]}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatHuDate(item.publishedDate)}
                </TableCell>
                <TableCell>
                  <YoutubeLink ytId={item.ytId} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-0.5">
                    <WishlistFormDialog
                      item={{
                        id: item.id,
                        requestedBy: item.requestedBy,
                        requestedAt: item.requestedAt,
                        author: item.author,
                        title: item.title,
                        feasible: item.feasible,
                        publishedDate: item.publishedDate,
                        ytId: item.ytId,
                      }}
                    />
                    <DeleteButton
                      id={item.id}
                      action={deleteWishlistItem}
                      label="Kérés törlése"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
