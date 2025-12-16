'use server';

'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';
import { fetchJSON } from '@/lib/actions/finnhub.actions';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

type DbUser = { _id?: unknown; id?: string; email?: string; name?: string };

const resolveUserId = async (email: string): Promise<string | null> => {
  if (!email) return null;
  const mongoose = await connectToDatabase();
  const db = mongoose.connection.db;
  if (!db) throw new Error('MongoDB connection not found');

  const user = await db.collection<DbUser>('user').findOne({ email });
  if (!user) return null;

  return (user.id as string) || String(user._id || '');
};

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
  try {
    const userId = await resolveUserId(email);
    if (!userId) return [];

    const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error('getWatchlistSymbolsByEmail error:', err);
    return [];
  }
}

export async function getWatchlistItemsByEmail(email: string): Promise<WatchlistEntry[]> {
  try {
    const userId = await resolveUserId(email);
    if (!userId) return [];

    const items = await Watchlist.find({ userId }, { symbol: 1, company: 1, addedAt: 1 }).sort({ addedAt: -1 }).lean();
    return items.map((i) => ({
      symbol: String(i.symbol),
      company: String(i.company),
      addedAt: i.addedAt ? new Date(i.addedAt) : undefined,
    }));
  } catch (err) {
    console.error('getWatchlistItemsByEmail error:', err);
    return [];
  }
}

export async function addToWatchlist(params: { email: string; symbol: string; company: string }) {
  const { email, symbol, company } = params;
  if (!email || !symbol || !company) return { success: false, error: 'Missing required fields' };

  try {
    const userId = await resolveUserId(email);
    if (!userId) return { success: false, error: 'User not found' };

    const upperSymbol = symbol.toUpperCase().trim();

    await Watchlist.findOneAndUpdate(
      { userId, symbol: upperSymbol },
      { symbol: upperSymbol, company: company.trim(), userId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return { success: true };
  } catch (err) {
    console.error('addToWatchlist error:', err);
    return { success: false, error: 'Failed to add to watchlist' };
  }
}

export async function removeFromWatchlist(params: { email: string; symbol: string }) {
  const { email, symbol } = params;
  if (!email || !symbol) return { success: false, error: 'Missing required fields' };

  try {
    const userId = await resolveUserId(email);
    if (!userId) return { success: false, error: 'User not found' };

    const upperSymbol = symbol.toUpperCase().trim();
    await Watchlist.deleteOne({ userId, symbol: upperSymbol });

    return { success: true };
  } catch (err) {
    console.error('removeFromWatchlist error:', err);
    return { success: false, error: 'Failed to remove from watchlist' };
  }
}

export async function getWatchlistWithQuotes(email: string): Promise<WatchlistStockCard[]> {
  try {
    const items = await getWatchlistItemsByEmail(email);
    if (!items.length) return [];

    const token = process.env.FINNHUB_API_KEY ?? process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!token) {
      console.error('FINNHUB API key is not configured');
      return items.map((i) => ({
        ...i,
        price: null,
        change: null,
        changePercent: null,
      }));
    }

    const quotes = await Promise.all(
      items.map(async (item) => {
        try {
          const url = `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(item.symbol)}&token=${token}`;
          const data = await fetchJSON<{ c?: number; d?: number; dp?: number }>(url, 120);
          return {
            symbol: item.symbol,
            price: data?.c ?? null,
            change: data?.d ?? null,
            changePercent: data?.dp ?? null,
          };
        } catch (err) {
          console.error('getWatchlistWithQuotes quote error:', item.symbol, err);
          return {
            symbol: item.symbol,
            price: null,
            change: null,
            changePercent: null,
          };
        }
      })
    );

    return items.map((i) => {
      const quote = quotes.find((q) => q.symbol === i.symbol);
      return {
        symbol: i.symbol,
        company: i.company,
        addedAt: i.addedAt,
        price: quote?.price ?? null,
        change: quote?.change ?? null,
        changePercent: quote?.changePercent ?? null,
      };
    });
  } catch (err) {
    console.error('getWatchlistWithQuotes error:', err);
    return [];
  }
}
