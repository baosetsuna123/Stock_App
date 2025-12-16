import { headers } from "next/headers";
import { redirect } from "next/navigation";
import WatchlistGrid from "@/components/WatchlistGrid";
import { auth } from "@/lib/better-auth/auth";
import { getWatchlistWithQuotes } from "@/lib/actions/watchlist.actions";

export default async function WatchlistPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const items = await getWatchlistWithQuotes(session.user.email);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-100">Your Watchlist</h1>
          <p className="text-sm text-gray-500">Quickly review the stocks you are tracking.</p>
        </div>
      </div>

      <WatchlistGrid initialItems={items} userEmail={session.user.email} />
    </div>
  );
}

