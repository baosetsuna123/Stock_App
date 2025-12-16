"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { removeFromWatchlist } from "@/lib/actions/watchlist.actions";

type Props = {
  initialItems: WatchlistStockCard[];
  userEmail: string;
};

const formatChange = (value: number | null) => {
  if (value === null || value === undefined) return "—";
  const fixed = value.toFixed(2);
  return value > 0 ? `+${fixed}` : fixed;
};

const formatDate = (date?: Date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function WatchlistGrid({ initialItems, userEmail }: Props) {
  const [items, setItems] = useState<WatchlistStockCard[]>(initialItems);
  const [isPending, startTransition] = useTransition();

  const handleRemove = (symbol: string) => {
    startTransition(async () => {
      const prev = items;
      setItems((curr) => curr.filter((i) => i.symbol !== symbol));

      const res = await removeFromWatchlist({ email: userEmail, symbol });
      if (!res?.success) {
        setItems(prev);
        toast.error(res?.error || "Failed to remove from watchlist");
        return;
      }
      toast.success(`${symbol} removed from watchlist`);
    });
  };

  if (!items.length) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-900/40 p-6 text-center">
        <p className="text-lg font-semibold text-gray-200">Your watchlist is empty</p>
        <p className="text-sm text-gray-500 mt-2">Add stocks from the Search or Stock pages.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const change = item.change ?? 0;
        const changePct = item.changePercent ?? 0;
        const isUp = change > 0;
        const isFlat = change === 0;

        return (
          <div key={item.symbol} className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Link href={`/stocks/${item.symbol}`} className="text-xl font-semibold text-gray-100 hover:text-yellow-500">
                    {item.symbol}
                  </Link>
                  <span className="text-sm text-gray-500">{formatDate(item.addedAt)}</span>
                </div>
                <Link href={`/stocks/${item.symbol}`} className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
                  {item.company}
                </Link>
              </div>
              <button
                onClick={() => handleRemove(item.symbol)}
                disabled={isPending}
                className="text-gray-400 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-gray-800"
                aria-label={`Remove ${item.symbol} from watchlist`}
                title={`Remove ${item.symbol}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 4v6m4-6v6m4-6v6" />
                </svg>
              </button>
            </div>

            <Link href={`/stocks/${item.symbol}`} className="mt-4 block">
              <div className="flex items-end gap-3">
                <div>
                  <div className="text-2xl font-semibold text-gray-50">
                    {item.price !== null && item.price !== undefined ? `$${item.price.toFixed(2)}` : "—"}
                  </div>
                  <div className="text-xs text-gray-500">Latest price</div>
                </div>
                <div
                  className={`text-sm font-semibold ${
                    isFlat ? "text-gray-400" : isUp ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {formatChange(change)} ({formatChange(changePct)}%)
                </div>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}

