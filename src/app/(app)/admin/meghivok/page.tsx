import { desc } from "drizzle-orm";
import { db } from "@/db";
import { inviteCodes, users as usersTable } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { formatHuDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import { DeleteButton } from "@/components/delete-button";
import { InviteCreateForm } from "@/components/invites/invite-create-form";
import { deleteInvite } from "@/lib/actions/invites";

export const dynamic = "force-dynamic";

export default async function InvitesPage() {
  await requireAdmin();

  const [invites, users] = await Promise.all([
    db.select().from(inviteCodes).orderBy(desc(inviteCodes.createdAt)),
    db
      .select({ id: usersTable.id, name: usersTable.name, email: usersTable.email })
      .from(usersTable),
  ]);

  const userMap = new Map(users.map((u) => [u.id, u]));
  const now = Date.now();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Meghívók</h1>
        <p className="text-sm text-muted-foreground">
          Zárt regisztráció — csak érvényes meghívókóddal lehet fiókot
          létrehozni.
        </p>
      </div>

      <InviteCreateForm />

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kód</TableHead>
              <TableHead>Korlátozás</TableHead>
              <TableHead>Állapot</TableHead>
              <TableHead>Felhasználta</TableHead>
              <TableHead>Lejárat</TableHead>
              <TableHead>Létrehozva</TableHead>
              <TableHead className="text-right">Műveletek</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invites.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  Még nincs meghívó. Hozz létre egyet fent.
                </TableCell>
              </TableRow>
            )}
            {invites.map((inv) => {
              const used = Boolean(inv.usedByUserId);
              const expired =
                !used && inv.expiresAt && inv.expiresAt.getTime() < now;
              const usedBy = inv.usedByUserId
                ? userMap.get(inv.usedByUserId)
                : null;

              return (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono font-medium">
                    <div className="flex items-center gap-1">
                      {inv.code}
                      {!used && <CopyButton value={inv.code} />}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {inv.email ?? "—"}
                  </TableCell>
                  <TableCell>
                    {used ? (
                      <Badge variant="secondary">Felhasználva</Badge>
                    ) : expired ? (
                      <Badge variant="destructive">Lejárt</Badge>
                    ) : (
                      <Badge variant="success">Aktív</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {usedBy ? `${usedBy.name} (${usedBy.email})` : "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {inv.expiresAt ? formatHuDate(inv.expiresAt) : "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatHuDate(inv.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DeleteButton
                      id={inv.id}
                      action={deleteInvite}
                      label="Meghívó törlése"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
